import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton, Loading, Notice, ShopShell, ui } from '../components/ShopUI';
import { orders } from '../lib/shop';
import { supabase } from '../lib/supabase';
import { color, money } from '../lib/theme';
import type { Order } from '../lib/types';
import { useAuth } from '../providers/AuthProvider';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    orders(user.id).then((rows) => { if (active) setItems(rows); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]));

  return <ShopShell>
    <Text style={ui.kicker}>YOUR ACCOUNT</Text>
    <Text style={ui.title}>Your orders.</Text>
    {authLoading || loading ? <Loading /> : !user ? <ActionButton title="Sign in with Google" onPress={() => router.push('/login')} />
      : <>
        <Notice>Signed in as {user.email}</Notice>
        {!!error && <Notice error>{error}</Notice>}
        {!items.length && !error && <Notice>No orders yet. Your web and mobile orders share this history.</Notice>}
        {items.map((item) => <View style={ui.card} key={item.id}>
          <Text style={ui.kicker}>ORDER {item.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={{ color: color.ink, fontSize: 20, fontWeight: '700' }}>{money(item.total_kobo)}</Text>
          <Notice>{new Date(item.created_at).toLocaleDateString()} · {item.status}</Notice>
        </View>)}
        <ActionButton title="Sign out" secondary onPress={() => { void supabase?.auth.signOut().then(() => router.replace('/')); }} />
      </>}
  </ShopShell>;
}
