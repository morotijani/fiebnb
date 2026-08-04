import React from 'react';
import { MessageCircle, CalendarSearch, Banknote, ShieldAlert, Home, Wallet, Mail, ArrowRight } from 'lucide-react';

export default function SupportView() {
  return (
    <>
      <style>{`
        .wa-band{
          border-radius:28px; background:var(--forest-deep); color:var(--white); padding:44px 48px;
          display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap;
          position:relative; overflow:hidden;
        }
        .wa-band::before{ content:""; position:absolute; inset:0; background:radial-gradient(500px 260px at 90% 10%, rgba(200,155,60,0.22), transparent 70%); }
        .wa-band .left{ position:relative; display:flex; align-items:center; gap:18px; }
        .wa-band .ic{ width:56px; height:56px; border-radius:50%; background:rgba(250,246,239,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .wa-band .ic svg{ width:26px; height:26px; stroke:var(--white); }
        .wa-band h2{ color:var(--white); font-size:24px; }
        .wa-band p{ color:rgba(250,246,239,0.75); font-size:14.5px; margin-top:4px; }
        .wa-band .btn{ position:relative; background:#25D366; color:#0b3d24; font-weight:700; }
        .wa-band .btn:hover{ background:#1fb959; }

        .topic-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .topic-card{ padding:24px; border:1px solid var(--line); border-radius:var(--r-lg); background:var(--white); }
        .topic-card .ic{ width:40px; height:40px; border-radius:10px; background:var(--sand); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .topic-card .ic svg{ width:19px; height:19px; stroke:var(--brick-deep); }
        .topic-card h3{ font-size:15.5px; margin-bottom:6px; }
        .topic-card p{ font-size:13.5px; color:var(--ink-soft); line-height:1.55; }
        .topic-card a.tlink{ display:inline-flex; align-items:center; gap:5px; margin-top:12px; font-size:13px; font-weight:700; color:var(--brick); }

        .hours-strip{ display:flex; gap:44px; flex-wrap:wrap; margin-top:8px; }
        @media (max-width:900px){ .topic-grid{ grid-template-columns:1fr; } .wa-band{ flex-direction:column; align-items:flex-start; } }
      `}</style>
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">Support</p>
          <h1>Fastest help is a WhatsApp message away</h1>
          <p className="lede">Our support team answers directly on WhatsApp — no ticket numbers, no waiting on hold.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="wa-band">
              <div className="left">
                <div className="ic"><MessageCircle /></div>
                <div>
                  <h2>Chat with Fiebnb support</h2>
                  <p>+233 20 000 0000 · Daily, 7am – 10pm GMT · Avg. reply time under 5 minutes</p>
                </div>
              </div>
              <a className="btn" href="https://wa.me/233200000000?text=Hi%20Fiebnb%2C%20I%20need%20help%20with" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} /> Open WhatsApp
              </a>
            </div>
            <div className="hours-strip">
              <div className="stat"><b style={{ fontFamily: 'var(--font-display)', fontSize: '26px', display: 'block' }}>&lt;5 min</b><span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Average first response</span></div>
              <div className="stat"><b style={{ fontFamily: 'var(--font-display)', fontSize: '26px', display: 'block' }}>7am–10pm</b><span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Daily, every day</span></div>
              <div className="stat"><b style={{ fontFamily: 'var(--font-display)', fontSize: '26px', display: 'block' }}>GH · EN</b><span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Twi, Ga &amp; English spoken</span></div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Browse by topic</p><h2>What do you need help with?</h2></div></div>
            <div className="topic-grid">
              <div className="topic-card">
                <div className="ic"><CalendarSearch /></div>
                <h3>A booking I made</h3>
                <p>Changing dates, contacting your host, or an issue during your stay.</p>
                <a className="tlink" href="how-booking-works.html">How booking works <ArrowRight size={13} /></a>
              </div>
              <div className="topic-card">
                <div className="ic"><Banknote /></div>
                <h3>Payments &amp; refunds</h3>
                <p>Failed payments, refund status, or questions about a charge.</p>
                <a className="tlink" href="cancellation-options.html">Cancellation options <ArrowRight size={13} /></a>
              </div>
              <div className="topic-card">
                <div className="ic"><ShieldAlert /></div>
                <h3>Report a problem</h3>
                <p>Something felt unsafe, misleading, or didn't match the listing.</p>
                <a className="tlink" href="trust-safety.html">Trust &amp; safety <ArrowRight size={13} /></a>
              </div>
              <div className="topic-card">
                <div className="ic"><Home /></div>
                <h3>Listing my property</h3>
                <p>Getting started as a host, verification, or editing a listing.</p>
                <a className="tlink" href="host-dashboard.html">Host dashboard <ArrowRight size={13} /></a>
              </div>
              <div className="topic-card">
                <div className="ic"><Wallet /></div>
                <h3>Payouts as a host</h3>
                <p>Payout schedules, fees, and adding a Mobile Money or bank account.</p>
                <a className="tlink" href="pricing-payouts.html">Pricing &amp; payouts <ArrowRight size={13} /></a>
              </div>
              <div className="topic-card">
                <div className="ic"><Mail /></div>
                <h3>Something else</h3>
                <p>General questions, press, careers, or anything that doesn't fit above.</p>
                <a className="tlink" href="contact.html">Contact form <ArrowRight size={13} /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Still stuck?</h2>
              <p>Send us a message on WhatsApp and we'll take it from there.</p>
              <div className="actions">
                <a className="btn" style={{ background: '#25D366', color: '#0b3d24' }} href="https://wa.me/233200000000" target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
                <a href="contact.html" className="btn btn-outline" style={{ borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)' }}>Use the contact form</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
