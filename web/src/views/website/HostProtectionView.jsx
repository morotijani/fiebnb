import React from 'react';
import { UserCheck, Hammer, Wallet, Scale, ShieldCheck, PhoneCall } from 'lucide-react';

export default function HostProtectionView() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">For property owners</p>
          <h1>Fiebnb has your property's back</h1>
          <p className="lede">Hosting strangers — or tenants — shouldn't mean carrying all the risk yourself. Here's what's covered when you list on Fiebnb.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="feature-grid">
              <div className="feature-card">
                <div className="ic"><UserCheck /></div>
                <h3>Verified guests only</h3>
                <p>Every guest confirms their identity before booking, so you always know who's arriving at your door.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Hammer /></div>
                <h3>Damage protection</h3>
                <p>Accidental damage during a stay is covered up to ₵50,000 for short stays, with claims reviewed within 5 business days.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Wallet /></div>
                <h3>Guaranteed payouts</h3>
                <p>Once a guest checks in, your payout is locked in — even if a dispute is raised afterward, you're paid on schedule.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><Scale /></div>
                <h3>Dispute support</h3>
                <p>Our team mediates guest disputes directly so you're not left negotiating refunds or damages on your own.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><ShieldCheck /></div>
                <h3>Long-term tenant screening</h3>
                <p>For rentals, we run basic reference and ID checks on applicants before they can send a booking request.</p>
              </div>
              <div className="feature-card">
                <div className="ic"><PhoneCall /></div>
                <h3>Priority host line</h3>
                <p>A dedicated host support number, separate from guest support, for issues that need a faster response.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="split-row">
              <div>
                <p className="eyebrow">By the numbers</p>
                <h2 style={{ fontSize: '28px', marginTop: '10px' }}>Protection that shows up when it matters</h2>
                <p className="lede" style={{ marginTop: '14px' }}>From flagging a suspicious booking request to filing a damage claim after checkout, most host issues on Fiebnb are resolved without ever needing to go outside the platform.</p>
                <div className="stat-strip">
                  <div className="stat"><b>98%</b><span>Payouts released on schedule</span></div>
                  <div className="stat"><b>5 days</b><span>Avg. damage claim resolution</span></div>
                  <div className="stat"><b>92%</b><span>Commission you keep per booking</span></div>
                </div>
              </div>
              <img src="https://picsum.photos/seed/fiebnb-hostprotect1/700/560" alt="" />
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>List with the protections built in</h2>
              <p>Set up your first listing in under 15 minutes.</p>
              <div className="actions">
                <a href="/host-dashboard" className="btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Go to host dashboard</a>
                <a href="/contact" className="btn btn-outline" style={{ borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)' }}>Talk to our host team</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
