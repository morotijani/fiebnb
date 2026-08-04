import React from 'react';
import { BadgeCheck, MapPinCheck, Lock, Star, Headphones, Flag } from 'lucide-react';

export default function TrustSafetyView() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">Trust & safety</p>
          <h1>A stay you can walk into with confidence</h1>
          <p className="lede">Every listing on Fiebnb passes through real checks before it goes live — not just a photo upload. Here's what stands behind that.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">What we check</p><h2>Built-in protections for every booking</h2></div></div>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="ic"><BadgeCheck /></div>
                <h3>ID-verified owners</h3>
                <p>Every host — hotel, guesthouse or private landlord — submits a national ID or business registration before listing.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><MapPinCheck /></div>
                <h3>Site inspections</h3>
                <p>New listings are visited or photo-verified by our local team so what you see is what you get on arrival.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Lock /></div>
                <h3>Secure, escrowed payments</h3>
                <p>Money is held by Fiebnb, not the host, and only released 24 hours after a smooth check-in.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Star /></div>
                <h3>Two-way reviews</h3>
                <p>Guests and hosts both leave reviews after every stay, so patterns of bad behaviour surface quickly on either side.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Headphones /></div>
                <h3>Local support, real hours</h3>
                <p>A Ghana-based team on call by phone and WhatsApp — not a chatbot reading from a script.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Flag /></div>
                <h3>Simple reporting</h3>
                <p>Report a listing, a guest or a host directly from any booking. Reports are reviewed within 24 hours.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="split-row reverse">
              <img src="https://picsum.photos/seed/fiebnb-trust1/700/560" alt="" />
              <div>
                <p className="eyebrow">Behind every listing</p>
                <h2 style={{ fontSize: '28px', marginTop: '10px' }}>Verification isn't a one-time checkbox</h2>
                <p className="lede" style={{ marginTop: '14px' }}>Hosts are re-verified when they add new properties, and listings with recurring guest complaints are paused automatically while our team investigates. For long-term rentals, we also confirm proof of ownership or management authority — so you're never paying a deposit to someone with no real claim to the property.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Something feel off?</h2>
              <p>Report it directly from your booking, or reach our safety team any time.</p>
              <div className="actions">
                <a href="/contact" className="btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Contact safety team</a>
                <a href="/cancellation-options" className="btn btn-outline" style={{ borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)' }}>Cancellation options</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
