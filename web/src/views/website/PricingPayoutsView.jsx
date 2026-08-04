import React from 'react';
import { Smartphone, Landmark, Wallet, ChevronDown } from 'lucide-react';

export default function PricingPayoutsView() {
  return (
    <>
      <style>{`
        .payout-method{ display:flex; align-items:center; gap:16px; padding:20px; border:1px solid var(--line); border-radius:var(--r-lg); background:var(--white); }
        .payout-method .ic{ width:44px; height:44px; border-radius:12px; background:var(--sand); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .payout-method .ic svg{ width:21px; height:21px; stroke:var(--brick-deep); }
        .payout-method h3{ font-size:15px; }
        .payout-method p{ font-size:13px; color:var(--ink-soft); margin-top:2px; }
        .payout-methods{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .fee-highlight{ display:flex; align-items:baseline; gap:10px; margin-top:6px; }
        .fee-highlight b{ font-family:var(--font-display); font-size:44px; }
        .fee-highlight span{ color:var(--ink-soft); font-size:14px; }
        @media (max-width:900px){ .payout-methods{ grid-template-columns:1fr; } }
      `}</style>
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">For property owners</p>
          <h1>Simple pricing. Fast, reliable payouts.</h1>
          <p className="lede">No listing fees, no hidden charges — Fiebnb takes one commission per completed booking, and the rest lands in your account.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="split-row">
              <div>
                <p className="eyebrow">What it costs</p>
                <h2 style={{ fontSize: '28px', marginTop: '10px' }}>You keep 92% of every booking</h2>
                <div className="fee-highlight"><b>8%</b><span>host service fee, deducted automatically<br/>from each completed booking</span></div>
                <p className="lede" style={{ marginTop: '18px' }}>There's no charge to create a listing, no monthly subscription, and no fee if a booking falls through before check-in. Guests separately pay a small service fee on top of your listed price — it never comes out of your payout.</p>
              </div>
              <img src="https://picsum.photos/seed/fiebnb-pricing1/700/560" alt="" />
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Fee breakdown</p><h2>Where the money goes</h2></div></div>
            <table className="policy-table">
              <thead><tr><th>Booking type</th><th>Host service fee</th><th>Guest service fee</th><th>Payout timing</th></tr></thead>
              <tbody>
                <tr><td>Hotel / Guesthouse (short stay)</td><td>8%</td><td>~6–10%, shown at checkout</td><td>24 hrs after check-in</td></tr>
                <tr><td>Apartment (short stay)</td><td>8%</td><td>~6–10%, shown at checkout</td><td>24 hrs after check-in</td></tr>
                <tr><td>Long-term rental</td><td>6%</td><td>One-time 4% on first month</td><td>3 days after each monthly payment</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Getting paid</p><h2>Choose how your payouts arrive</h2></div></div>
            <div className="payout-methods">
              <div className="payout-method">
                <div className="ic"><Smartphone /></div>
                <div><h3>Mobile Money</h3><p>MTN, Telecel or AirtelTigo — most hosts' fastest option, usually same-day.</p></div>
              </div>
              <div className="payout-method">
                <div className="ic"><Landmark /></div>
                <div><h3>Bank transfer</h3><p>Direct to any Ghanaian bank account, typically within 1–2 business days.</p></div>
              </div>
              <div className="payout-method">
                <div className="ic"><Wallet /></div>
                <div><h3>Fiebnb Wallet</h3><p>Hold your balance in-app and withdraw on your own schedule, fee-free.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Common questions</p><h2>Pricing, answered</h2></div></div>
            <div>
              <details className="faq-item" open>
                <summary>Is there a fee to list my property?<ChevronDown className="chev" size={18} /></summary>
                <p>No. Creating and publishing a listing is free, for both short-stay and long-term properties. You're only charged once a booking is completed.</p>
              </details>
              <details className="faq-item">
                <summary>When exactly do I get paid?<ChevronDown className="chev" size={18} /></summary>
                <p>For short stays, payout is released 24 hours after the guest checks in. For long-term rentals, each month's rent is released 3 days after the guest's payment clears, giving time to resolve any issues.</p>
              </details>
              <details className="faq-item">
                <summary>Can I set my own prices?<ChevronDown className="chev" size={18} /></summary>
                <p>Yes, fully. You control nightly or monthly rates, minimum stay lengths, and seasonal pricing from your host dashboard.</p>
              </details>
              <details className="faq-item">
                <summary>What if a guest cancels — do I still get paid?<ChevronDown className="chev" size={18} /></summary>
                <p>It depends on your cancellation policy and how close to check-in the cancellation happens. See <a href="cancellation-options.html" style={{ color: 'var(--brick)', fontWeight: '600' }}>Cancellation options</a> for the exact breakdown.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Start earning from your property</h2>
              <p>List for free — you only pay when you get booked.</p>
              <div className="actions">
                <a href="host-dashboard.html" className="btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Go to host dashboard</a>
                <a href="host-protection.html" className="btn btn-outline" style={{ borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)' }}>See host protection</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
