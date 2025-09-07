export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  link?: string;
  price?: number;
  owner: string;
  isOwned: boolean;
  isBid: boolean;
  personalItem: boolean;
}

export interface User {
  id: string;
  name: string;
  age: number;
  address: string;
  memberSince: string;
  profilePicture: string;
}

export interface CartItem {
  product: Product;
  bidAmount?: number;
  addedAt: Date;
}

export type Page = 'landing' | 'account' | 'cart' | 'post' | 'order' | 'auth';

export interface AppState {
  currentPage: Page;
  user: User | null;
  products: Product[];
  cart: CartItem[];
  myProducts: Product[];
  marketProducts: Product[];
}
