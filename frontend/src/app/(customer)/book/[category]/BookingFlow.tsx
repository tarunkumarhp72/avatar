'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getMyAddresses, createAddress, Address } from '@/lib/api/addresses';
import { getPricingEstimate, PricingEstimateResponse } from '@/lib/api/pricing';
import { createBooking } from '@/lib/api/bookings';
import { Category } from '@/lib/api/categories';
import styles from './BookingFlow.module.css';

interface BookingFlowProps {
  category: Category;
}

const STEP_TITLES = ['1. Problem', '2. Address', '3. Schedule', '4. Review'];

export default function BookingFlow({ category }: BookingFlowProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
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
      console.error('Failed to load addresses:', err);
    }
  };

  const handleNextToAddress = () => {
    if (!description.trim()) {
      setError('Please describe your job or problem before proceeding.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleNextToSchedule = async () => {
    if (!selectedAddressId && !newAddress.trim()) {
      setError('Please select an existing address or enter a new service location.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (newAddress.trim() && !selectedAddressId) {
        const addr = await createAddress({
          full_address: newAddress,
          lat: 12.9716, // Default area coordinates
          lng: 77.5946,
        });
        setSelectedAddressId(addr.id);
        setAddresses((prev) => [...prev, addr]);
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to save address. Please check your login session.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextToEstimate = async () => {
    if (scheduleType === 'later' && !scheduledTime) {
      setError('Please choose a preferred service date and time.');
      return;
    }

    setError('');
    setLoading(true);

    const finalTime =
      scheduleType === 'now'
        ? new Date(Date.now() + 30 * 60000).toISOString()
        : new Date(scheduledTime).toISOString();

    setScheduledTime(finalTime);

    try {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      if (!selectedAddr) throw new Error('Please select a valid service address.');

      const est = await getPricingEstimate({
        category_id: category.id,
        lat: selectedAddr.lat,
        lng: selectedAddr.lng,
        scheduled_time: finalTime,
      });
      setEstimate(est);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve pricing estimate. Please try again.');
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
        problem_description: description,
      });
      router.push(`/bookings/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please verify your details.');
      setLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : 15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
    exit: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -15, transition: { duration: 0.15 } },
  };

  return (
    <div className={styles.flowCard}>
      {/* 4-Step Progress Indicator */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepIndicators}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`${styles.stepBar} ${
                s === step
                  ? styles.stepBarActive
                  : s < step
                  ? styles.stepBarCompleted
                  : ''
              }`}
            />
          ))}
        </div>
        <div className={styles.stepLabels}>
          {STEP_TITLES.map((title, idx) => (
            <span
              key={title}
              className={idx + 1 === step ? styles.stepLabelActive : undefined}
            >
              {title}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Describe Job */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className={styles.stepHeading}>Describe your service request</h2>
            <p className={styles.stepSubheading}>
              Provide a clear description so your specialist can arrive with the right tools and parts.
            </p>

            <textarea
              className={styles.textareaField}
              rows={4}
              placeholder={`Describe your issue (e.g., Leaking pipe under kitchen sink, water valve replacement...)`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Describe your problem"
            />

            <div className={styles.promptChips}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Quick suggestions:
              </span>
              {['Standard inspection', 'Urgent leak or repair', 'Replacement / Installation', 'General maintenance'].map((hint) => (
                <button
                  key={hint}
                  type="button"
                  className={styles.promptChip}
                  onClick={() => setDescription((prev) => (prev ? `${prev}, ${hint}` : hint))}
                >
                  {hint}
                </button>
              ))}
            </div>

            <div className={styles.actionsRow}>
              <div />
              <Button fullWidth onClick={handleNextToAddress}>
                Continue to Address &rarr;
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Address Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className={styles.stepHeading}>Where is service required?</h2>
            <p className={styles.stepSubheading}>
              Select a saved location or enter a new address for dispatch.
            </p>

            {addresses.length > 0 && (
              <div className={styles.addressList}>
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <label
                      key={addr.id}
                      className={`${styles.addressCard} ${
                        isSelected ? styles.addressCardSelected : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="address_choice"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setNewAddress('');
                        }}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--color-primary)' }}>
                          Saved Location
                        </strong>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          {addr.full_address}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <Input
              label={addresses.length > 0 ? 'Or specify a new location' : 'Service Address'}
              placeholder="House/Apt number, Street, Landmark, City"
              value={newAddress}
              onChange={(e) => {
                setNewAddress(e.target.value);
                setSelectedAddressId('');
              }}
            />

            <div className={styles.actionsRow}>
              <Button variant="secondary" onClick={() => setStep(1)}>
                &larr; Back
              </Button>
              <Button onClick={handleNextToSchedule} isLoading={loading}>
                Continue to Schedule &rarr;
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Scheduling */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className={styles.stepHeading}>When should the pro arrive?</h2>
            <p className={styles.stepSubheading}>
              Choose immediate dispatch or select a preferred appointment slot.
            </p>

            <div className={styles.toggleGrid}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  scheduleType === 'now' ? styles.toggleBtnSelected : ''
                }`}
                onClick={() => setScheduleType('now')}
              >
                <span className={styles.toggleTitle}>As soon as possible</span>
                <span className={styles.toggleDesc}>Dispatched within 30–45 mins</span>
              </button>

              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  scheduleType === 'later' ? styles.toggleBtnSelected : ''
                }`}
                onClick={() => setScheduleType('later')}
              >
                <span className={styles.toggleTitle}>Schedule for later</span>
                <span className={styles.toggleDesc}>Pick a convenient future date</span>
              </button>
            </div>

            {scheduleType === 'later' && (
              <Input
                type="datetime-local"
                label="Appointment Date & Time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            )}

            <div className={styles.actionsRow}>
              <Button variant="secondary" onClick={() => setStep(2)}>
                &larr; Back
              </Button>
              <Button onClick={handleNextToEstimate} isLoading={loading}>
                Get Price Estimate &rarr;
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && estimate && (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className={styles.stepHeading}>Review & Confirm Booking</h2>
            <p className={styles.stepSubheading}>
              Transparent upfront pricing. You will only be charged after the job is completed.
            </p>

            <div className={styles.estimateCard}>
              <div className={styles.estimateRow}>
                <span>Category</span>
                <strong style={{ color: 'var(--color-primary)' }}>{category.name}</strong>
              </div>

              <div className={styles.estimateRow}>
                <span>Base Consultation & Diagnostic</span>
                <strong>
                  {estimate.currency} {(estimate.base_fare / 100).toFixed(2)}
                </strong>
              </div>

              <div className={styles.estimateTotalRow}>
                <span>Estimated Total</span>
                <span className={styles.totalAmount}>
                  {estimate.currency} {(estimate.estimated_total / 100).toFixed(2)}
                </span>
              </div>

              <p className={styles.estimateNotice}>
                &bull; Final charges depend on actual on-site labor and parts authorized by you.
                <br />
                &bull; Protected by Avatar Service Assurance with zero hidden travel charges.
              </p>
            </div>

            <div className={styles.actionsRow}>
              <Button variant="secondary" onClick={() => setStep(3)}>
                &larr; Back
              </Button>
              <Button onClick={handleBook} isLoading={loading}>
                Confirm & Dispatch Pro
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
