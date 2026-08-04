import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Share2, Heart, ShieldCheck, Wifi, Snowflake, Utensils, Car, Droplets, Zap, Tv, Shirt, Waves, Dumbbell, DoorOpen } from 'lucide-react';
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

const ListingView = () => {
  const { id } = useParams();
  
  const listing = useMemo(() => {
    const listingId = parseInt(id) || 1;
    return FIEBNB_LISTINGS.find(l => l.id === listingId) || FIEBNB_LISTINGS[0];
  }, [id]);

  const nights = listing.term === "long" ? 1 : 3;
  const subtotal = listing.price * nights;
  const fee = Math.round(subtotal * 0.08);

  const images = [1,2,3,4,5].map(n => `https://picsum.photos/seed/${listing.seed}-${n}/700/620`);
  
  const tags = [...listing.tags, "Backup power", "24hr security"];

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
              <span>·</span><span>{listing.area}, {listing.city}</span>
              <span>·</span><span className={`pill-tag ${listing.term === 'long' ? 'forest' : 'gold'}`}>{listing.term === 'long' ? 'Long-term rental' : 'Short stay'}</span>
            </div>
          </div>
          <div className="l-head-actions">
            <button className="icon-btn"><Share2 size={16} /></button>
            <button className="icon-btn"><Heart size={16} /></button>
          </div>
        </div>

        <div className="gallery">
          {images.map((src, i) => (
            <img key={i} src={src} alt={`${listing.title} - image ${i+1}`} />
          ))}
        </div>

        <div className="l-layout">
          <div>
            <div className="l-section">
              <div className="host-row">
                <img src={`https://picsum.photos/seed/${listing.seed}-host/120/120`} alt="Host" />
                <div>
                  <h3>{listing.type} hosted by {listing.city === "Accra" ? "Kofi" : "the property"} owner</h3>
                  <p>{listing.guests} guests · {listing.beds} bed{listing.beds > 1 ? 's' : ''} · {listing.baths} bath{listing.baths > 1 ? 's' : ''} · Usually responds within an hour</p>
                </div>
              </div>
            </div>

            <div className="l-section">
              <h3 style={{fontSize: '18px', marginBottom: '10px'}}>About this place</h3>
              <p style={{color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: '14.5px'}}>
                A {listing.type.toLowerCase()} in {listing.area}, {listing.city}, well suited to {listing.term === 'long' ? 'tenants settling in for months at a time' : 'travellers who want a comfortable, well-located base'}. Close to major roads, restaurants and everyday essentials, with a host who keeps the place genuinely ready for guests — not just photographed to look that way.
              </p>
            </div>

            <div className="l-section">
              <h3 style={{fontSize: '18px', marginBottom: '6px'}}>What this place offers</h3>
              <div className="amenity-grid">
                {tags.map((t, i) => {
                  const iconName = DEFAULT_AMENITIES[i % DEFAULT_AMENITIES.length];
                  const Icon = AMENITY_ICONS[iconName] || Tv;
                  return (
                    <div className="amenity-item" key={i}>
                      <Icon size={19} stroke="var(--ink-soft)" /> {t}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="l-section">
              <h3 style={{fontSize: '18px', marginBottom: '16px'}}>
                <span className="rating-inline"><StarIcon /> {listing.rating} · {listing.reviews} reviews</span>
              </h3>
              <div className="review-grid">
                {[
                  { name: "Ama", loc: "Accra", msg: "Exactly as described, and the host was quick to respond the whole stay." },
                  { name: "Yaw", loc: "Kumasi", msg: "Clean, quiet, and close to everything we needed. Would book again." },
                  { name: "Esi", loc: "Cape Coast", msg: "Great value — small touches like backup power made a real difference." },
                  { name: "Kojo", loc: "Takoradi", msg: "Smooth check-in and a genuinely comfortable place to stay." }
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

          <div className="card booking-card">
            <div className="booking-price">
              <b>₵{listing.price.toLocaleString()}</b><span>/ {listing.unit}</span>
            </div>
            <div className="booking-fields">
              <div className="bf-row">
                <div className="bf"><label>Check-in</label><input type="text" placeholder="Add date" /></div>
                <div className="bf"><label>Check-out</label><input type="text" placeholder="Add date" /></div>
              </div>
              <div className="bf full">
                <label>Guests</label>
                <select defaultValue="2 guests">
                  <option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4+ guests</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-block" style={{marginTop: '16px'}} onClick={() => alert('Booking flow is not wired up yet.')}>Reserve</button>
            <p style={{textAlign: 'center', fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '10px'}}>You won't be charged yet</p>
            <div className="price-breakdown">
              <div className="pb-row"><span>₵{listing.price.toLocaleString()} × {nights} {listing.unit}{nights > 1 ? 's' : ''}</span><span>₵{subtotal.toLocaleString()}</span></div>
              <div className="pb-row"><span>Fiebnb service fee</span><span>₵{fee.toLocaleString()}</span></div>
              <div className="pb-row total"><span>Total</span><span>₵{(subtotal + fee).toLocaleString()}</span></div>
            </div>
            <div className="trust-note"><ShieldCheck size={15} stroke="var(--forest)" style={{flexShrink: 0, marginTop: '1px'}} /><span>Payments are held securely and only released to the host after check-in.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingView;
