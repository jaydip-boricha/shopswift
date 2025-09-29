import { placeholderImages } from './placeholder-images.json';
import { FieldValue } from 'firebase/firestore';

type ImagePlaceholder = typeof placeholderImages[number];

export type Category = {
  id: string;
  name: string;
  label: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  images: ImagePlaceholder[];
  rating: number;
  reviews: Review[];
  createdAt?: FieldValue;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: ImagePlaceholder;
  quantity: number;
  slug: string;
}

export interface UserProfile {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

export interface Order {
    id: string;
    date: string;
    total: number;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    items: CartItem[];
    userId: string;
    customer: {
      name: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
}
