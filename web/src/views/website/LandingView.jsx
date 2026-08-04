import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BadgeCheck, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';
import './LandingView.css';

const LandingView = () => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/browse');
  };

  return (
    <div className="landing-page">
      <header className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Ghana's own stay marketplace</p>
            <h1>Come home to a<br/>place that <em>fie</em>els<br/>like yours.</h1>
            <p className="lede">From Osu guesthouses to Airport City apartments — book verified short stays or settle into a long-term rental, all in one place. <em style={{fontStyle: 'normal', color: 'var(--ink-soft)'}}>Fie</em> means "home."</p>
          </div>
          <div className="hero-collage mt-3">
            <div className="col">
              <img src="https://images.pexels.com/photos/35615100/pexels-photo-35615100.jpeg" alt="Beautiful apartment" />
              <img src="https://images.pexels.com/photos/18556827/pexels-photo-18556827.jpeg" alt="Guesthouse" />
            </div>
            <div className="col">
              <img src="https://images.pexels.com/photos/37588918/pexels-photo-37588918.jpeg" alt="Living area" />
              <img src="https://www.graphic.com.gh/images/2024/oct/02/lancaster_kumasi_city.jpg" alt="Bedroom" />
            </div>
          </div>
        </div>

        <div className="wrap">
          <form className="search-card" onSubmit={handleSearch}>
            <div className="search-field">
              <label htmlFor="s-loc">Where</label>
              <input id="s-loc" type="text" placeholder="Accra, Kumasi, Cape Coast…" defaultValue="Accra, Greater Accra" />
            </div>
            <div className="search-field">
              <label htmlFor="s-type">Stay type</label>
              <select id="s-type">
                <option>Short stay</option>
                <option>Hotel / Guesthouse</option>
                <option>Long-term rental</option>
              </select>
            </div>
            <div className="search-field">
              <label htmlFor="s-dates">Check-in — Check-out</label>
              <input id="s-dates" type="text" placeholder="Add dates" />
            </div>
            <div className="search-field">
              <label htmlFor="s-guests">Guests</label>
              <select id="s-guests" defaultValue="2 guests">
                <option>1 guest</option>
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4+ guests</option>
              </select>
            </div>
            <div className="search-submit">
              <button className="btn btn-primary" type="submit" aria-label="Search stays">
                <Search size={19} />
              </button>
            </div>
          </form>
        </div>

        <div className="wrap">
          <div className="stats-bar">
            <div className="stat"><b>3,400+</b><span>Verified listings nationwide</span></div>
            <div className="stat"><b>16</b><span>Regions covered</span></div>
            <div className="stat"><b>4.8★</b><span>Average guest rating</span></div>
            <div className="stat"><b>1,900+</b><span>Hosts earning on Fiebnb</span></div>
          </div>
        </div>
      </header>

      <main>
        <section className="section">
          <div className="wrap">
            <p className="eyebrow">Browse by type</p>
            <div className="section-head">
              <h2>Whatever "home for now" means to you</h2>
            </div>
            <div className="cat-grid">
              <Link className="cat-card" to="/browse?type=hotel">
                <img src="https://picsum.photos/seed/fiebnb-cat-hotel/500/560" alt="Hotels" />
                <div><h3>Hotels</h3><p>420 listings</p></div>
              </Link>
              <Link className="cat-card" to="/browse?type=guesthouse">
                <img src="https://picsum.photos/seed/fiebnb-cat-guest/500/560" alt="Guesthouses" />
                <div><h3>Guesthouses</h3><p>860 listings</p></div>
              </Link>
              <Link className="cat-card" to="/browse?type=apartment">
                <img src="https://picsum.photos/seed/fiebnb-cat-apt/500/560" alt="Apartments" />
                <div><h3>Apartments</h3><p>1,240 listings</p></div>
              </Link>
              <Link className="cat-card" to="/browse?type=long-term">
                <img src="https://picsum.photos/seed/fiebnb-cat-long/500/560" alt="Long-term rentals" />
                <div><h3>Long-term rentals</h3><p>580 listings</p></div>
              </Link>
            </div>
          </div>
        </section>

        <div className="wrap"><div className="weave-strip thin"><span></span><span></span><span></span><span></span></div></div>

        <section className="section" id="featured">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Handpicked</p>
                <h2>Popular stays in Accra right now</h2>
              </div>
              <Link to="/browse" className="btn btn-outline btn-sm">View all stays <ArrowRight size={15} /></Link>
            </div>
            <div className="rail" id="featured-rail">
               {/* dynamic content can be injected here later */}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <p className="eyebrow">Why Fiebnb</p>
            <div className="section-head"><h2>Booking a stay, done properly</h2></div>
            <div className="why-grid">
              <div className="why-card">
                <div className="ic"><BadgeCheck size={22} /></div>
                <h3>Verified owners, always</h3>
                <p>Every hotel, guesthouse and landlord on Fiebnb is ID-verified and site-inspected before their first listing goes live.</p>
              </div>
              <div className="why-card">
                <div className="ic"><ShieldCheck size={22} /></div>
                <h3>Protected payments</h3>
                <p>Pay by Mobile Money or card with funds held securely until 24 hours after you check in — for stays of a night or a year.</p>
              </div>
              <div className="why-card">
                <div className="ic"><Headphones size={22} /></div>
                <h3>Real local support</h3>
                <p>A Ghana-based support team, reachable on WhatsApp, that actually knows the difference between East Legon and Airport Residential.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="host-cta">
              <div>
                <p className="eyebrow" style={{color: 'var(--gold-pale)'}}>For property owners</p>
                <h2>Turn your rooms into<br/>steady income.</h2>
                <p>Whether you run a guesthouse, manage an apartment block, or rent out a family property long-term — list free and reach thousands of verified guests across Ghana.</p>
                <div className="actions">
                  <Link to="/register" className="btn" style={{background: 'var(--gold)', color: 'var(--ink)'}}>List your property</Link>
                  <Link to="/dashboard" className="btn btn-outline" style={{borderColor: 'rgba(250,246,239,0.3)', color: 'var(--paper)'}}>See host tools</Link>
                </div>
              </div>
              <div className="host-stats">
                <div className="host-stat"><span>Avg. monthly payout, Accra host</span><b>₵6,200</b></div>
                <div className="host-stat"><span>Time to first booking</span><b>9 days</b></div>
                <div className="host-stat"><span>Commission — you keep</span><b>92%</b></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <p className="eyebrow">Guest stories</p>
            <div className="section-head"><h2>Trusted by travellers and tenants alike</h2></div>
            <div className="testimonial-grid">
              <div className="testi">
                <p>"Booked a guesthouse in Kumasi the night before a wedding. Owner met me at the gate himself — felt safer than any hotel app I've used."</p>
                <div className="testi-who">
                  <img src="https://picsum.photos/seed/fiebnb-t1/80/80" alt="Nana Ama" />
                  <div><b>Nana Ama O.</b><span>Guest, Kumasi</span></div>
                </div>
              </div>
              <div className="testi">
                <p>"Moved to Accra for work and found a 6-month furnished flat in two days. No agent fees, no drama."</p>
                <div className="testi-who">
                  <img src="https://picsum.photos/seed/fiebnb-t2/80/80" alt="Kwabena" />
                  <div><b>Kwabena T.</b><span>Long-term tenant</span></div>
                </div>
              </div>
              <div className="testi">
                <p>"We list all 14 rooms of our guesthouse here. Fiebnb's payouts land faster than any other platform we've tried."</p>
                <div className="testi-who">
                  <img src="https://picsum.photos/seed/fiebnb-t3/80/80" alt="Abena Guesthouse" />
                  <div><b>Abena Guesthouse</b><span>Host, Takoradi</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingView;
