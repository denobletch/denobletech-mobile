import { supabase } from './supabase';
import type { CartItem, Order, Product } from './types';

function db() {
  if (!supabase) throw new Error('Supabase is not configured on this phone.');
  return supabase;
}

export async function products(): Promise<Product[]> {
  const { data, error } = await db().from('products').select('*').eq('active', true).order('name');
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function product(slug: string): Promise<Product | null> {
  const { data, error } = await db().from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function cart(userId: string): Promise<CartItem[]> {
  const { data, error } = await db().from('cart_items')
    .select('id, product_id, quantity, products(*)')
    .eq('user_id', userId).order('created_at');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    product_id: row.product_id as string,
    quantity: row.quantity as number,
    product: row.products as unknown as Product,
  }));
}

export async function addItem(userId: string, item: Product) {
  if (!item.active || item.stock < 1) throw new Error('This item is unavailable.');
  const { data: existing, error: readError } = await db().from('cart_items')
    .select('id, quantity').eq('user_id', userId).eq('product_id', item.id).maybeSingle();
  if (readError) throw readError;
  const quantity = (existing?.quantity ?? 0) + 1;
  if (quantity > Math.min(10, item.stock)) throw new Error('That quantity is not available.');
  const result = existing
    ? await db().from('cart_items').update({ quantity }).eq('id', existing.id).eq('user_id', userId)
    : await db().from('cart_items').insert({ user_id: userId, product_id: item.id, quantity: 1 });
  if (result.error) throw result.error;
}

export async function changeItem(userId: string, row: CartItem, delta: number) {
  const next = row.quantity + delta;
  if (next > Math.min(10, row.product.stock)) throw new Error('That quantity is not available.');
  const result = next < 1
    ? await db().from('cart_items').delete().eq('id', row.id).eq('user_id', userId)
    : await db().from('cart_items').update({ quantity: next }).eq('id', row.id).eq('user_id', userId);
  if (result.error) throw result.error;
}

export async function removeItem(userId: string, rowId: string) {
  const { error } = await db().from('cart_items').delete().eq('id', rowId).eq('user_id', userId);
  if (error) throw error;
}

export async function orders(userId: string): Promise<Order[]> {
  const { data, error } = await db().from('orders').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function placeOrder(details: {
  name: string; phone: string; address: string; city: string; idempotencyKey: string;
}): Promise<string> {
  const { data, error } = await db().rpc('place_order', {
    p_customer_name: details.name.trim(), p_phone: details.phone.trim(),
    p_address: details.address.trim(), p_city: details.city.trim(),
    p_idempotency_key: details.idempotencyKey,
  });
  if (error) throw error;
  if (!data) throw new Error('The order was not saved.');
  return data as string;
}
