import React from 'react';
import { CalendarX, DoorOpen, ShieldAlert, ChevronDown } from 'lucide-react';

export default function CancellationOptionsView() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">Guest guide</p>
          <h1>Cancellation options</h1>
          <p className="lede">Every listing carries one of these policies, shown clearly on the listing page before you book. Long-term rentals follow separate notice-based terms.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Short-stay policies</p><h2>Compare the three policy types</h2></div></div>
            <table className="policy-table">
              <thead>
                <tr><th>Policy</th><th>Full refund</th><th>Partial refund</th><th>No refund</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Flexible</td>
                  <td>Cancel up to 24 hours before check-in</td>
                  <td>50% back if cancelled within 24 hours</td>
                  <td>After check-in time</td>
                </tr>
                <tr>
                  <td>Moderate</td>
                  <td>Cancel up to 5 days before check-in</td>
                  <td>50% back if cancelled within 5 days</td>
                  <td>Within 24 hours of check-in</td>
                </tr>
                <tr>
                  <td>Firm</td>
                  <td>Cancel up to 14 days before check-in</td>
                  <td>50% back if cancelled 7–14 days before</td>
                  <td>Within 7 days of check-in</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Long-term rentals</p><h2>Notice periods, not nightly refunds</h2></div></div>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="ic"><CalendarX /></div>
                <h3>Before move-in</h3>
                <p>Cancel any time before your move-in date for a full refund of your deposit, minus the Fiebnb service fee.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><DoorOpen /></div>
                <h3>After move-in</h3>
                <p>Standard notice is 30 days in writing through the platform. Rent already paid for the current period is non-refundable.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><ShieldAlert /></div>
                <h3>Deposit handling</h3>
                <p>Deposits are held by Fiebnb, not the landlord, and returned within 7 days of move-out minus any documented damages.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Special cases</p><h2>When the usual rules don't apply</h2></div></div>
            <div>
              <details className="faq-item" open>
                <summary>What if the host cancels on me?<ChevronDown className="chev" style={{ width: '18px', height: '18px' }} /></summary>
                <p>You get a full refund, no matter which policy applied, plus help from our team finding a comparable stay — often at no extra cost.</p>
              </details>
              <details className="faq-item">
                <summary>Do extenuating circumstances get special treatment?<ChevronDown className="chev" style={{ width: '18px', height: '18px' }} /></summary>
                <p>Serious illness, bereavement, or travel disruption documented with proof may qualify for a full refund outside the standard policy — contact support to review your case.</p>
              </details>
              <details className="faq-item">
                <summary>Can I change my dates instead of cancelling?<ChevronDown className="chev" style={{ width: '18px', height: '18px' }} /></summary>
                <p>Yes, most hosts allow a free date change if the new dates are available — message them directly from your booking before cancelling.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Booking with confidence starts here</h2>
              <p>Every listing shows its exact policy before you pay a cedi.</p>
              <div className="actions">
                <a href="/browse" className="btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Browse stays</a>
                <a href="/how-booking-works" className="btn btn-outline" style={{ borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)' }}>How booking works</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
