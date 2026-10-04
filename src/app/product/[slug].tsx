import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton, Loading, Notice, ProductPhoto, ShopShell, ui } from '../../components/ShopUI';
import { product, addItem } from '../../lib/shop';
import { money } from '../../lib/theme';
import type { Product } from '../../lib/types';
import { useAuth } from '../../providers/AuthProvider';

export default function ProductDetails() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    product(slug).then((value) => { if (active) setItem(value); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  async function add() {
    if (!user) { router.push('/login'); return; }
    if (!item) return;
    setBusy(true); setError('');
    try { await addItem(user.id, item); router.push('/cart'); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  return <ShopShell>
    <Text style={ui.kicker}>THE COLLECTION / {item?.category.toUpperCase() ?? 'PRODUCT'}</Text>
    {loading && <Loading />}
    {!!error && <Notice error>{error}</Notice>}
    {!loading && !item && !error && <Notice>This product is unavailable.</Notice>}
    {item && <>
      <ProductPhoto item={item} />
      <Text style={ui.title}>{item.name}</Text>
      <Text style={{ color: '#202724', fontSize: 24, fontWeight: '700' }}>{money(item.price_kobo)}</Text>
      <Text style={ui.bodyText}>{item.description}</Text>
      <View style={{ gap: 8 }}>{item.details.map((detail) => <Text style={ui.bodyText} key={detail}>•  {detail}</Text>)}</View>
      <ActionButton title={busy ? 'Adding...' : item.stock ? 'Add to cart  ↗' : 'Out of stock'} disabled={busy || !item.stock} onPress={add} />
      <Notice>Checkout creates a demo order. No payment is collected.</Notice>
    </>}
  </ShopShell>;
}
