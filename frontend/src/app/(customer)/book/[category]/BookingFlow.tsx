'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getMyAddresses, createAddress, Address } from '@/lib/api/addresses';
import { getPricingEstimate, PricingEstimateResponse } from '@/lib/api/pricing';
import { createBooking } from '@/lib/api/bookings';
import { Category } from '@/lib/api/categories';

interface BookingFlowProps {
  category: Category;
}

export default function BookingFlow({ category }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [description, setDescription] = useState('');
  
  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState('');
  
  // Schedule
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Estimate
  const [estimate, setEstimate] = useState<PricingEstimateResponse | null>(null);

  useEffect(() => {
    if (step === 2) {
      loadAddresses();
    }
  }, [step]);

  const loadAddresses = async () => {
    try {
      const data = await getMyAddresses();
      setAddresses(data.items || []);
      if (data.items?.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data.items[0].id);
      }
    } catch (err) {
      console.error(err);
      // Might be unauthenticated. Wait, if they are unauthenticated, they shouldn't even reach step 2, 
      // or we should redirect to login.
    }
  };

  const handleNextToAddress = () => {
    if (!description.trim()) {
      setError('Please describe the problem.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleNextToSchedule = async () => {
    if (!selectedAddressId && !newAddress.trim()) {
      setError('Please select or enter an address.');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      if (newAddress.trim() && !selectedAddressId) {
        // Create new address using a dummy lat/lng for now (or a real geocoding API in production)
        const addr = await createAddress({
          full_address: newAddress,
          lat: 12.9716, // Default Bangalore
          lng: 77.5946
        });
        setSelectedAddressId(addr.id);
        setAddresses([...addresses, addr]);
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to save address. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  const handleNextToEstimate = async () => {
    if (scheduleType === 'later' && !scheduledTime) {
      setError('Please select a scheduled time.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const finalTime = scheduleType === 'now' 
      ? new Date(Date.now() + 30 * 60000).toISOString() // 30 mins from now
      : new Date(scheduledTime).toISOString();
      
    setScheduledTime(finalTime);

    try {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddr) throw new Error('Address not found');

      const est = await getPricingEstimate({
        category_id: category.id,
        lat: selectedAddr.lat,
        lng: selectedAddr.lng,
        scheduled_time: finalTime,
      });
      setEstimate(est);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to get estimate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createBooking({
        category_id: category.id,
        address_id: selectedAddressId,
        scheduled_time: scheduledTime,
        problem_description: description
      });
      // Redirect to booking status page
      router.push(`/bookings/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '2rem', textAlign: 'left', width: '100%', maxWidth: '600px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ 
            height: '4px', 
            flex: 1, 
            backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--color-bg)',
            borderRadius: '2px'
          }} />
        ))}
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-error-container, #ffdad6)', color: 'var(--color-error, #ba1a1a)', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Describe your problem</h2>
          <textarea 
            className="base-input w-full" 
            rows={4}
            placeholder={`E.g. Leaking pipe under the sink...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '1rem', resize: 'vertical' }}
          />
          <Button fullWidth onClick={handleNextToAddress} style={{ marginTop: '1rem' }}>
            Next: Address
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Where do you need service?</h2>
          
          {addresses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {addresses.map(addr => (
                <label key={addr.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid var(--color-text-muted)', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedAddressId === addr.id ? 'var(--color-bg)' : 'transparent' }}>
                  <input 
                    type="radio" 
                    name="address" 
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  {addr.full_address}
                </label>
              ))}
            </div>
          )}

          <Input 
            label={addresses.length > 0 ? "Or enter a new address" : "Enter your full address"}
            placeholder="123 Main St, Apt 4B, City"
            value={newAddress}
            onChange={(e) => {
              setNewAddress(e.target.value);
              setSelectedAddressId('');
            }}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button fullWidth onClick={handleNextToSchedule} isLoading={loading}>
              Next: Schedule
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>When do you need it?</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <Button 
              variant={scheduleType === 'now' ? 'primary' : 'secondary'} 
              fullWidth 
              onClick={() => setScheduleType('now')}
            >
              As soon as possible
            </Button>
            <Button 
              variant={scheduleType === 'later' ? 'primary' : 'secondary'} 
              fullWidth 
              onClick={() => setScheduleType('later')}
            >
              Schedule for later
            </Button>
          </div>

          {scheduleType === 'later' && (
            <Input 
              type="datetime-local" 
              label="Select Date & Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button fullWidth onClick={handleNextToEstimate} isLoading={loading}>
              Get Estimate
            </Button>
          </div>
        </div>
      )}

      {step === 4 && estimate && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Review & Confirm</h2>
          
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Base Fare</span>
              <strong>{estimate.currency} {estimate.base_fare / 100}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--color-text-muted)' }}>
              <span>Estimated Total</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{estimate.currency} {estimate.estimated_total / 100}</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Final price may vary based on actual work required.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
            <Button fullWidth onClick={handleBook} isLoading={loading}>
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
