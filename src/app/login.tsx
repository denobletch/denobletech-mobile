import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { ActionButton, Notice, ShopShell, ui } from '../components/ShopUI';
import { signInWithGoogle } from '../lib/auth';
import { configured } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export default function Login() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signIn() {
    setBusy(true); setError('');
    try { if (await signInWithGoogle()) router.replace('/cart'); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  return <ShopShell>
    <Text style={ui.kicker}>YOUR DENOBLETECH ACCOUNT</Text>
    <Text style={ui.title}>One account. Two ways to shop.</Text>
    <Text style={ui.bodyText}>Use the same Google account as the web shop to see one shared cart and order history.</Text>
    {user ? <><Notice>Signed in as {user.email}</Notice><ActionButton title="Open my cart" onPress={() => router.replace('/cart')} /></>
      : <ActionButton title={busy ? 'Opening Google...' : 'Continue with Google'} disabled={!configured || busy} onPress={signIn} />}
    {!configured && <Notice error>Set the Supabase URL and publishable key in .env.local first.</Notice>}
    {!!error && <Notice error>{error}</Notice>}
  </ShopShell>;
}
