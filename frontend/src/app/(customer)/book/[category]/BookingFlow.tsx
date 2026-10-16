'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api/bookings';
import { getMyAddresses, createAddress } from '@/lib/api/addresses';
import styles from './BookingFlow.module.css';

interface CategoryConfig {
  id: string;
  name: string;
  noun: string;
  base: number;
  issues: Array<{
    id: string;
    name: string;
    desc: string;
    time: string;
    add: number;
    em?: boolean;
  }>;
}

const CATS: CategoryConfig[] = [
  {
    id: 'handyman',
    name: 'Handyman',
    noun: 'licensed handyman',
    base: 399,
    issues: [
      { id: 'h0', name: 'Furniture assembly', desc: 'Beds, wardrobes, desks, shelves', time: '60 min', add: 0 },
      { id: 'h1', name: 'Wall mounting', desc: 'TV, shelves, mirrors, curtain rods', time: '45 min', add: 50 },
      { id: 'h2', name: 'Drywall patch and paint', desc: 'Holes, cracks, damp patches', time: '90 min', add: 250 },
      { id: 'h3', name: 'Door and lock fix', desc: 'Sticking doors, loose hinges, new locks', time: '45 min', add: 100 },
      { id: 'h4', name: 'General fixes', desc: 'A list of small jobs in one visit', time: '60 min', add: 0 },
      { id: 'h5', name: 'Something just broke', desc: 'Urgent repair that cannot wait', time: 'under 30 min', add: 0, em: true },
    ],
  },
  {
    id: 'plumber',
    name: 'Plumber',
    noun: 'licensed plumber',
    base: 499,
    issues: [
      { id: 'p0', name: 'Leaking pipe or faucet', desc: 'Sink, vanity, supply lines, valves', time: '30–60 min', add: 0 },
      { id: 'p1', name: 'Clogged drain', desc: 'Standing water, slow or backed-up drains', time: '45 min', add: 150 },
      { id: 'p2', name: 'Water heater repair', desc: 'No hot water, tank leaks, pilot issues', time: '60–90 min', add: 350 },
      { id: 'p3', name: 'Toilet running or overflowing', desc: 'Flush valve, seal and chain repair', time: '30–45 min', add: 100 },
      { id: 'p4', name: 'Low water pressure', desc: 'Regulator and aerator checks', time: '45 min', add: 120 },
      { id: 'p5', name: 'Burst pipe or flooding', desc: 'Active flooding, shut-off help', time: 'under 30 min', add: 0, em: true },
    ],
  },
  {
    id: 'electrician',
    name: 'Electrician',
    noun: 'licensed electrician',
    base: 449,
    issues: [
      { id: 'e0', name: 'Breaker keeps tripping', desc: 'Overloaded circuits and sub-panel checks', time: '45 min', add: 100 },
      { id: 'e1', name: 'Dead outlet or switch', desc: 'Replace sockets, dimmers and switches', time: '30 min', add: 0 },
      { id: 'e2', name: 'Light or fan install', desc: 'Chandeliers, ceiling fans, smart switches', time: '60 min', add: 150 },
      { id: 'e3', name: 'Panel upgrade or rewiring', desc: 'Breaker box, surge protection, rewiring', time: '2–3 hrs', add: 1200 },
      { id: 'e4', name: 'Inverter or UPS check', desc: 'Wiring and battery health check', time: '40 min', add: 100 },
      { id: 'e5', name: 'Sparks or burning smell', desc: 'Short-circuit risk. Switch off at the mains', time: 'under 30 min', add: 0, em: true },
    ],
  },
  {
    id: 'cleaning',
    name: 'House Cleaning',
    noun: 'house cleaner',
    base: 599,
    issues: [
      { id: 'c0', name: 'Standard home clean', desc: 'Dusting, floors, kitchen and bathrooms', time: '2–3 hrs', add: 0 },
      { id: 'c1', name: 'Deep clean', desc: 'Top to bottom, inside appliances', time: '4–5 hrs', add: 700 },
      { id: 'c2', name: 'Kitchen and bathrooms', desc: 'Grease, limescale and tile scrub', time: '2 hrs', add: 250 },
      { id: 'c3', name: 'Move-in or move-out', desc: 'Empty-home clean for handover', time: '4 hrs', add: 900 },
      { id: 'c4', name: 'Sofa and carpet', desc: 'Shampoo and stain treatment', time: '2 hrs', add: 450 },
      { id: 'c5', name: 'Same-day urgent clean', desc: 'Guests arriving or inspection today', time: 'under 60 min', add: 0, em: true },
    ],
  },
  {
    id: 'hvac',
    name: 'HVAC Repair',
    noun: 'AC technician',
    base: 799,
    issues: [
      { id: 'v0', name: 'AC not cooling', desc: 'Gas, filter and compressor diagnosis', time: '60 min', add: 0 },
      { id: 'v1', name: 'Service and gas check', desc: 'Deep clean and pressure test', time: '60 min', add: 300 },
      { id: 'v2', name: 'New AC installation', desc: 'Mounting, piping and commissioning', time: '2 hrs', add: 900 },
      { id: 'v3', name: 'Water leaking from AC', desc: 'Drain line and tray fix', time: '45 min', add: 150 },
      { id: 'v4', name: 'Strange noise or smell', desc: 'Fan, motor and coil inspection', time: '45 min', add: 100 },
      { id: 'v5', name: 'AC stopped completely', desc: 'Priority repair in extreme heat', time: 'under 45 min', add: 0, em: true },
    ],
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    noun: 'mobile mechanic',
    base: 549,
    issues: [
      { id: 'm0', name: 'Car will not start', desc: 'Battery, starter and fuel checks', time: '45 min', add: 0 },
      { id: 'm1', name: 'Brake or clutch issue', desc: 'Pads, discs, fluid and cable work', time: '90 min', add: 400 },
      { id: 'm2', name: 'Battery replacement', desc: 'Test, remove and fit a new battery', time: '30 min', add: 200 },
      { id: 'm3', name: 'Oil and routine service', desc: 'Oil, filters and a full inspection', time: '90 min', add: 350 },
      { id: 'm4', name: 'Flat tyre or puncture', desc: 'Repair or swap with your spare', time: '30 min', add: 0 },
      { id: 'm5', name: 'Broken down on the road', desc: 'Priority roadside response', time: 'under 30 min', add: 0, em: true },
    ],
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    noun: 'carpenter',
    base: 499,
    issues: [
      { id: 'k0', name: 'Door or window repair', desc: 'Alignment, hinges, frames, locks', time: '60 min', add: 100 },
      { id: 'k1', name: 'Furniture repair', desc: 'Joints, drawers, broken legs', time: '90 min', add: 200 },
      { id: 'k2', name: 'Custom shelf or wardrobe', desc: 'Measured, built and fitted', time: '3+ hrs', add: 1200 },
      { id: 'k3', name: 'Bed or sofa assembly', desc: 'Flat-pack and framed pieces', time: '60 min', add: 0 },
      { id: 'k4', name: 'Cabinet hinges and locks', desc: 'Soft-close, handles, latches', time: '45 min', add: 80 },
      { id: 'k5', name: 'Broken door or lock', desc: 'Urgent re-secure of your home', time: 'under 30 min', add: 0, em: true },
    ],
  },
];

const NAMES = [
  ['Ravi K.', '4.9', '428'],
  ['Imran S.', '4.8', '312'],
  ['Suresh P.', '4.9', '190'],
  ['Anita M.', '4.9', '356'],
  ['Farhan A.', '4.7', '241'],
  ['Deepak R.', '4.8', '517'],
  ['Joseph T.', '4.9', '163'],
  ['Meera N.', '4.8', '274'],
  ['Karthik V.', '4.9', '389'],
  ['Vikram S.', '4.7', '208'],
  ['Lakshmi B.', '4.9', '445'],
  ['Arjun D.', '4.8', '132'],
];

interface BookingFlowProps {
  categorySlug?: string;
}

export default function BookingFlow({ categorySlug = 'plumber' }: BookingFlowProps) {
  const router = useRouter();

  // Find initial category matching slug
  const matchedCat = CATS.find((c) => c.id === categorySlug) || CATS[1];
  const [catId, setCatId] = useState<string>(matchedCat.id);
  const [step, setStep] = useState<number>(1);
  const [issueId, setIssueId] = useState<string>('');
  const [urgent, setUrgent] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [showNote, setShowNote] = useState<boolean>(false);
  const [showCats, setShowCats] = useState<boolean>(false);

  // Address and Time
  const [addr, setAddr] = useState<string>('');
  const [locMsg, setLocMsg] = useState<string>('');
  const [loc, setLoc] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [tileErr, setTileErr] = useState<boolean>(false);
  const [routes, setRoutes] = useState<number[][][]>([]);
  const routeKeyRef = useRef<string>('');

  const [day, setDay] = useState<string>('now');
  const [slot, setSlot] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Booked state
  const [booked, setBooked] = useState<boolean>(false);
  const [bookedAt, setBookedAt] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [eta0, setEta0] = useState<number>(10);
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState<boolean>(false);

  const catIdx = Math.max(0, CATS.findIndex((c) => c.id === catId));
  const currentCat = CATS[catIdx] || CATS[0];

  const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

  // Issues calculation
  const issues = currentCat.issues.map((it) => {
    const isSelected = issueId === it.id;
    const isEm = !!it.em;
    return {
      ...it,
      on: isSelected,
      price: rupee(currentCat.base + it.add),
    };
  });

  const selectedIssue = currentCat.issues.find((i) => i.id === issueId);
  const isUrgent = urgent || !!(selectedIssue && selectedIssue.em);

  // Day & Slot configuration
  const nowD = new Date();
  const hourNow = nowD.getHours();
  const dayLabel = (n: number) =>
    new Date(nowD.getTime() + n * 86400000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const DAYS = [
    { id: 'now', label: 'As soon as possible' },
    { id: 'd0', label: 'Today' },
    { id: 'd1', label: 'Tomorrow' },
    { id: 'd2', label: dayLabel(2) },
  ];

  const SLOTS = [
    { id: 's1', label: '9–11 am', hour: 9, adj: -50, note: 'Off-peak −₹50' },
    { id: 's2', label: '11 am–1 pm', hour: 11, adj: 0, note: '' },
    { id: 's3', label: '2–4 pm', hour: 14, adj: 0, note: '' },
    { id: 's4', label: '6–8 pm', hour: 18, adj: 100, note: 'Evening +₹100' },
  ];

  const isNow = day === 'now';
  const isLater = !isNow;
  const selectedSlot = SLOTS.find((s) => s.id === slot);
  const dayName = day === 'd0' ? 'Today' : day === 'd1' ? 'Tomorrow' : dayLabel(2);

  // Pricing calculation
  const sub = currentCat.base + (selectedIssue ? selectedIssue.add : 0);
  const urgentFee = isUrgent ? Math.round((sub * 0.5) / 10) * 10 : 0;
  const slotAdj = isLater && selectedSlot ? selectedSlot.adj : 0;
  const totalN = sub + urgentFee + slotAdj;

  const priceRows = [
    { label: 'Visit and diagnosis', val: rupee(currentCat.base), color: '#0f1d3f' },
  ];
  if (selectedIssue && selectedIssue.add > 0) {
    priceRows.push({ label: selectedIssue.name, val: '+ ' + rupee(selectedIssue.add), color: '#0f1d3f' });
  }
  if (urgentFee > 0) {
    priceRows.push({ label: 'Urgent dispatch', val: '+ ' + rupee(urgentFee), color: '#b42318' });
  }
  if (slotAdj !== 0) {
    priceRows.push({
      label: slotAdj < 0 ? 'Off-peak discount' : 'Evening slot',
      val: (slotAdj < 0 ? '− ' : '+ ') + rupee(Math.abs(slotAdj)),
      color: slotAdj < 0 ? '#1c7a4c' : '#0f1d3f',
    });
  }
  priceRows.push({ label: 'Travel fee', val: 'Free', color: '#1c7a4c' });

  // Map tile math (Web-Mercator Z=15, W=520, H=280, TS=256)
  const Z = 15;
  const W = 520;
  const H = 280;
  const TS = 256;

  const wp = useCallback(
    (latitude: number, longitude: number) => {
      const sz = TS * Math.pow(2, Z);
      const r = (latitude * Math.PI) / 180;
      return {
        x: ((longitude + 180) / 360) * sz,
        y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * sz,
      };
    },
    [TS, Z]
  );

  const Cc = wp(loc.lat, loc.lng);
  const toPx = useCallback(
    (lat: number, lng: number) => {
      const p = wp(lat, lng);
      return [p.x - Cc.x + W / 2, p.y - Cc.y + H / 2];
    },
    [Cc, wp]
  );

  const mPerPx = (156543.03392 * Math.cos((loc.lat * Math.PI) / 180)) / Math.pow(2, Z);
  const nT = Math.pow(2, Z);
  const tiles: Array<{ u: string; x: string; y: string; key: string }> = [];

  for (let ty = Math.floor((Cc.y - H / 2) / TS); ty <= Math.floor((Cc.y + H / 2) / TS); ty++) {
    for (let tx = Math.floor((Cc.x - W / 2) / TS); tx <= Math.floor((Cc.x + W / 2) / TS); tx++) {
      if (ty < 0 || ty >= nT) continue;
      tiles.push({
        u: `https://tile.openstreetmap.org/${Z}/${((tx % nT) + nT) % nT}/${ty}.png`,
        x: (tx * TS - Cc.x + W / 2).toFixed(1),
        y: (ty * TS - Cc.y + H / 2).toFixed(1),
        key: `${tx}-${ty}`,
      });
    }
  }

  // Routing calculation
  const lenOf = (p: number[][]) => {
    let L = 0;
    for (let i = 1; i < p.length; i++) {
      L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    }
    return L;
  };

  const posAt = (p: number[][], s: number) => {
    for (let i = 1; i < p.length; i++) {
      const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (s <= d || i === p.length - 1) {
        const u = d ? Math.min(1, s / d) : 0;
        return {
          x: p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u,
          y: p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u,
        };
      }
      s -= d;
    }
    return { x: p[0][0], y: p[0][1] };
  };

  const FALL = [
    [-150, -90],
    [140, -100],
    [-40, 110],
  ];

  const polys = [0, 1, 2].map((i) => {
    const r = routes && routes[i];
    if (r && r.length > 1) {
      const stp = Math.max(1, Math.floor(r.length / 70));
      const pts: number[][] = [];
      for (let k = 0; k < r.length; k += stp) {
        pts.push(toPx(r[k][0], r[k][1]));
      }
      pts.push(toPx(r[r.length - 1][0], r[r.length - 1][1]));
      return pts;
    }
    return [
      [W / 2 + FALL[i][0], H / 2 + FALL[i][1]],
      [W / 2, H / 2],
    ];
  });

  const lens = polys.map((p) => Math.max(1, lenOf(p)));
  let bestI = 0;
  lens.forEach((l, i) => {
    if (l < lens[bestI]) bestI = i;
  });

  const calculatedEta = Math.max(
    3,
    Math.round(2 + ((lens[bestI] * mPerPx) / 250) * (isUrgent ? 0.7 : 1))
  );

  // Tracking animation parameters
  const D = 26; // 26 seconds total travel
  const prog = booked && isNow ? Math.min(1, (nowTs - bookedAt) / 1000 / D) : 0;
  const tp = posAt(polys[bestI], prog * lens[bestI]);
  const left = Math.max(0, Math.ceil(eta0 * (1 - prog)));
  const truckOn = booked && isNow;
  const truck = {
    x: tp.x.toFixed(1),
    y: tp.y.toFixed(1),
    label: prog >= 1 ? 'Arrived' : left + ' min',
  };

  const asg = NAMES[(catIdx * 3 + bestI) % NAMES.length];
  const whenText = isNow
    ? `As soon as possible (about ${calculatedEta} min)`
    : `${dayName}, ${selectedSlot ? selectedSlot.label : ''}`;

  const stepsTimeline = [
    { label: 'Booking confirmed', note: `${rupee(totalN)} held safely`, cls: styles.dotDone, check: true },
    {
      label: 'Specialist assigned',
      note: `${asg[0]} accepted your job`,
      cls: !isNow || prog >= 0.06 ? styles.dotDone : styles.dotNow,
      check: !isNow || prog >= 0.06,
    },
    {
      label: isNow ? 'On the way' : 'Dispatched 30 min before your slot',
      note: isNow
        ? prog >= 1
          ? 'Reached your address'
          : `Arriving in about ${left} min`
        : whenText,
      cls: isNow && prog >= 1 ? styles.dotDone : isNow && prog >= 0.06 ? styles.dotNow : '',
      check: isNow && prog >= 1,
    },
    {
      label: 'Job starts with your code',
      note: 'You pay only after you approve the work',
      cls: '',
      check: false,
    },
  ];

  const doneData = {
    title: isNow
      ? prog >= 1
        ? `Your ${currentCat.noun} has arrived`
        : `${asg[0]} is on the way`
      : `Booked for ${whenText}`,
    sub: isNow
      ? prog >= 1
        ? 'Share your code to start the job.'
        : `Arriving in about ${left} min.`
      : `We will send ${asg[0]} about 30 minutes before your slot.`,
    spec: { name: asg[0], initial: asg[0][0], rating: asg[1], jobs: asg[2] },
    otp: otp,
    steps: stepsTimeline,
  };

  // Validation
  const phoneOk = /^[6-9]\d{9}$/.test(phone);
  const validStep = [
    false,
    Boolean(issueId),
    addr.trim().length > 5 && (isNow || Boolean(selectedSlot)),
    phoneOk,
  ];

  const hints = [
    '',
    'Choose what needs fixing to continue.',
    addr.trim().length > 5 ? 'Pick a time slot to continue.' : 'Add your address to continue.',
    'Enter your 10-digit mobile number to confirm.',
  ];

  // Geolocation & Nominatim
  const loadRoutes = useCallback(
    (targetLoc: { lat: number; lng: number }) => {
      const OFFS = [
        [0.004, 0.005],
        [-0.003, -0.006],
        [-0.004, 0.003],
      ];
      const key = `${targetLoc.lat.toFixed(4)},${targetLoc.lng.toFixed(4)}`;
      routeKeyRef.current = key;

      Promise.all(
        OFFS.map((o) =>
          fetch(
            `https://router.project-osrm.org/route/v1/driving/${targetLoc.lng + o[1]},${
              targetLoc.lat + o[0]
            };${targetLoc.lng},${targetLoc.lat}?overview=full&geometries=geojson`
          )
            .then((r) => r.json())
            .then((j) =>
              j.routes && j.routes[0]
                ? j.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
                : null
            )
            .catch(() => null)
        )
      ).then((rs) => {
        if (routeKeyRef.current === key) {
          const validRoutes = rs.filter(Boolean) as number[][][];
          setRoutes(validRoutes);
        }
      });
    },
    []
  );

  const reverseGeocode = useCallback((targetLoc: { lat: number; lng: number }) => {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${targetLoc.lat}&lon=${targetLoc.lng}`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((j) => {
        const a = j.address || {};
        const parts = [
          [a.house_number, a.road].filter(Boolean).join(' '),
          a.neighbourhood || a.suburb,
          a.city || a.town || a.village || a.county,
          a.postcode,
        ].filter(Boolean);
        setAddr(parts.length ? parts.join(', ') : j.display_name || '');
        setLocMsg('Filled from your location. Edit it if it is not exact.');
      })
      .catch(() => {
        setAddr(`Current location (${targetLoc.lat.toFixed(5)}, ${targetLoc.lng.toFixed(5)})`);
        setLocMsg('Address lookup failed, so we used your coordinates.');
      });
  }, []);

  const handleLocate = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocMsg('This browser does not support location. Type your address instead.');
      return;
    }
    setLocMsg('Waiting for location permission…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const target = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLoc(target);
        setRoutes([]);
        setLocMsg('Found you. Looking up the address…');
        loadRoutes(target);
        reverseGeocode(target);
      },
      (err) => {
        setLocMsg(
          err && err.code === 1
            ? 'Location permission is blocked. Type your address and press Show on map.'
            : 'Could not get your location. Type your address instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, [loadRoutes, reverseGeocode]);

  const handleSearchAddress = () => {
    if (addr.trim().length <= 3) return;
    setLocMsg('Searching…');
    fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(addr.trim())}`)
      .then((r) => r.json())
      .then((a) => {
        if (a && a[0]) {
          const target = { lat: +a[0].lat, lng: +a[0].lon };
          setLoc(target);
          setRoutes([]);
          setLocMsg('Map moved to this address.');
          loadRoutes(target);
        } else {
          setLocMsg('Address not found. Try adding the city.');
        }
      })
      .catch(() => {
        setLocMsg('Address search is unavailable right now.');
      });
  };

  // Initial mount route loading & location query
  useEffect(() => {
    loadRoutes({ lat: 12.9716, lng: 77.5946 });

    // Try preloading saved addresses from backend if user is authenticated
    getMyAddresses()
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          const defaultAddr = res.items.find((a) => a.is_default) || res.items[0];
          setAddr(defaultAddr.full_address);
          if (defaultAddr.lat && defaultAddr.lng) {
            const pos = { lat: defaultAddr.lat, lng: defaultAddr.lng };
            setLoc(pos);
            loadRoutes(pos);
          }
        }
      })
      .catch(() => {
        // Guest user or offline, ignore
      });

    try {
      if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((p) => {
          if (p.state === 'granted') {
            handleLocate();
          }
        }).catch(() => {});
      }
    } catch (e) {}
  }, [loadRoutes, handleLocate]);

  // Live timer tick for truck tracking
  useEffect(() => {
    if (!booked) return;
    const interval = setInterval(() => {
      setNowTs(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, [booked]);

  // Actions
  const handleProceed = async () => {
    if (!validStep[step]) return;

    if (step < 3) {
      setStep(step + 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Step 3 -> Complete Booking
      setSubmitting(true);
      const generatedOtp = String(1000 + Math.floor(Math.random() * 9000));
      setOtp(generatedOtp);
      setEta0(calculatedEta);
      setBookedAt(Date.now());

      try {
        // Attempt creating backend address & booking
        let addressId = '';
        try {
          const addrRes = await createAddress({
            full_address: addr.trim(),
            lat: loc.lat,
            lng: loc.lng,
          });
          addressId = addrRes.id;
        } catch (e) {
          // Fallback if not logged in
        }

        const scheduledTime = isNow
          ? new Date().toISOString()
          : new Date(Date.now() + 86400000).toISOString();

        await createBooking({
          category_id: currentCat.id,
          address_id: addressId || 'temp_address',
          scheduled_time: scheduledTime,
          problem_description: `${selectedIssue?.name || 'Service'} - Note: ${note || 'None'} - Phone: +91${phone}`,
        });
      } catch (err) {
        console.warn('Booking API offline, running in interactive demonstration mode', err);
      } finally {
        setSubmitting(false);
        setBooked(true);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const handleReset = () => {
    setBooked(false);
    setStep(1);
    setIssueId('');
    setUrgent(false);
    setNote('');
    setDay('now');
    setSlot('');
  };

  const summary = [
    { k: 'Service', v: currentCat.name, col: '#0f1d3f' },
    {
      k: 'Problem',
      v: selectedIssue ? selectedIssue.name + (isUrgent ? ' (urgent)' : '') : 'Not chosen yet',
      col: selectedIssue ? '#0f1d3f' : '#6b7390',
    },
    {
      k: 'Address',
      v: addr.trim() || 'Not added yet',
      col: addr.trim() ? '#0f1d3f' : '#6b7390',
    },
    {
      k: 'When',
      v: step >= 2 || booked ? whenText : 'Not chosen yet',
      col: step >= 2 || booked ? '#0f1d3f' : '#6b7390',
    },
  ];

  const reviewItems = [
    {
      k: 'SERVICE',
      v: `${currentCat.name}: ${selectedIssue ? selectedIssue.name : ''}${
        isUrgent ? ' (urgent)' : ''
      }${note.trim() ? `. Note: ${note.trim()}` : ''}`,
      edit: () => setStep(1),
    },
    { k: 'ADDRESS', v: addr, edit: () => setStep(2) },
    { k: 'WHEN', v: whenText, edit: () => setStep(2) },
  ];

  return (
    <div className={styles.pageContainer} data-document-role="page" data-label="Booking page">
      {/* Top Header Bar */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          AVATAR
        </Link>
        <a href="#help" className={styles.helpLink}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          Help
        </a>
      </header>

      <main id="top" className={styles.mainLayout}>
        {/* LEFT COLUMN: 3-Step Wizard or Live Tracking */}
        <div className={styles.leftCol}>
          {!booked ? (
            <>
              {/* Stepper Navigation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className={styles.stepperHeader}>
                  {step > 1 ? (
                    <button
                      type="button"
                      className={styles.link}
                      style={{ textDecoration: 'none' }}
                      onClick={() => setStep(step - 1)}
                    >
                      ← Back
                    </button>
                  ) : (
                    <span className={styles.stepperCategory}>{currentCat.name}</span>
                  )}
                  <span className={styles.stepperCount}>Step {step} of 3</span>
                </div>
                <div aria-hidden="true" className={styles.progressBars}>
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`${styles.progressBarItem} ${
                        step >= n ? styles.progressBarItemActive : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: What needs fixing? */}
              {step === 1 && (
                <section aria-label="Choose the problem" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>
                      What needs fixing?
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 15, color: '#4b5578' }}>
                      Booking a {currentCat.noun}.{' '}
                      <button
                        type="button"
                        className={styles.link}
                        style={{ minHeight: 32 }}
                        onClick={() => setShowCats(!showCats)}
                      >
                        Change service
                      </button>
                    </p>
                  </div>

                  {/* Category switcher chips */}
                  {showCats && (
                    <div role="group" aria-label="Choose a service" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {CATS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`${styles.chip} ${c.id === catId ? styles.chipOn : ''}`}
                          onClick={() => {
                            setCatId(c.id);
                            setIssueId('');
                            setUrgent(false);
                            setNote('');
                            setShowCats(false);
                            setSlot('');
                          }}
                          aria-pressed={c.id === catId}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Issue List */}
                  <div role="group" aria-label="Problem" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {issues.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        className={`${styles.opt} ${it.on ? styles.optOn : ''} ${
                          it.em ? (it.on ? styles.optEmOn : styles.optEm) : ''
                        }`}
                        onClick={() => {
                          setIssueId(it.id);
                          if (it.em) {
                            setUrgent(true);
                          }
                        }}
                        aria-pressed={it.on}
                      >
                        <span
                          className={`${styles.ind} ${
                            it.on ? (it.em ? styles.indEmOn : styles.indOn) : ''
                          }`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>
                            {it.name}
                          </span>
                          <span style={{ display: 'block', fontSize: 13, color: '#4b5578', marginTop: 2, lineHeight: 1.4 }}>
                            {it.desc} · {it.time}
                          </span>
                        </span>
                        <span style={{ textAlign: 'right', flex: 'none' }}>
                          <span style={{ display: 'block', fontSize: 11, color: '#4b5578', fontWeight: 600 }}>
                            from
                          </span>
                          <span style={{ display: 'block', fontSize: 16, fontWeight: 800 }}>
                            {it.price}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Urgent dispatch toggle switch */}
                  <div className={styles.card} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>
                        Urgent? Send someone as fast as possible
                      </div>
                      <div style={{ fontSize: 13, color: '#4b5578', marginTop: 2 }}>
                        {isUrgent
                          ? `On. Arrives about 30% faster, +${rupee(
                              urgentFee || Math.round((sub * 0.5) / 10) * 10
                            )}.`
                          : `Off. Usually arrives in about ${calculatedEta} min.`}
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isUrgent}
                      aria-label="Urgent request"
                      className={`${styles.sw} ${isUrgent ? styles.swOn : ''}`}
                      onClick={() => {
                        const nextUrgent = !isUrgent;
                        setUrgent(nextUrgent);
                        if (!nextUrgent && selectedIssue && selectedIssue.em) {
                          setIssueId('');
                        }
                      }}
                    >
                      <i />
                    </button>
                  </div>

                  {/* Technician notes */}
                  <div>
                    {!showNote ? (
                      <button
                        type="button"
                        className={styles.link}
                        style={{ paddingLeft: 0 }}
                        onClick={() => setShowNote(true)}
                      >
                        + Add a note for the specialist (optional)
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label htmlFor="note" style={{ fontSize: 15, fontWeight: 800 }}>
                          Note for the specialist
                        </label>
                        <textarea
                          id="note"
                          className={styles.field}
                          placeholder="e.g. dripping since morning, valve under the sink will not close"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* STEP 2: Where and when? */}
              {step === 2 && (
                <section aria-label="Address and time" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>
                    Where and when?
                  </h1>

                  {/* Address Card */}
                  <div className={styles.card} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Address</h2>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={handleLocate}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                      Use my current location
                    </button>
                    {locMsg && (
                      <div style={{ fontSize: 13, color: '#4b5578', lineHeight: 1.4 }} aria-live="polite">
                        {locMsg}
                      </div>
                    )}
                    <label htmlFor="addr" style={{ fontSize: 14, fontWeight: 700 }}>
                      Or type your address
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <input
                        id="addr"
                        type="text"
                        className={styles.field}
                        style={{ flex: '1 1 240px', width: 'auto' }}
                        placeholder="Flat / house no., street, landmark, city"
                        value={addr}
                        onChange={(e) => setAddr(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchAddress();
                          }
                        }}
                      />
                      <button type="button" className={styles.ghost} onClick={handleSearchAddress}>
                        Show on map
                      </button>
                    </div>

                    {/* Interactive OSM Map Tile Viewer */}
                    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e6e3da' }}>
                      <svg
                        viewBox="0 0 520 280"
                        role="img"
                        aria-label="Map showing your address"
                        style={{ display: 'block', width: '100%', height: 'auto', background: '#e9e6da' }}
                      >
                        <rect x="0" y="0" width="520" height="280" fill="#e9e6da" />
                        {tiles.map((t) => (
                          <image
                            key={t.key}
                            href={t.u}
                            x={t.x}
                            y={t.y}
                            width="256.6"
                            height="256.6"
                            onError={() => {
                              if (!tileErr) setTileErr(true);
                            }}
                          />
                        ))}
                        {tileErr && (
                          <text
                            x="260"
                            y="90"
                            textAnchor="middle"
                            fontSize="14"
                            fontWeight="700"
                            fill="#4b5578"
                            fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                          >
                            Map could not load. You can still type your address.
                          </text>
                        )}
                        <g transform="translate(260 140)">
                          <path
                            d="M0 0 C-10 -14 -13 -20 -13 -26 a13 13 0 0 1 26 0 C13 -20 10 -14 0 0 Z"
                            fill="#b42318"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="-26" r="5" fill="#ffffff" />
                        </g>
                      </svg>
                      <div
                        style={{
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#4b5578',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                          flexWrap: 'wrap',
                          background: '#fff',
                        }}
                      >
                        <span>Wrong spot? Edit the address and press Show on map.</span>
                        <a
                          href="https://www.openstreetmap.org/copyright"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'underline' }}
                        >
                          © OpenStreetMap contributors
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* When Card */}
                  <div className={styles.card} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>When</h2>
                    <div className={styles.seg} role="group" aria-label="Day" style={{ flexWrap: 'wrap' }}>
                      {DAYS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className={day === d.id ? styles.segOn : ''}
                          onClick={() => {
                            setDay(d.id);
                            setSlot('');
                          }}
                          style={{ minWidth: 96 }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {isNow ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 14,
                          borderRadius: 12,
                          background: '#fff6df',
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#8a5a00"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>
                          A specialist can reach you in about {calculatedEta} min
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                          gap: 8,
                        }}
                        role="group"
                        aria-label="Time slot"
                      >
                        {SLOTS.map((s) => {
                          const isOff = day === 'd0' && s.hour <= hourNow;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              className={`${styles.chip} ${slot === s.id ? styles.chipOn : ''}`}
                              disabled={isOff}
                              onClick={() => setSlot(s.id)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 12px',
                                borderRadius: 14,
                                minHeight: 56,
                              }}
                            >
                              <span>{s.label}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
                                {s.note || 'Standard'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* STEP 3: Check and confirm */}
              {step === 3 && (
                <section aria-label="Review and confirm" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>
                    Check and confirm
                  </h1>

                  {/* Summary DL Card */}
                  <div className={styles.card} style={{ padding: '6px 18px' }}>
                    <dl style={{ margin: 0 }}>
                      {reviewItems.map((r, idx) => (
                        <div
                          key={r.k}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '14px 0',
                            borderBottom: idx < reviewItems.length - 1 ? '1px solid #efece3' : 'none',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <dt style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', color: '#4b5578' }}>
                              {r.k}
                            </dt>
                            <dd style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
                              {r.v}
                            </dd>
                          </div>
                          <button type="button" className={styles.link} onClick={r.edit}>
                            Change
                          </button>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Mobile phone number input */}
                  <div className={styles.card} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label htmlFor="phone" style={{ fontSize: 16, fontWeight: 800 }}>
                      Your mobile number
                    </label>
                    <div style={{ fontSize: 13, color: '#4b5578' }}>
                      The specialist and our team will call or message you on this number.
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div
                        style={{
                          minHeight: 52,
                          padding: '0 14px',
                          border: '1.5px solid #d9d5c8',
                          borderRadius: 12,
                          background: '#efece3',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        +91
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className={styles.field}
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      />
                    </div>
                  </div>

                  {/* Safe Escrow Guarantee Notice */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: 14,
                      borderRadius: 12,
                      background: '#eef7f1',
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: '#14532d',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flex: 'none', marginTop: 2 }}
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>
                      Your payment is held safely and released to the specialist only after you approve the finished job.
                      You can cancel for free until 10 minutes before they arrive.
                    </span>
                  </div>
                </section>
              )}

              {/* Sticky Action Footer */}
              <div className={styles.stickyActionBar}>
                {!validStep[step] && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#8a5a00' }} aria-live="polite">
                    {hints[step]}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5578' }}>Total</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{rupee(totalN)}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.cta}
                    style={{ flex: 1 }}
                    disabled={!validStep[step] || submitting}
                    onClick={handleProceed}
                  >
                    {submitting
                      ? 'Processing…'
                      : step === 3
                      ? `Confirm booking · ${rupee(totalN)}`
                      : 'Continue'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* BOOKED CONFIRMATION & LIVE TRACKING VIEW */
            <section aria-label="Booking confirmed" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header Title with animated check badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#1c7a4c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.2, fontWeight: 800 }}>
                    {doneData.title}
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: 15, color: '#4b5578' }} aria-live="polite">
                    {doneData.sub}
                  </p>
                </div>
              </div>

              {/* Live Tracking Map with moving yellow truck */}
              {truckOn && (
                <div className={styles.card} style={{ overflow: 'hidden' }}>
                  <svg
                    viewBox="0 0 520 280"
                    role="img"
                    aria-label="Specialist driving to your address"
                    style={{ display: 'block', width: '100%', height: 'auto', background: '#e9e6da' }}
                  >
                    <rect x="0" y="0" width="520" height="280" fill="#e9e6da" />
                    {tiles.map((t) => (
                      <image key={t.key} href={t.u} x={t.x} y={t.y} width="256.6" height="256.6" />
                    ))}
                    {/* Pulsing destination marker */}
                    <g transform="translate(260 140)">
                      <circle cx="0" cy="0" r="6" fill="none" stroke="#b42318" strokeWidth="2">
                        <animate attributeName="r" values="6;28" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <path
                        d="M0 0 C-10 -14 -13 -20 -13 -26 a13 13 0 0 1 26 0 C13 -20 10 -14 0 0 Z"
                        fill="#b42318"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle cx="0" cy="-26" r="5" fill="#ffffff" />
                    </g>
                    {/* Animated Specialist Service Truck */}
                    <g style={{ transform: `translate(${truck.x}px, ${truck.y}px)`, transition: 'transform 0.5s linear' }}>
                      <rect x="-17" y="-9" width="26" height="16" rx="3" fill="#fbb43c" stroke="#0f1d3f" strokeWidth="1.5" />
                      <rect x="9" y="-5" width="9" height="12" rx="2" fill="#0f1d3f" />
                      <circle cx="-9" cy="8" r="3.4" fill="#0f1d3f" />
                      <circle cx="11" cy="8" r="3.4" fill="#0f1d3f" />
                      <rect x="-30" y="-40" width="66" height="22" rx="11" fill="#0f1d3f" />
                      <text
                        x="3"
                        y="-25"
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="800"
                        fill="#ffffff"
                        fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                      >
                        {truck.label}
                      </text>
                    </g>
                  </svg>
                  <div style={{ padding: '8px 14px', fontSize: 12, color: '#4b5578', textAlign: 'right' }}>
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline' }}
                    >
                      © OpenStreetMap contributors
                    </a>
                  </div>
                </div>
              )}

              {/* Specialist Profile Card */}
              <div className={styles.card} style={{ padding: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#0f1d3f',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    flex: 'none',
                  }}
                >
                  {doneData.spec.initial}
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{doneData.spec.name}</div>
                  <div style={{ fontSize: 14, color: '#4b5578', marginTop: 2 }}>
                    {currentCat.name} · ★ {doneData.spec.rating} · {doneData.spec.jobs} jobs
                  </div>
                </div>
                <a
                  href={`tel:+919876543210`}
                  className={styles.ghost}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  </svg>
                  Call
                </a>
              </div>

              {/* Start-of-Job Code Box */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: '#fff6df',
                  border: '1.5px dashed #fbb43c',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: '#8a5a00' }}>
                  YOUR START-OF-JOB CODE
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '0.3em', marginTop: 4 }}>
                  {doneData.otp}
                </div>
                <div style={{ fontSize: 13, color: '#4b5578', marginTop: 2 }}>
                  Tell this code to the specialist only when they are at your door.
                </div>
              </div>

              {/* Multi-stage Progress Timeline */}
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {doneData.steps.map((s, idx) => (
                  <li key={idx} className={styles.tl}>
                    <span className={`${styles.dot} ${s.cls}`}>
                      {s.check && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{s.label}</div>
                      <div style={{ fontSize: 13, color: '#4b5578' }}>{s.note}</div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Post-Booking Action Links */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 14,
                  borderTop: '1px solid #e6e3da',
                }}
              >
                <button type="button" className={styles.link} onClick={() => setBooked(false)}>
                  Cancel booking (free)
                </button>
                <button type="button" className={styles.ghost} onClick={handleReset}>
                  Book another service
                </button>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky "YOUR BOOKING" Summary Card */}
        <aside id="help" className={styles.asideSticky}>
          <section className={styles.card} aria-label="Booking summary" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: '#4b5578' }}>
              YOUR BOOKING
            </h2>

            {/* Summary Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {summary.map((m) => (
                <div key={m.k}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5578' }}>{m.k}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: m.col }}>
                    {m.v}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Itemized Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid #e6e3da' }}>
              {priceRows.map((p) => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                  <span style={{ color: '#4b5578' }}>{p.label}</span>
                  <span style={{ fontWeight: 700, color: p.color }}>{p.val}</span>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid #e6e3da' }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>Total</span>
              <span style={{ fontSize: 26, fontWeight: 800 }} aria-live="polite">
                {rupee(totalN)}
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#4b5578', lineHeight: 1.5 }}>
              Parts, if needed, are charged at cost and only after you approve them.
            </div>
          </section>

          {/* Trust Guarantees */}
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '0 4px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              color: '#4b5578',
            }}
          >
            <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1c7a4c"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Background-checked professionals
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1c7a4c"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Fixed price, no travel fee
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1c7a4c"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Pay only after you approve the job
            </li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
