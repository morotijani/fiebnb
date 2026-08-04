import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function HowBookingWorksView() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">Guest guide</p>
          <h1>How booking on Fiebnb works</h1>
          <p className="lede">Four steps stand between you and a place to stay in Ghana — whether that's one night in Osu or six months in East Legon.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="step-list">
              <div className="step-card">
                <span className="num">01</span>
                <h3>Search &amp; compare</h3>
                <p>Filter by city, stay length, property type and price to see verified hotels, guesthouses and rentals side by side.</p>
              </div>
              <div className="step-card">
                <span className="num">02</span>
                <h3>Request or book instantly</h3>
                <p>Short stays with "Instant Book" confirm right away. Long-term rentals go to the owner as a request, usually answered within a day.</p>
              </div>
              <div className="step-card">
                <span className="num">03</span>
                <h3>Pay securely</h3>
                <p>Pay by Mobile Money or card. Funds are held by Fiebnb and only released to the host 24 hours after you check in.</p>
              </div>
              <div className="step-card">
                <span className="num">04</span>
                <h3>Check in &amp; settle in</h3>
                <p>Get check-in details, host contact and directions in the app. Message your host any time before or during your stay.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="split-row">
              <img src="https://picsum.photos/seed/fiebnb-howworks1/700/560" alt="" />
              <div>
                <p className="eyebrow">Short stays vs. long-term</p>
                <h2 style={{ fontSize: '28px', marginTop: '10px' }}>Booking looks a little different depending on how long you're staying</h2>
                <p className="lede" style={{ marginTop: '14px' }}>For nightly stays at hotels and guesthouses, most bookings confirm instantly and payment covers the full stay upfront. For long-term rentals, owners typically ask a few questions first, request the initial month plus a refundable deposit, and may ask for reference checks — much like renting anywhere else, just without the agent fees.</p>
                <div className="stat-strip">
                  <div className="stat"><b>9 min</b><span>Avg. instant-book confirmation</span></div>
                  <div className="stat"><b>24 hrs</b><span>Avg. long-term request response</span></div>
                  <div className="stat"><b>0%</b><span>Agent fees on long-term rentals</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Common questions</p><h2>Booking, answered</h2></div></div>
            <div>
              <details className="faq-item" open>
                <summary>Do I need to pay the full amount upfront?<ChevronDown className="chev" size={18} /></summary>
                <p>For short stays, yes — the full stay total is charged when your booking is confirmed. For long-term rentals, you'll typically pay the first month and a deposit to secure the place, then pay monthly after that.</p>
              </details>
              <details className="faq-item">
                <summary>What's the difference between "Instant Book" and "Request to book"?<ChevronDown className="chev" size={18} /></summary>
                <p>Instant Book listings confirm the moment you pay — no waiting on the host. Request to book listings ask the host to review your dates or application first, which is common for long-term rentals and some guesthouses.</p>
              </details>
              <details className="faq-item">
                <summary>Can I message the host before booking?<ChevronDown className="chev" size={18} /></summary>
                <p>Yes. Every listing page has a message option so you can ask about parking, water supply, generator backup or anything else before you commit.</p>
              </details>
              <details className="faq-item">
                <summary>What happens if my host cancels on me?<ChevronDown className="chev" size={18} /></summary>
                <p>You're refunded in full and our support team helps you find a comparable stay — see <a href="cancellation-options.html" style={{ color: 'var(--brick)', fontWeight: '600' }}>Cancellation options</a> for details.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Ready to find your stay?</h2>
              <p>Search verified hotels, guesthouses and rentals across 16 regions.</p>
              <div className="actions">
                <a href="browse.html" className="btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Browse stays</a>
                <a href="trust-safety.html" className="btn btn-outline" style={{ borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)' }}>Read about trust &amp; safety</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
