import * as Crypto from 'expo-crypto';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ActionButton, Loading, Notice, ShopShell, ui } from '../components/ShopUI';
import { cart, placeOrder } from '../lib/shop';
import { color, money } from '../lib/theme';
import { useAuth } from '../providers/AuthProvider';

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Keep one key for all retries so a repeated tap cannot create a second order.
  const orderKey = useRef(Crypto.randomUUID());

  useFocusEffect(useCallback(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    cart(user.id).then((rows) => {
      if (active) {
        setTotal(rows.reduce((sum, row) => sum + row.product.price_kobo * row.quantity, 0));
        setCount(rows.reduce((sum, row) => sum + row.quantity, 0));
      }
    }).catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]));

  async function submit() {
    if (!user || busy) return;
    if (name.trim().length < 2 || phone.trim().length < 6 || address.trim().length < 5 || city.trim().length < 2) {
      setError('Please complete your name, phone, address and city.'); return;
    }
    setBusy(true); setError('');
    try {
      await placeOrder({ name, phone, address, city, idempotencyKey: orderKey.current });
      router.replace('/orders');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  return <ShopShell>
    <Text style={ui.kicker}>STEP 02 / 02</Text>
    <Text style={ui.title}>Checkout.</Text>
    {authLoading || loading ? <Loading /> : !user ? <ActionButton title="Sign in to continue" onPress={() => router.push('/login')} />
      : !count ? <><Notice>Your cart is empty.</Notice><ActionButton title="Back to shop" onPress={() => router.push('/')} /></>
      : <>
        <Notice>{count} item{count === 1 ? '' : 's'} · {money(total)}. Final prices and stock are checked by the shop database.</Notice>
        <View style={ui.field}>
          <Text style={ui.fieldLabel}>Full name</Text>
          <TextInput style={ui.input} placeholder="Enter your full name" placeholderTextColor={color.muted} value={name} onChangeText={setName} autoCapitalize="words" accessibilityLabel="Full name" />
        </View>
        <View style={ui.field}>
          <Text style={ui.fieldLabel}>Phone number</Text>
          <TextInput style={ui.input} placeholder="Enter your phone number" placeholderTextColor={color.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" accessibilityLabel="Phone number" />
        </View>
        <View style={ui.field}>
          <Text style={ui.fieldLabel}>Delivery address</Text>
          <TextInput style={ui.input} placeholder="Enter your delivery address" placeholderTextColor={color.muted} value={address} onChangeText={setAddress} accessibilityLabel="Delivery address" />
        </View>
        <View style={ui.field}>
          <Text style={ui.fieldLabel}>City</Text>
          <TextInput style={ui.input} placeholder="Enter your city" placeholderTextColor={color.muted} value={city} onChangeText={setCity} accessibilityLabel="City" />
        </View>
        {!!error && <Notice error>{error}</Notice>}
        <View style={ui.card}><Notice>This places a demo order. It does not collect payment or arrange shipment.</Notice></View>
        <ActionButton title={busy ? 'Saving order...' : 'Place demo order'} disabled={busy} onPress={() => void submit()} />
      </>}
  </ShopShell>;
}
