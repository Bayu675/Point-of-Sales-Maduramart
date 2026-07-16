export interface User {
  id?: number;
  name: string;
  role: 'Admin' | 'Cashier';
}

export interface Category {
  id?: number;
  name: string;
}

export interface Product {
  id?: number;
  category_id: number;
  name: string;
  price: number;
}

export interface Transaction {
  id?: number;
  user_id: number;
  transaction_date: string;
  total_amount: number;
}

export interface TransactionDetail {
  id?: number;
  transaction_id: number;
  product_id: number;
  qty: number;
  subtotal: number;
}