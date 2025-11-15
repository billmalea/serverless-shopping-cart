export interface CartItem {
  userId: string;
  productId: string;
  quantity: number;
  price?: number;
  addedAt?: string; // ISO timestamp
  updatedAt?: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  body: T | string;
}
