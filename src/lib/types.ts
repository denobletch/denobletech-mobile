export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  details: string[];
  price_kobo: number;
  stock: number;
  image_position: string;
  active: boolean;
};

export type CartItem = { id: string; product_id: string; quantity: number; product: Product };
export type Order = {
  id: string; user_id: string; customer_name: string; customer_email: string;
  total_kobo: number; status: string; email_status: string; created_at: string;
};
