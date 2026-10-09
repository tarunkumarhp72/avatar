import { fetchApi } from './client';

export interface CreateBookingRequest {
  category_id: string;
  address_id: string;
  scheduled_time: string; // ISO datetime
  problem_description: string;
}

export interface BookingResponse {
  id: string;
  customer_id: string;
  category_id: string;
  address_id: string;
  status: string;
  scheduled_time: string;
  problem_description: string;
  created_at: string;
}

export async function createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
  return fetchApi('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyBookings(): Promise<{ items: BookingResponse[] }> {
  return fetchApi('/bookings');
}

export async function getBookingById(id: string): Promise<BookingResponse> {
  return fetchApi(`/bookings/${id}`);
}
