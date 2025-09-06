// src/services/api.ts
// All methods return Promises so you can later replace stubs with real MongoDB calls.
// Swap internals with fetch/axios to your Node/Express API when ready.

import { Product, User } from '../types';

// ------ AUTH ------

export async function loginAPI(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  // TODO: replace with real call:
  // const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify(payload) })
  // return await res.json();
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id: '1',
          name: payload.name,
          age: 25,
          address: '123 Main St, City, State',
          memberSince: new Date().getFullYear().toString(),
          profilePicture:
            'https://via.placeholder.com/100x100/007AFF/FFFFFF?text=' +
            payload.name.charAt(0).toUpperCase(),
        }),
      300
    )
  );
}

export async function signupAPI(payload: {
  name: string;
  age: number;
  email: string;
  password: string;
  address: string;
}): Promise<User> {
  // TODO: replace with real call to create user in MongoDB.
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id: Date.now().toString(),
          name: payload.name,
          age: payload.age,
          address: payload.address,
          memberSince: new Date().getFullYear().toString(),
          profilePicture:
            'https://via.placeholder.com/100x100/007AFF/FFFFFF?text=' +
            payload.name.charAt(0).toUpperCase(),
        }),
      300
    )
  );
}

export async function updateProfilePictureAPI(userId: string, imageUrl: string): Promise<void> {
  // TODO: update user doc in MongoDB.
  await new Promise((r) => setTimeout(r, 150));
}

// ------ PRODUCTS ------

export type CreateProductInput = Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'>;

export async function fetchProductsAPI(): Promise<Product[]> {
  // TODO: replace with GET /api/products
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: '1',
            name: 'Vintage Camera',
            description: 'Beautiful vintage camera in excellent condition',
            image: 'https://via.placeholder.com/200x200/cccccc/666666?text=Camera',
            price: 299.99,
            owner: '1',
            isOwned: false,
            isBid: false,
          },
          {
            id: '2',
            name: 'Designer Watch',
            description: 'Luxury designer watch with leather strap',
            image: 'https://via.placeholder.com/200x200/cccccc/666666?text=Watch',
            price: 599.99,
            owner: '2',
            isOwned: false,
            isBid: false,
          },
          {
            id: '3',
            name: 'Art Painting',
            description: 'Original oil painting by local artist',
            image: 'https://via.placeholder.com/200x200/cccccc/666666?text=Art',
            price: 199.99,
            owner: '1',
            isOwned: true,
            isBid: false,
          },
        ]),
      250
    )
  );
}

export async function createProductAPI(input: CreateProductInput, ownerId: string): Promise<Product> {
  // TODO: POST /api/products
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ...input,
          id: Date.now().toString(),
          owner: ownerId,
          isOwned: true,
          isBid: false,
        }),
      200
    )
  );
}

export async function getProductByIdAPI(id: string): Promise<Product | null> {
  // TODO: GET /api/products/:id
  const all = await fetchProductsAPI();
  return all.find((p) => p.id === id) ?? null;
}