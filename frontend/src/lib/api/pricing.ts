import { fetchApi } from './client';

export interface PricingEstimateRequest {
  category_id: string;
  lat: number;
  lng: number;
  scheduled_time: string; // ISO datetime
}

export interface PricingEstimateResponse {
  base_fare: number;
  estimated_total: number;
  currency: string;
}

export async function getPricingEstimate(data: PricingEstimateRequest): Promise<PricingEstimateResponse> {
  return fetchApi('/pricing/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
