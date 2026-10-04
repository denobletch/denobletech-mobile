import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Loading, Notice, ProductPhoto, ShopShell, ui } from '../components/ShopUI';
import { cart, changeItem, removeItem } from '../lib/shop';
import { color, money } from '../lib/theme';
import type { CartItem } from '../lib/types';
import { useAuth } from '../providers/AuthProvider';

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (showSpinner = false) => {
    if (!user) { setItems([]); return; }
    if (showSpinner) setRefreshing(true);
    try { setItems(await cart(user.id)); setError(''); }
    catch (e) { setError((e as Error).message); }
    finally { setRefreshing(false); setLoading(false); }
  }, [user]);

  useFocusEffect(useCallback(() => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    void refresh();
    // Also pick up web cart changes while this screen is visible.
    const timer = setInterval(() => { void refresh(); }, 5000);
    return () => clearInterval(timer);
  }, [user, refresh]));

  async function mutate(action: () => Promise<void>) {
    setBusy(true); setError('');
    try { await action(); await refresh(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const total = items.reduce((sum, row) => sum + row.product.price_kobo * row.quantity, 0);
  return <ShopShell scroll={false}>
    <ScrollView contentContainerStyle={ui.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh(true)} />}>
      <Text style={ui.kicker}>YOUR SAVED SELECTION</Text>
      <Text style={ui.title}>Your cart.</Text>
      {authLoading || loading ? <Loading /> : !user ? <>
        <Notice>Sign in with the same Google account as the web shop. Your cart follows your account.</Notice>
        <ActionButton title="Continue with Google" onPress={() => router.push('/login')} />
      </> : <>
        <Notice>Items added on the website appear here. Pull down or tap Refresh cart to sync.</Notice>
        {!!error && <Notice error>{error}</Notice>}
        <ActionButton title="Refresh cart" secondary onPress={() => void refresh(true)} disabled={refreshing || busy} />
        {!items.length && <View style={ui.card}><Notice>Your cart is empty. Explore the collection to get started.</Notice></View>}
        {items.map((row) => <View style={styles.row} key={row.id}>
          <ProductPhoto item={row.product} style={styles.thumb} />
          <View style={styles.details}>
            <Text style={ui.kicker}>{row.product.category.toUpperCase()}</Text>
            <Text style={styles.name}>{row.product.name}</Text>
            <Text style={styles.price}>{money(row.product.price_kobo * row.quantity)}</Text>
            <View style={styles.controls}>
              <Pressable style={styles.qtyButton} accessibilityLabel={`Remove one ${row.product.name}`} disabled={busy}
                onPress={() => void mutate(() => changeItem(user.id, row, -1))}><Text style={styles.qtyText}>−</Text></Pressable>
              <Text style={styles.qtyText}>{row.quantity}</Text>
              <Pressable style={styles.qtyButton} accessibilityLabel={`Add one ${row.product.name}`} disabled={busy}
                onPress={() => void mutate(() => changeItem(user.id, row, 1))}><Text style={styles.qtyText}>+</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${row.product.name}`} disabled={busy}
                onPress={() => void mutate(() => removeItem(user.id, row.id))}><Text style={styles.remove}>Remove</Text></Pressable>
            </View>
          </View>
        </View>)}
        {!!items.length && <View style={ui.card}>
          <View style={styles.total}><Text style={styles.name}>Subtotal</Text><Text style={styles.name}>{money(total)}</Text></View>
          <Notice>Delivery is arranged later. No payment is collected in this demo.</Notice>
          <ActionButton title="Continue to checkout  ↗" onPress={() => router.push('/checkout')} />
        </View>}
      </>}
    </ScrollView>
  </ShopShell>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: color.white, borderWidth: 1, borderColor: color.line, padding: 10, gap: 13 },
  thumb: { width: 94 }, details: { flex: 1, gap: 6 },
  name: { color: color.ink, fontSize: 17, fontWeight: '700' },
  price: { color: color.ink, fontWeight: '700' },
  controls: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 6 },
  qtyButton: { width: 30, height: 30, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: color.ink, fontSize: 17, fontWeight: '700' },
  remove: { color: color.danger, textDecorationLine: 'underline', marginLeft: 6 },
  total: { flexDirection: 'row', justifyContent: 'space-between' },
});
