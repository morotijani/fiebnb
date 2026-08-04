import React from 'react';
import { MessageCircle, Mail, Briefcase, MapPin } from 'lucide-react';

const ContactView = () => {
  return (
    <div className="contact-page">
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">Contact</p>
          <h1>Talk to a real person</h1>
          <p className="lede">Whether it's a booking question, a host application, or press — pick a channel or send a message below.</p>
        </div>
      </header>

      <main>
        <section className="content-section" style={{borderBottom: 'none'}}>
          <div className="wrap">
            <div className="contact-grid">
              <div>
                <div className="contact-channels">
                  <div className="channel-card">
                    <div className="ic"><MessageCircle /></div>
                    <div><h3>WhatsApp support</h3><p>+233 20 000 0000 · Daily, 7am – 10pm GMT</p></div>
                  </div>
                  <div className="channel-card">
                    <div className="ic"><Mail /></div>
                    <div><h3>Guest & host support</h3><p>support@fiebnb.com · replies within 24 hours</p></div>
                  </div>
                  <div className="channel-card">
                    <div className="ic"><Briefcase /></div>
                    <div><h3>Press & partnerships</h3><p>press@fiebnb.com</p></div>
                  </div>
                  <div className="channel-card">
                    <div className="ic"><MapPin /></div>
                    <div><h3>Head office</h3><p>12 Kofi Annan Ave, Airport Residential, Accra</p></div>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <form onSubmit={(e) => { e.preventDefault(); alert('Message sending isn\'t wired up yet.'); }}>
                  <div className="form-field">
                    <label htmlFor="c-name">Full name</label>
                    <input id="c-name" type="text" placeholder="Ama Owusu" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="c-email">Email</label>
                    <input id="c-email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="c-topic">Topic</label>
                    <select id="c-topic">
                      <option>Booking question</option>
                      <option>Becoming a host</option>
                      <option>Trust & safety report</option>
                      <option>Press & partnerships</option>
                      <option>Careers</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="c-msg">Message</label>
                    <textarea id="c-msg" placeholder="Tell us what's going on…" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Send message</button>
                  <p className="form-note">We typically reply within 24 hours. For anything urgent during a stay, use WhatsApp support instead.</p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactView;
