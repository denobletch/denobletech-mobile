import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Loading, Notice, ShopShell, ui } from '../../components/ShopUI';
import { createSessionFromUrl } from '../../lib/auth';

export default function Callback() {
  const url = Linking.useLinkingURL();
  const [error, setError] = useState('');
  useEffect(() => {
    if (!url) return;
    createSessionFromUrl(url).then(() => router.replace('/cart'))
      .catch((e: Error) => setError(e.message));
  }, [url]);
  return <ShopShell><Text style={ui.title}>Signing you in</Text>{error ? <Notice error>{error}</Notice> : <Loading />}</ShopShell>;
}
