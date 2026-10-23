import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronRight,
  Share2,
  Heart,
  ShieldCheck,
  Wifi,
  Snowflake,
  Utensils,
  Car,
  Droplets,
  Zap,
  Tv,
  Shirt,
  Waves,
  Dumbbell,
  DoorOpen,
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { FIEBNB_LISTINGS } from '../../data/mockListings';
import './ListingView.css';

const StarIcon = () => (
  <svg viewBox="0 0 20 20" style={{ width: '14px', height: '14px', fill: 'var(--gold-deep)', stroke: 'none' }}>
    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z"/>
  </svg>
);

const AMENITY_ICONS = {
  "wifi": Wifi,
  "snowflake": Snowflake,
  "utensils": Utensils,
  "car": Car,
  "droplets": Droplets,
  "zap": Zap,
  "tv": Tv,
  "shirt": Shirt,
  "waves": Waves,
  "dumbbell": Dumbbell,
  "shield-check": ShieldCheck,
  "door-open": DoorOpen
};

const DEFAULT_AMENITIES = ["wifi","snowflake","utensils","car","droplets","zap","tv","shirt","waves","dumbbell","shield-check","door-open"];

export default function ListingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Try fetching real property from DB if id is provided
  const { data: dbProperty, isLoading: isDbLoading } = useQuery({
    queryKey: ['publicProperty', id],
    queryFn: async () => {
      try {
        const res = await axiosClient.get(`/properties/public/${id}`);
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: !!id
  });

  // Fallback to mock listings if dbProperty not found
  const listing = useMemo(() => {
    if (dbProperty) {
      const isHomeowner = dbProperty.property_type === 'HOMEOWNER';
      return {
        id: dbProperty.id,
        title: dbProperty.title,
        city: dbProperty.address?.split(',')[1]?.trim() || 'Accra',
        area: dbProperty.address?.split(',')[0]?.trim() || dbProperty.address || 'Greater Accra',
        type: isHomeowner ? 'Residential House' : (dbProperty.property_type === 'APARTMENT' ? 'Apartment' : 'Hotel'),
        term: isHomeowner || dbProperty.property_type === 'APARTMENT' ? 'long' : 'short',
        price: dbProperty.base_price,
        unit: isHomeowner || dbProperty.property_type === 'APARTMENT' ? 'month' : 'night',
        rating: 4.9,
        reviews: 24,
        guests: (dbProperty.bedrooms || 1) * 2,
        beds: dbProperty.bedrooms || 1,
        baths: dbProperty.bathrooms || 1,
        seed: `fiebnb-${dbProperty.id.slice(0, 5)}`,
        tags: dbProperty.amenities?.length > 0 ? dbProperty.amenities : ['Water reservoir', 'Gated compound', 'Parking'],
        images: dbProperty.images?.length > 0 ? dbProperty.images : [],
        description: dbProperty.description,
        advance_years: dbProperty.advance_years?.length > 0 ? dbProperty.advance_years : [1, 2],
        owner: dbProperty.owner,
        isDb: true
      };
    }

    const listingId = parseInt(id) || 1;
    const found = FIEBNB_LISTINGS.find(l => l.id === listingId) || FIEBNB_LISTINGS[0];
    return {
      ...found,
      advance_years: [1, 2],
      isDb: false
    };
  }, [dbProperty, id]);

  const isLongTerm = listing.term === 'long' || listing.unit === 'month';

  // Long-term lease state
  const allowedYears = listing.advance_years && listing.advance_years.length > 0 ? listing.advance_years : [1, 2];
  const [selectedYears, setSelectedYears] = useState(allowedYears[0] || 1);
  const [leaseStartDate, setLeaseStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [showApplicationSuccess, setShowApplicationSuccess] = useState(false);
  const [applicationReceipt, setApplicationReceipt] = useState(null);

  // Short-term state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Long-term Calculations
  const monthlyRent = listing.price;
  const durationMonths = selectedYears * 12;
  const advanceRentSubtotal = monthlyRent * durationMonths;
  const securityDeposit = isLongTerm ? monthlyRent : 0; // 1 month standard refundable deposit
  const serviceFee = isLongTerm ? Math.round(advanceRentSubtotal * 0.02) : Math.round(listing.price * 3 * 0.08);
  const totalAdvanceAmount = advanceRentSubtotal + securityDeposit + serviceFee;

  // Short-term calculation
  const nights = 3;
  const shortTermSubtotal = listing.price * nights;
  const shortTermFee = Math.round(shortTermSubtotal * 0.08);

  // Images gallery
  const images = useMemo(() => {
    if (listing.images && listing.images.length > 0) {
      return listing.images.map(img => img.startsWith('http') ? img : `http://localhost:3000${img}`);
    }
    return [1, 2, 3, 4, 5].map(n => `https://picsum.photos/seed/${listing.seed}-${n}/700/620`);
  }, [listing]);

  // Tags
  const tags = listing.tags && listing.tags.length > 0
    ? listing.tags
    : ["Water reservoir", "Backup generator", "24hr security", "Parking"];

  // Apply for Lease Mutation
  const applyLeaseMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosClient.post('/leases/apply', data);
      return res.data;
    },
    onSuccess: (data) => {
      setApplicationReceipt(data);
      setShowApplicationSuccess(true);
      toast.success('Lease application submitted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit application');
    }
  });

  const handleApplyLease = () => {
    if (!user) {
      toast('Please sign in or register to submit a lease application', { icon: '🔑' });
      navigate('/login', { state: { returnUrl: `/listing/${id}` } });
      return;
    }

    if (!listing.isDb) {
      // Demo for mock listing
      setApplicationReceipt({
        message: 'Demo application received',
        monthly_rent: monthlyRent,
        duration_months: durationMonths,
        advance_payment: advanceRentSubtotal
      });
      setShowApplicationSuccess(true);
      return;
    }

    applyLeaseMutation.mutate({
      property_id: listing.id,
      start_date: leaseStartDate,
      duration_months: durationMonths,
      guest_name: user.name,
      guest_phone: user.phone_number
    });
  };

  return (
    <div className="listing-page">
      <div className="wrap">
        <div className="crumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <Link to="/browse">Stays</Link>
          <ChevronRight size={13} />
          <span>{listing.title}</span>
        </div>

        <div className="l-head">
          <div>
            <h1>{listing.title}</h1>
            <div className="l-meta">
              <span className="rating"><StarIcon /> {listing.rating} · {listing.reviews} reviews</span>
              <span>·</span>
              <span>{listing.area}, {listing.city}</span>
              <span>·</span>
              <span className={`pill-tag ${isLongTerm ? 'forest' : 'gold'}`}>
                {isLongTerm ? 'Long-term residential lease' : 'Short stay'}
              </span>
            </div>
          </div>
          <div className="l-head-actions">
            <button className="icon-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard!'); }}><Share2 size={16} /></button>
            <button className="icon-btn" onClick={() => toast.success('Saved to wishlist!')}><Heart size={16} /></button>
          </div>
        </div>

        {/* Gallery */}
        <div className="gallery">
          {images.slice(0, 5).map((src, i) => (
            <img key={i} src={src} alt={`${listing.title} - image ${i + 1}`} />
          ))}
        </div>

        <div className="l-layout">
          <div>
            {/* Host Section */}
            <div className="l-section">
              <div className="host-row">
                <img src={`https://picsum.photos/seed/${listing.seed}-host/120/120`} alt="Host" />
                <div>
                  <h3>
                    {listing.type} hosted by {listing.owner?.name || (listing.city === "Accra" ? "Kofi" : "Property Host")}
                  </h3>
                  <p>
                    {listing.guests} guests · {listing.beds} bed{listing.beds > 1 ? 's' : ''} · {listing.baths} bath{listing.baths > 1 ? 's' : ''} · {isLongTerm ? 'Verified Landlord / Homeowner' : 'Superhost'}
                  </p>
                </div>
              </div>
            </div>

            {/* About section */}
            <div className="l-section">
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>About this place</h3>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: '14.5px' }}>
                {listing.description || (
                  `A quality ${listing.type.toLowerCase()} in ${listing.area}, ${listing.city}, well suited to ${
                    isLongTerm
                      ? 'tenants seeking a secure, peaceful multi-year residential stay with advance payment'
                      : 'travellers who want a comfortable, well-located base'
                  }. Close to major access roads, everyday essentials, with a host who ensures the property is well maintained and verified.`
                )}
              </p>
            </div>

            {/* Multi-Year Advance Payment Information Box */}
            {isLongTerm && (
              <div className="l-section" style={{ background: 'var(--paper-dim)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-deep)', fontWeight: 700, marginBottom: '6px' }}>
                  <Sparkles size={18} />
                  <span>Multi-Year Advance Rental Policy</span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  In accordance with standard Ghanaian residential leasing, this property is available for <b>1 to 3 years advance payment</b>.
                  Your upfront rent is held safely in escrow and disbursed directly to the homeowner upon signed lease agreement and key handover.
                </p>
              </div>
            )}

            {/* What this place offers */}
            <div className="l-section">
              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>What this place offers</h3>
              <div className="amenity-grid">
                {tags.map((t, i) => {
                  const iconKey = t.toLowerCase().includes('water') ? 'droplets'
                    : t.toLowerCase().includes('power') || t.toLowerCase().includes('generator') ? 'zap'
                    : t.toLowerCase().includes('parking') ? 'car'
                    : t.toLowerCase().includes('wifi') ? 'wifi'
                    : t.toLowerCase().includes('air') || t.toLowerCase().includes('ac') ? 'snowflake'
                    : 'door-open';
                  const Icon = AMENITY_ICONS[iconKey] || DoorOpen;
                  return (
                    <div className="amenity-item" key={i}>
                      <Icon size={19} stroke="var(--ink-soft)" /> {t}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="l-section">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>
                <span className="rating-inline"><StarIcon /> {listing.rating} · {listing.reviews} reviews</span>
              </h3>
              <div className="review-grid">
                {[
                  { name: "Ama", loc: "East Legon", msg: "Moving in was seamless. The house is completely gated and water pressure is very consistent." },
                  { name: "Yaw", loc: "Spintex", msg: "Accurate monthly rent and very clear advance terms. The landlord was responsive from day one." },
                  { name: "Esi", loc: "Airport Residential", msg: "Great compound with reliable power backup. Perfect for our 2-year lease." },
                  { name: "Kojo", loc: "Accra", msg: "Clean, quiet compound and very trustworthy leasing agreement process." }
                ].map((r, i) => (
                  <div className="review-card" key={i}>
                    <div className="review-who">
                      <img src={`https://picsum.photos/seed/${listing.seed}-r${i}/100/100`} alt={r.name} />
                      <div><b>{r.name}</b><span>{r.loc} · 2 weeks ago</span></div>
                    </div>
                    <p>"{r.msg}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Booking Card */}
          <div className="card booking-card" style={{ position: 'sticky', top: '100px' }}>
            <div className="booking-price" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <b style={{ fontSize: '26px' }}>GH₵{listing.price.toLocaleString()}</b>
                <span style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>/ {listing.unit}</span>
              </div>
              <span className={`pill-tag ${isLongTerm ? 'forest' : 'gold'}`} style={{ fontSize: '11.5px', marginTop: '6px' }}>
                {isLongTerm ? 'Long-term Advance Lease' : 'Instant Reservation'}
              </span>
            </div>

            {isLongTerm ? (
              /* Multi-Year Long-Term Lease Booking Flow */
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    value={leaseStartDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                    Select Advance Lease Period
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allowedYears.length}, 1fr)`, gap: '8px' }}>
                    {allowedYears.map(yr => {
                      const isSelected = selectedYears === yr;
                      return (
                        <button
                          type="button"
                          key={yr}
                          onClick={() => setSelectedYears(yr)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--forest-deep)' : '1px solid var(--line)',
                            background: isSelected ? '#E1EAE0' : 'var(--white)',
                            color: isSelected ? 'var(--forest-deep)' : 'var(--ink)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{yr} Year{yr > 1 ? 's' : ''}</div>
                          <div style={{ fontSize: '11px', color: isSelected ? 'var(--forest-deep)' : 'var(--ink-soft)', marginTop: '2px' }}>
                            {yr * 12} months
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Advance Calculation Breakdown */}
                <div className="price-breakdown" style={{ background: 'var(--paper-dim)', padding: '14px', borderRadius: '10px', margin: '0 0 16px' }}>
                  <div className="pb-row" style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Advance Rent ({selectedYears} yr · {durationMonths} mos)</span>
                    <span style={{ fontWeight: 600 }}>GH₵{advanceRentSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="pb-row" style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--ink-soft)' }}>
                    <span>Refundable Security Deposit (1 mo)</span>
                    <span>GH₵{securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="pb-row" style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--ink-soft)' }}>
                    <span>Platform Verification &amp; Legal Fee (2%)</span>
                    <span>GH₵{serviceFee.toLocaleString()}</span>
                  </div>
                  <div
                    className="pb-row total"
                    style={{
                      borderTop: '1px solid var(--line)',
                      paddingTop: '10px',
                      marginTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '16px',
                      color: 'var(--ink)'
                    }}
                  >
                    <span>Total Advance Due</span>
                    <span style={{ color: 'var(--forest-deep)' }}>GH₵{totalAdvanceAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block"
                  onClick={handleApplyLease}
                  disabled={applyLeaseMutation.isPending}
                  style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
                >
                  {applyLeaseMutation.isPending ? 'Submitting Application...' : 'Apply for Lease'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ink-soft)', marginTop: '10px' }}>
                  You won't be charged until the homeowner approves your application
                </p>
              </div>
            ) : (
              /* Short Stay Hotel / Guesthouse Flow */
              <div>
                <div className="booking-fields">
                  <div className="bf-row">
                    <div className="bf">
                      <label>Check-in</label>
                      <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                    </div>
                    <div className="bf">
                      <label>Check-out</label>
                      <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="bf full">
                    <label>Guests</label>
                    <select defaultValue="2 guests">
                      <option>1 guest</option>
                      <option>2 guests</option>
                      <option>3 guests</option>
                      <option>4+ guests</option>
                    </select>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block"
                  style={{ marginTop: '16px', width: '100%' }}
                  onClick={() => toast.success('Reservation request sent!')}
                >
                  Reserve
                </button>
                <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '10px' }}>
                  You won't be charged yet
                </p>
                <div className="price-breakdown">
                  <div className="pb-row">
                    <span>GH₵{listing.price.toLocaleString()} × {nights} nights</span>
                    <span>GH₵{shortTermSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="pb-row">
                    <span>Fiebnb service fee</span>
                    <span>GH₵{shortTermFee.toLocaleString()}</span>
                  </div>
                  <div className="pb-row total">
                    <span>Total</span>
                    <span>GH₵{(shortTermSubtotal + shortTermFee).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="trust-note" style={{ display: 'flex', gap: '8px', marginTop: '16px', fontSize: '12px', color: 'var(--ink-soft)' }}>
              <ShieldCheck size={16} stroke="var(--forest-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Payments are held securely in Fiebnb escrow and only disbursed after property inspection &amp; key handover.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Success Modal */}
      {showApplicationSuccess && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#E1EAE0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--forest-deep)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Lease Application Submitted!
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Your application for <b>{listing.title}</b> has been received and forwarded directly to the homeowner.
            </p>

            <div
              style={{
                background: 'var(--paper-dim)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '13.5px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Advance Term:</span>
                <b>{selectedYears} Year{selectedYears > 1 ? 's' : ''} ({durationMonths} Months)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Monthly Rate:</span>
                <b>GH₵{monthlyRent.toLocaleString()} / mo</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Lease Start:</span>
                <b>{new Date(leaseStartDate).toLocaleDateString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '8px', color: 'var(--forest-deep)', fontWeight: 800 }}>
                <span>Total Advance Rent:</span>
                <span>GH₵{advanceRentSubtotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowApplicationSuccess(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Browse More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
