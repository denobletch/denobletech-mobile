import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Loading, Notice, ProductPhoto, ShopShell, ui } from '../components/ShopUI';
import { configured } from '../lib/supabase';
import { products } from '../lib/shop';
import { color, money } from '../lib/theme';
import type { Product } from '../lib/types';

export default function Shop() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    if (!configured) return;
    let active = true;
    products().then((data) => { if (active) { setItems(data); setError(''); } })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return <ShopShell>
    <View style={styles.hero}>
      <Text style={ui.kicker}>DENOBLETECH OBJECTS / 001</Text>
      <Text style={styles.heroTitle}>Make room for better work.</Text>
      <Text style={styles.heroText}>Objects with purpose for your desk, your ideas and the hours in between.</Text>
    </View>
    <View style={styles.row}><Text style={ui.title}>The collection</Text><Text style={ui.kicker}>{String(items.length).padStart(2, '0')} ITEMS</Text></View>
    {!configured && <Notice>Connect the Supabase project in .env.local to load your shop.</Notice>}
    {loading && <Loading />}
    {!!error && <Notice error>{error}</Notice>}
    {!loading && !error && configured && !items.length && <Notice>No products are available yet.</Notice>}
    <View style={styles.grid}>
      {items.map((item) => <Link key={item.id} href={{ pathname: '/product/[slug]', params: { slug: item.slug } }} asChild>
        <Pressable style={styles.item} accessibilityRole="button" accessibilityLabel={`${item.name}, ${money(item.price_kobo)}`}>
          <ProductPhoto item={item} />
          <Text style={ui.kicker}>{item.category.toUpperCase()}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{money(item.price_kobo)}</Text>
        </Pressable>
      </Link>)}
    </View>
    <Text style={styles.footer}>GOOD TOOLS. GOOD DAYS.</Text>
  </ShopShell>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: color.ink, padding: 24, gap: 15, minHeight: 270, justifyContent: 'center' },
  heroTitle: { color: color.white, fontSize: 37, lineHeight: 42, fontWeight: '700', letterSpacing: -1.6 },
  heroText: { color: '#CBD4CB', fontSize: 15, lineHeight: 23 },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  item: { width: '48%', paddingBottom: 14, gap: 7 },
  name: { fontSize: 16, fontWeight: '700', color: color.ink, minHeight: 42 },
  price: { fontSize: 15, fontWeight: '700', color: color.ink },
  footer: { color: color.muted, letterSpacing: 2, fontWeight: '800', textAlign: 'center', marginTop: 18, fontSize: 11 },
});
