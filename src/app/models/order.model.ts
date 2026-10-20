/** Respuesta cruda del endpoint https://jsonplaceholder.typicode.com/posts */
export interface PostDto {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** Modelo de la aplicación: orden de compra con precio e inventario. */
export interface Order {
  id: number;
  customerId: number;
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  stock: number;
}

export type StockFilter = 'all' | 'critical' | 'ok';
export type SortMode = 'default' | 'price-asc' | 'price-desc';

export interface Invoice {
  order: Order;
  subtotal: number;
  iva: number;
  total: number;
}
