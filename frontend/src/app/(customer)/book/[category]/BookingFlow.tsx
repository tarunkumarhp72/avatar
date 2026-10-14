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

interface IssueItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  badgeColor?: 'amber' | 'red' | 'default';
  icon: string;
  avgTime: string;
  isEmergency?: boolean;
}

function getCategoryIssues(slug: string, categoryName: string): IssueItem[] {
  if (slug === 'plumber') {
    return [
      {
        id: 'leak',
        name: 'Leaking Pipe or Faucet',
        desc: 'Kitchen sink, bathroom vanity, exposed supply lines or valve drips.',
        badge: 'Most Common',
        badgeColor: 'amber',
        icon: '💧',
        avgTime: '30–60 min avg',
      },
      {
        id: 'clog',
        name: 'Clogged Drain or Sewer',
        desc: 'Standing water in sink, shower drain backup, or slow sewage drainage.',
        badge: 'Fast Clearing',
        badgeColor: 'default',
        icon: '🚿',
        avgTime: '45 min avg',
      },
      {
        id: 'heater',
        name: 'Water Heater Repair / Install',
        desc: 'No hot water, rust-colored water, pilot light issues, or tank leaks.',
        badge: 'Diagnostic Incl.',
        badgeColor: 'default',
        icon: '♨️',
        avgTime: '60–90 min avg',
      },
      {
        id: 'toilet',
        name: 'Toilet Running or Overflow',
        desc: 'Flapper valve replacement, handle chain, base seal wax ring repair.',
        badge: 'Parts on Truck',
        badgeColor: 'default',
        icon: '🚽',
        avgTime: '30–45 min avg',
      },
      {
        id: 'pressure',
        name: 'Low Water Pressure',
        desc: 'Whole house pressure drop, faulty pressure regulator or aerator cleaning.',
        badge: 'Full Inspection',
        badgeColor: 'default',
        icon: '🚰',
        avgTime: '45 min avg',
      },
      {
        id: 'burst',
        name: 'Emergency Pipe Burst / Flooding',
        desc: 'Active water flooding, burst main line, emergency shutoff assistance.',
        badge: 'Priority Dispatch',
        badgeColor: 'red',
        icon: '🚨',
        avgTime: '< 30 min response',
        isEmergency: true,
      },
    ];
  }

  if (slug === 'electrician') {
    return [
      {
        id: 'breaker',
        name: 'Circuit Breaker Tripping',
        desc: 'Frequent trips, overloaded circuits, or sub-panel diagnostic check.',
        badge: 'High Demand',
        badgeColor: 'amber',
        icon: '⚡',
        avgTime: '45 min avg',
      },
      {
        id: 'outlet',
        name: 'Dead Outlet or Flickering Switch',
        desc: 'GFCI outlet replacement, grounded 3-prong install, dimmer switch.',
        badge: 'Standard Fix',
        badgeColor: 'default',
        icon: '🔌',
        avgTime: '30 min avg',
      },
      {
        id: 'fixture',
        name: 'Lighting & Chandelier Install',
        desc: 'Recessed lighting, chandelier mounting, smart switches & dimmers.',
        badge: 'Certified Pro',
        badgeColor: 'default',
        icon: '💡',
        avgTime: '60 min avg',
      },
      {
        id: 'panel',
        name: 'Panel Upgrade / Rewiring',
        desc: 'Main breaker box upgrade, rewiring, surge protection installation.',
        badge: 'Inspection Incl.',
        badgeColor: 'default',
        icon: '🎛️',
        avgTime: '2–3 hours',
      },
      {
        id: 'fan',
        name: 'Ceiling Fan Wiring & Mount',
        desc: 'New bracket mounting, balancing, remote receiver wiring.',
        badge: 'Popular',
        badgeColor: 'default',
        icon: '🌀',
        avgTime: '45 min avg',
      },
      {
        id: 'spark',
        name: 'Sparks or Burning Smell',
        desc: 'Urgent short circuit hazard, burning odor, scorched switch plate.',
        badge: 'Immediate Dispatch',
        badgeColor: 'red',
        icon: '🚨',
        avgTime: '< 30 min response',
        isEmergency: true,
      },
    ];
  }

  return [
    {
      id: 'general',
      name: `Standard ${categoryName} Inspection`,
      desc: 'Comprehensive diagnostic and evaluation by a master trade technician.',
      badge: 'Popular',
      badgeColor: 'amber',
      icon: '🛠️',
      avgTime: '45 min avg',
    },
    {
      id: 'urgent',
      name: 'Urgent Repair & Troubleshooting',
      desc: 'Rapid identification and on-the-spot repair with factory-grade tools.',
      badge: 'Same-Day',
      badgeColor: 'default',
      icon: '⚙️',
      avgTime: '60 min avg',
    },
    {
      id: 'installation',
      name: 'Replacement or New Installation',
      desc: 'Safe, certified removal of old equipment and precision installation.',
      badge: 'Certified',
      badgeColor: 'default',
      icon: '📦',
      avgTime: '1–2 hours',
    },
    {
      id: 'maintenance',
      name: 'Routine Preventative Tune-Up',
      desc: 'Extend equipment lifespan and prevent sudden unexpected breakdowns.',
      badge: 'Recommended',
      badgeColor: 'default',
      icon: '📋',
      avgTime: '45 min avg',
    },
    {
      id: 'custom',
      name: 'Custom Service Scope',
      desc: 'Tailored work plan based on specific architectural or property needs.',
      badge: 'Flexible',
      badgeColor: 'default',
      icon: '🔍',
      avgTime: 'Variable',
    },
    {
      id: 'emergency',
      name: 'Urgent Emergency Request',
      desc: 'Top priority dispatch with certified emergency response crew.',
      badge: 'Priority Dispatch',
      badgeColor: 'red',
      icon: '🚨',
      avgTime: '< 30 min response',
      isEmergency: true,
    },
  ];
}

const STEP_META = [
  { step: 1, tag: 'Step 01', title: 'Problem Diagnosis', sub: 'Select or describe' },
  { step: 2, tag: 'Step 02', title: 'Location & Access', sub: 'Property address' },
  { step: 3, tag: 'Step 03', title: 'Schedule & Time', sub: 'Instant or later' },
  { step: 4, tag: 'Step 04', title: 'Review & Escrow', sub: 'Transparent rate' },
];

export default function BookingFlow({ category }: BookingFlowProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Problem state
  const issues = getCategoryIssues(category.slug, category.name);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [urgency, setUrgency] = useState<'normal' | 'emergency'>('normal');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Step 2: Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Step 3: Schedule state
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledTime, setScheduledTime] = useState('');

  // Step 4: Estimate state
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

  const handleSelectIssue = (issue: IssueItem) => {
    setSelectedIssueId(issue.id);
    if (issue.isEmergency) {
      setUrgency('emergency');
    }
    setDescription((prev) => {
      if (!prev) return issue.name;
      if (!prev.includes(issue.name)) return `${issue.name}. ${prev}`;
      return prev;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const handleNextToAddress = () => {
    if (!description.trim() && !selectedIssueId) {
      setError('Please select an issue type or provide a brief description before proceeding.');
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
          lat: 12.9716,
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
      const lat = selectedAddr?.lat ?? 12.9716;
      const lng = selectedAddr?.lng ?? 77.5946;

      const est = await getPricingEstimate({
        category_id: category.id,
        lat,
        lng,
        scheduled_time: finalTime,
      });
      setEstimate(est);
      setStep(4);
    } catch (err: any) {
      // In case pricing endpoint fails or mock fallback
      setEstimate({
        currency: '₹',
        base_fare: 49900,
        estimated_total: 49900,
        surge_multiplier: 1.0,
      } as any);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const finalDesc = urgency === 'emergency' ? `[URGENT EMERGENCY] ${description}` : description;
      const res = await createBooking({
        category_id: category.id,
        address_id: selectedAddressId || (addresses[0]?.id ?? 'default-addr'),
        scheduled_time: scheduledTime || new Date(Date.now() + 30 * 60000).toISOString(),
        problem_description: finalDesc,
      });
      router.push(`/bookings/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please verify your details.');
      setLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
    exit: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -10, transition: { duration: 0.15 } },
  };

  const selectedAddressObj = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className={styles.wizardGrid}>
      {/* 4-Step Progress Stepper Bar */}
      <div className={styles.stepperWrapper}>
        <div className={styles.stepIndicators}>
          {STEP_META.map((meta) => {
            const isActive = step === meta.step;
            const isCompleted = step > meta.step;
            return (
              <div
                key={meta.step}
                className={`${styles.stepTile} ${
                  isActive ? styles.stepTileActive : isCompleted ? styles.stepTileCompleted : ''
                }`}
              >
                <div
                  className={`${styles.stepIconWrap} ${
                    isActive
                      ? styles.stepIconWrapActive
                      : isCompleted
                      ? styles.stepIconWrapCompleted
                      : styles.stepIconWrapInactive
                  }`}
                >
                  {isCompleted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>{meta.step}</span>
                  )}
                </div>
                <div className={styles.stepMeta}>
                  <div className={`${styles.stepTag} ${isActive ? styles.stepTagActive : ''}`}>
                    {meta.tag}
                  </div>
                  <div className={styles.stepTitle}>{meta.title}</div>
                  <div className={styles.stepSubtitle}>{meta.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEFT COLUMN: Main Form Area */}
      <div className={styles.leftCol}>
        <div className={styles.formCard}>
          {/* Header */}
          <div className={styles.formHeader}>
            <span className={styles.formStepTag}>Step 0{step} of 04</span>
            <h2 className={styles.formHeading}>
              {step === 1 && `What can our licensed ${category.name} solve today?`}
              {step === 2 && 'Where should we dispatch your specialist?'}
              {step === 3 && 'When do you need service at your property?'}
              {step === 4 && 'Review & Lock-In Transparent Pricing'}
            </h2>
            <p className={styles.formSubheading}>
              {step === 1 && 'Select from common verified issues below or describe your custom request.'}
              {step === 2 && 'Choose a saved location or enter a new address for prompt dispatch.'}
              {step === 3 && 'Select immediate priority dispatch or pick a convenient appointment window.'}
              {step === 4 && 'Guaranteed flat-rate pricing. Funds held in safe escrow until you sign off.'}
            </p>
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
            {/* STEP 1: Problem Diagnosis */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* 6 Bento Issue Tiles */}
                <div className={styles.issueGrid}>
                  {issues.map((item) => {
                    const isSelected = selectedIssueId === item.id;
                    const isRed = item.isEmergency;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectIssue(item)}
                        className={`${styles.issueTile} ${
                          isSelected
                            ? isRed
                              ? styles.issueTileEmergencySelected
                              : styles.issueTileSelected
                            : isRed
                            ? styles.issueTileEmergency
                            : ''
                        }`}
                      >
                        <div className={styles.issueTileTop}>
                          <div className={styles.issueIconBadge}>{item.icon}</div>
                          <span
                            className={`${styles.issueBadge} ${
                              item.badgeColor === 'amber'
                                ? styles.issueBadgeAmber
                                : item.badgeColor === 'red'
                                ? styles.issueBadgeRed
                                : ''
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <div className={styles.issueTileName}>{item.name}</div>
                        <div className={styles.issueTileDesc}>{item.desc}</div>
                        <div className={styles.issueTileBottom}>
                          <span className={styles.timePill}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {item.avgTime}
                          </span>
                          <span style={{ color: isSelected ? '#b45309' : '#94a3b8', fontWeight: 700 }}>
                            {isSelected ? '✓ Selected' : 'Select +'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Urgency Toggle Bar */}
                <div className={styles.emergencyBar}>
                  <div className={styles.emergencyLeft}>
                    <div className={styles.emergencyIconWrap}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <div>
                      <div className={styles.emergencyTextTitle}>Is this an active emergency?</div>
                      <div className={styles.emergencyTextSub}>
                        Emergency dispatch bypasses the normal queue for rapid arrival (&lt; 30 min).
                      </div>
                    </div>
                  </div>

                  <div className={styles.toggleButtons}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${urgency === 'normal' ? styles.toggleBtnActive : ''}`}
                      onClick={() => setUrgency('normal')}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${urgency === 'emergency' ? styles.toggleBtnActive : ''}`}
                      onClick={() => setUrgency('emergency')}
                      style={{ color: urgency === 'emergency' ? '#b91c1c' : undefined }}
                    >
                      🚨 Emergency
                    </button>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className={styles.textareaGroup}>
                  <label className={styles.fieldLabel} htmlFor="problem-desc">
                    Describe your problem or scope of work <span className={styles.optionalTag}>(optional details help pros bring exact parts)</span>
                  </label>
                  <textarea
                    id="problem-desc"
                    className={styles.textareaField}
                    placeholder="e.g., Leaking pipe under the kitchen sink, water valve won't shut off, dripping since morning..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  {/* Suggestion Pills */}
                  <div className={styles.suggestionPills}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', alignSelf: 'center' }}>
                      Quick Add:
                    </span>
                    {['Under kitchen sink', 'Main shutoff valve', 'Running constantly', 'Needs new replacement', 'Unusual noise/rattling'].map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        className={styles.suggestionPill}
                        onClick={() => setDescription((prev) => (prev ? `${prev}, ${pill}` : pill))}
                      >
                        + {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Photos / Videos */}
                <label className={styles.dropzone} htmlFor="file-upload">
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <div className={styles.dropzoneIconWrap}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className={styles.dropzoneTitle}>
                    {uploadedFile ? `Attached: ${uploadedFile}` : 'Attach photos or video of the issue (optional)'}
                  </p>
                  <p className={styles.dropzoneSub}>
                    PNG, JPG or MP4 up to 25MB. Enables technician to pre-stock specific pipe diameter or replacement valve.
                  </p>
                </label>

                {/* Action Footer */}
                <div className={styles.actionFooter}>
                  <div />
                  <button
                    type="button"
                    className={styles.primaryCtaBtn}
                    onClick={handleNextToAddress}
                  >
                    Continue to Address &rarr;
                  </button>
                </div>

                <div className={styles.reassuranceText}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Zero commitment until estimate is approved • Certified trade professionals</span>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Location & Address */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {addresses.length > 0 && (
                  <div className={styles.addressList}>
                    {addresses.map((addr, idx) => {
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
                            className={styles.addressRadio}
                            checked={isSelected}
                            onChange={() => {
                              setSelectedAddressId(addr.id);
                              setNewAddress('');
                            }}
                          />
                          <div className={styles.addressDetails}>
                            <div className={styles.addressTitle}>
                              <span>Saved Address {idx + 1}</span>
                              <span className={styles.addressBadge}>Verified</span>
                            </div>
                            <div className={styles.addressText}>{addr.full_address}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className={styles.newAddressDivider}>or enter a different location</div>
                )}

                <Input
                  label={addresses.length > 0 ? 'Specify new service address' : 'Service Address'}
                  placeholder="Apartment, Street Name, Landmark, City & ZIP Code"
                  value={newAddress}
                  onChange={(e) => {
                    setNewAddress(e.target.value);
                    setSelectedAddressId('');
                  }}
                />

                <div className={styles.actionFooter}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setStep(1)}
                  >
                    &larr; Back to Problem
                  </button>
                  <Button onClick={handleNextToSchedule} isLoading={loading}>
                    Continue to Schedule &rarr;
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Scheduling */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={styles.scheduleGrid}>
                  <button
                    type="button"
                    className={`${styles.scheduleOption} ${
                      scheduleType === 'now' ? styles.scheduleOptionSelected : ''
                    }`}
                    onClick={() => setScheduleType('now')}
                  >
                    <div className={styles.scheduleOptionTop}>
                      <div className={styles.scheduleOptionIcon}>⚡</div>
                      <span className={styles.addressBadge} style={{ background: '#dcfce7', color: '#166534' }}>
                        Fastest
                      </span>
                    </div>
                    <div className={styles.scheduleOptionTitle}>Immediate Priority Dispatch</div>
                    <div className={styles.scheduleOptionDesc}>
                      Nearest available technician deployed immediately. Expected arrival within 18–32 minutes.
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`${styles.scheduleOption} ${
                      scheduleType === 'later' ? styles.scheduleOptionSelected : ''
                    }`}
                    onClick={() => setScheduleType('later')}
                  >
                    <div className={styles.scheduleOptionTop}>
                      <div className={styles.scheduleOptionIcon}>📅</div>
                      <span className={styles.addressBadge}>Flexible</span>
                    </div>
                    <div className={styles.scheduleOptionTitle}>Schedule for Later</div>
                    <div className={styles.scheduleOptionDesc}>
                      Select a specific day and 1-hour appointment window that suits your schedule best.
                    </div>
                  </button>
                </div>

                {scheduleType === 'later' && (
                  <div className={styles.datetimePickerBox}>
                    <Input
                      type="datetime-local"
                      label="Select Appointment Date & Time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                )}

                <div className={styles.actionFooter}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setStep(2)}
                  >
                    &larr; Back to Address
                  </button>
                  <Button onClick={handleNextToEstimate} isLoading={loading}>
                    Review Price Estimate &rarr;
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review & Escrow Confirmation */}
            {step === 4 && estimate && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={styles.reviewCard}>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Service Category</span>
                    <span className={styles.reviewVal}>{category.name}</span>
                  </div>

                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Service Address</span>
                    <span className={styles.reviewVal}>
                      {selectedAddressObj ? selectedAddressObj.full_address : newAddress || 'Central Austin Location'}
                    </span>
                  </div>

                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Dispatch Timing</span>
                    <span className={styles.reviewVal}>
                      {scheduleType === 'now' ? 'Immediate Priority (18–32 min)' : new Date(scheduledTime).toLocaleString()}
                    </span>
                  </div>

                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Problem Summary</span>
                    <span className={styles.reviewVal}>
                      {description || 'Standard Inspection & Diagnostic'}
                    </span>
                  </div>

                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>On-site Inspection & Diagnostic</span>
                    <span className={styles.reviewVal} style={{ color: '#059669' }}>FREE with repair</span>
                  </div>

                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Standard Service Deposit</span>
                    <span className={styles.reviewVal}>
                      {estimate.currency} {(estimate.base_fare / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.reviewTotalRow}>
                    <span className={styles.reviewTotalLabel}>Total Escrow Deposit</span>
                    <span className={styles.reviewTotalVal}>
                      {estimate.currency} {(estimate.estimated_total / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.reviewNote}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <div>
                      <strong>Avatar Safe Escrow Assurance:</strong> Your payment is held securely in escrow and only released to the professional once you inspect and approve the completed job with OTP verification.
                    </div>
                  </div>
                </div>

                <div className={styles.actionFooter}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setStep(3)}
                  >
                    &larr; Back to Schedule
                  </button>
                  <Button onClick={handleBook} isLoading={loading}>
                    Confirm & Dispatch Specialist Now &rarr;
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick FAQ Strip */}
        {step === 1 && (
          <div className={styles.quickFaqCard}>
            <div className={styles.faqHeader}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Booking Frequently Asked Questions</span>
            </div>

            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <span className={styles.faqQuestion}>How quickly does the pro arrive?</span>
                For priority requests, the nearest technician on standby is dispatched within 3 minutes and arrives in 18–32 minutes.
              </div>

              <div className={styles.faqItem}>
                <span className={styles.faqQuestion}>How does flat-rate pricing work?</span>
                Initial diagnostic is completely free when repairs are conducted. You approve the final parts and labor total before any work starts.
              </div>

              <div className={styles.faqItem}>
                <span className={styles.faqQuestion}>Are all technicians licensed?</span>
                Every pro carries verified state trade licenses, passes background checks, and is backed by ₹10,000 property damage insurance.
              </div>

              <div className={styles.faqItem}>
                <span className={styles.faqQuestion}>What if I need to cancel?</span>
                Free cancellation up to 10 minutes before technician arrival. 100% immediate escrow refund without questions asked.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Sticky Live Dispatch Radar Sidebar */}
      <div className={styles.rightCol}>
        <div className={styles.sidebarSticky}>
          <div className={styles.radarCard}>
            {/* Radar Header */}
            <div className={styles.radarHeader}>
              <div className={styles.radarBeaconWrap}>
                <span className={styles.radarDot} />
                <span>Live Austin Dispatch Active</span>
              </div>
              <span className={styles.radarZoneBadge}>Zone: Central & Suburbs</span>
            </div>

            {/* Standby Technician Profile */}
            <div className={styles.techBlock}>
              <div className={styles.techLabel}>Available Master Specialist</div>
              <div className={styles.techRow}>
                <div className={styles.techAvatar} aria-hidden="true">
                  👨‍🔧
                </div>
                <div>
                  <h3 className={styles.techName}>Marcus Vance</h3>
                  <p className={styles.techTrade}>Licensed Master {category.name} (12 yrs exp)</p>
                  <div className={styles.techStats}>
                    <span className={styles.techRating}>★ 4.98</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>428 verified jobs</span>
                  </div>
                </div>
              </div>

              <div className={styles.techEtaPill}>
                <div className={styles.techEtaTop}>
                  <span className={styles.standbyIndicator}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Standby nearby (2.4 km away)
                  </span>
                  <span style={{ fontWeight: 700, color: '#334155' }}>Fully Equipped Truck</span>
                </div>
                <div className={styles.techEtaBot}>
                  <span style={{ color: '#64748b' }}>Estimated Dispatch ETA:</span>
                  <span className={styles.etaBold}>18–32 mins</span>
                </div>
              </div>
            </div>

            {/* Upfront Pricing Transparency Breakdown */}
            <div className={styles.pricingBlock}>
              <div className={styles.pricingHeader}>
                <span className={styles.pricingLabel}>Pricing Breakdown</span>
                <span className={styles.guaranteeBadge}>Avatar Flat-Rate</span>
              </div>

              <div className={styles.priceRows}>
                <div className={styles.priceRow}>
                  <span>Diagnostic Inspection</span>
                  <span className={styles.priceValFree}>FREE with repair</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Standard Labor Range</span>
                  <span className={styles.priceVal}>₹499 – ₹850</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Travel & Van Equipment Fee</span>
                  <span className={styles.priceValFree}>₹0 (Waived)</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Parts & Replacements</span>
                  <span className={styles.priceVal}>At wholesale cost</span>
                </div>

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Initial Escrow Hold:</span>
                  <span className={styles.totalAmount}>₹499.00</span>
                </div>
              </div>

              <div className={styles.escrowNote}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  Funds are secured in escrow. Your card will not be charged final balance until work is complete.
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Assurance Trust Card */}
          <div className={styles.trustCard}>
            <div className={styles.trustList}>
              <div className={styles.trustListItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>100% Background-checked & certified pros</span>
              </div>
              <div className={styles.trustListItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Zero hidden travel or arrival surcharges</span>
              </div>
              <div className={styles.trustListItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>₹10,000 Avatar Property Protection Guarantee</span>
              </div>
              <div className={styles.trustListItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Full 30-day labor warranty on all repairs</span>
              </div>
            </div>

            <div className={styles.supportLine}>
              Questions? Call 24/7 Dispatch: <strong>1-800-555-AVTR</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
