import { Link, router } from 'expo-router';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { color } from '../lib/theme';
import type { Product } from '../lib/types';

export function ShopShell({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const { user } = useAuth();
  return <SafeAreaView style={ui.safe}>
    <View style={ui.topbar}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/')}><Text style={ui.brand}>denoble<Text style={{ color: '#7EAA17' }}>tech.</Text></Text></Pressable>
      <Link href={user ? '/orders' : '/login'} asChild><Pressable accessibilityRole="button"><Text style={ui.headerLink}>{user ? 'Orders' : 'Sign in'}</Text></Pressable></Link>
    </View>
    {scroll ? <ScrollView style={ui.body} contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      : <View style={ui.body}>{children}</View>}
    <View style={ui.tabbar}>
      <NavButton label="Shop" href="/" />
      <NavButton label="Cart" href="/cart" />
      <NavButton label="Orders" href={user ? '/orders' : '/login'} />
    </View>
  </SafeAreaView>;
}

function NavButton({ label, href }: { label: string; href: '/' | '/cart' | '/orders' | '/login' }) {
  return <Link href={href} asChild><Pressable style={ui.navButton} accessibilityRole="button"><Text style={ui.navText}>{label}</Text></Pressable></Link>;
}

export function ActionButton({ title, onPress, disabled, secondary = false }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }}
    onPress={onPress} disabled={disabled} style={[ui.button, secondary && ui.secondary, disabled && ui.disabled]}>
    <Text style={[ui.buttonText, secondary && ui.secondaryText]}>{title}</Text>
  </Pressable>;
}

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <Text accessibilityRole={error ? 'alert' : 'text'} style={[ui.notice, error && { color: color.danger }]}>{children}</Text>;
}

export function Loading() { return <View style={ui.loading}><ActivityIndicator color={color.ink} /></View>; }

export function ProductPhoto({ item, style }: { item: Product; style?: object }) {
  const [width, setWidth] = useState(0);
  const x = item.image_position.startsWith('100%') ? 1 : 0;
  const y = item.image_position.endsWith('100%') ? 1 : 0;
  return <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[ui.photo, style]}>
    {width > 0 && <Image source={require('../../assets/catalog-products.jpg')}
      accessibilityLabel={item.name} resizeMode="stretch"
      style={{ position: 'absolute', width: width * 2, height: width * 2,
        left: -x * width, top: -y * width }} />}
  </View>;
}

export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.paper },
  topbar: { minHeight: 56, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: color.line },
  brand: { fontSize: 23, fontWeight: '800', color: color.ink, letterSpacing: -1.2 },
  headerLink: { color: color.ink, fontWeight: '700', fontSize: 13 },
  body: { flex: 1 },
  content: { padding: 22, paddingBottom: 38, gap: 18 },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: color.line, backgroundColor: color.white, paddingBottom: 6 },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  navText: { fontSize: 13, fontWeight: '700', color: color.ink },
  kicker: { color: color.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '700', color: color.ink, letterSpacing: -1.2 },
  bodyText: { color: color.muted, lineHeight: 22, fontSize: 15 },
  button: { backgroundColor: color.ink, padding: 16, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  buttonText: { color: color.white, fontWeight: '800', fontSize: 15 },
  secondary: { backgroundColor: color.lime },
  secondaryText: { color: color.ink },
  disabled: { opacity: 0.45 },
  notice: { color: color.muted, fontSize: 14, lineHeight: 21 },
  loading: { minHeight: 100, justifyContent: 'center', alignItems: 'center' },
  photo: { backgroundColor: color.surface, width: '100%', aspectRatio: 1, overflow: 'hidden' },
  card: { backgroundColor: color.white, borderWidth: 1, borderColor: color.line, padding: 12, gap: 10 },
  field: { gap: 8 },
  fieldLabel: { color: color.ink, fontSize: 14, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: color.line, backgroundColor: color.white, color: color.ink,
    borderRadius: 4, paddingHorizontal: 14, minHeight: 50, fontSize: 16 },
});
