import React from 'react';
import { Link } from 'react-router-dom';

const AboutView = () => {
  return (
    <div className="about-page">
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">About us</p>
          <h1>Built in Accra, for how Ghana actually finds a place to stay</h1>
          <p className="lede">Fiebnb started with a simple complaint: booking a hotel abroad was easier online than booking one three neighbourhoods away. We set out to fix that.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="split-row">
              <div>
                <p className="eyebrow">Our story</p>
                <h2 style={{fontSize: '28px', marginTop: '10px'}}>From a WhatsApp group to a national platform</h2>
                <p className="lede" style={{marginTop: '14px'}}>Fiebnb began in 2023 as a WhatsApp group connecting travellers with vetted guesthouses in Accra. As demand grew from Kumasi, Takoradi and Cape Coast, the group turned into a platform — and property owners started asking for the same trust and reach for their long-term rentals, not just nightly stays. Today Fiebnb covers all three: hotels, guesthouses, and long-term apartments and homes, in one place.</p>
                <div className="stat-strip">
                  <div className="stat"><b>3,400+</b><span>Verified listings</span></div>
                  <div className="stat"><b>16</b><span>Regions covered</span></div>
                  <div className="stat"><b>1,900+</b><span>Hosts earning on Fiebnb</span></div>
                </div>
              </div>
              <img src="https://picsum.photos/seed/fiebnb-about1/700/560" alt="Fiebnb Story" />
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">What we believe</p><h2>The principles behind the product</h2></div></div>
            <div className="value-grid">
              <div className="value-card">
                <span className="tag">01</span>
                <h3>Trust is earned, not assumed</h3>
                <p>Every host is checked before they're listed. We'd rather have fewer listings than unreliable ones.</p>
              </div>
              <div className="value-card">
                <span className="tag">02</span>
                <h3>Ghana isn't a niche market</h3>
                <p>We build for Mobile Money, local addresses, and the way people actually search — not a global template with our logo on it.</p>
              </div>
              <div className="value-card">
                <span className="tag">03</span>
                <h3>Hosts are our other customer</h3>
                <p>A guesthouse owner in Takoradi deserves the same quality tools as a hotel chain in Accra.</p>
              </div>
              <div className="value-card">
                <span className="tag">04</span>
                <h3>A stay is more than a transaction</h3>
                <p><em style={{fontStyle: 'normal'}}>Fie</em> means home. We try to make every booking feel a little closer to that, whether it's for one night or one year.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" style={{borderBottom: 'none'}}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Want to help build this?</h2>
              <p>We're hiring across engineering, design, and host success.</p>
              <div className="actions">
                <Link to="/careers" className="btn" style={{background: 'var(--gold)', color: 'var(--ink)'}}>See open roles</Link>
                <Link to="/contact" className="btn btn-outline" style={{borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)'}}>Get in touch</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutView;
