import { makeRedirectUri } from 'expo-auth-session';
import { getQueryParams } from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const redirectTo = makeRedirectUri({ scheme: 'denobletech', path: 'auth/callback' });

export async function createSessionFromUrl(url: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { params, errorCode } = getQueryParams(url);
  if (errorCode) throw new Error(String(params.error_description || errorCode));
  const { access_token, refresh_token, code } = params;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
  } else throw new Error('Google did not return a session.');
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google', options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Could not open Google sign in.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success') { await createSessionFromUrl(result.url); return true; }
  return false;
}
