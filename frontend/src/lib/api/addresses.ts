import { fetchApi } from './client';

export interface Address {
  id: string;
  full_address: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface CreateAddressRequest {
  full_address: string;
  lat: number;
  lng: number;
  is_default?: boolean;
}

export async function getMyAddresses(): Promise<{ items: Address[] }> {
  return fetchApi('/customers/me/addresses');
}

export async function createAddress(data: CreateAddressRequest): Promise<Address> {
  return fetchApi('/customers/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
