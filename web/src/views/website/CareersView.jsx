import React, { useState } from 'react';

const ROLES = [
  { title: "Senior Backend Engineer", dept: "Engineering", loc: "Accra", type: "Full-time" },
  { title: "Product Designer, Host Tools", dept: "Design", loc: "Accra", type: "Full-time" },
  { title: "Mobile Engineer (React Native)", dept: "Engineering", loc: "Remote, Ghana", type: "Full-time" },
  { title: "Trust & Safety Lead", dept: "Trust & Safety", loc: "Accra", type: "Full-time" },
  { title: "Host Success Manager", dept: "Host Success", loc: "Kumasi", type: "Full-time" },
  { title: "Regional Growth Lead", dept: "Host Success", loc: "Takoradi", type: "Full-time" },
  { title: "Verification Associate", dept: "Trust & Safety", loc: "Accra", type: "Contract" },
];

export default function CareersView() {
  const [activeDept, setActiveDept] = useState('all');

  const filteredRoles = activeDept === 'all' ? ROLES : ROLES.filter(r => r.dept === activeDept);

  return (
    <>
      <style>{`
        .dept-filter { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .dept-filter button { border: 1px solid var(--line); background: var(--white); padding: 8px 16px; border-radius: var(--r-pill); font-size: 13.5px; font-weight: 600; color: var(--ink-soft); cursor: pointer; }
        .dept-filter button.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }
      `}</style>
      
      <header className="page-hero">
        <div className="wrap">
          <div className="weave-strip short"><span></span><span></span><span></span><span></span></div>
          <p className="eyebrow">Careers</p>
          <h1>Help more of Ghana find home for the night, or the year</h1>
          <p className="lede">We're a small, Accra-based team building for a market most global platforms have never taken seriously. Come build it properly.</p>
        </div>
      </header>

      <main>
        <section className="content-section">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">How we work</p><h2>Culture, in a few honest lines</h2></div></div>
            <div className="value-grid">
              <div className="value-card">
                <span className="tag">◆</span>
                <h3>Small team, real ownership</h3>
                <p>Under 40 people. You'll ship things that thousands of hosts and guests touch within your first month.</p>
              </div>
              <div className="value-card">
                <span className="tag">◆</span>
                <h3>Accra-first, not Accra-only</h3>
                <p>HQ is in Accra, but half the team works from Kumasi, Takoradi and Tamale to stay close to hosts outside the capital.</p>
              </div>
              <div className="value-card">
                <span className="tag">◆</span>
                <h3>Talk to real hosts and guests</h3>
                <p>Everyone, including engineers, does a guesthouse visit or a support shift in their first two weeks.</p>
              </div>
              <div className="value-card">
                <span className="tag">◆</span>
                <h3>Move at Ghana's pace, not Silicon Valley's</h3>
                <p>We build for spotty connectivity and Mobile Money, not for assumptions imported from bigger markets.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Open roles</p><h2>7 positions across 4 teams</h2></div></div>

            <div className="dept-filter" id="dept-filter">
              <button 
                className={activeDept === 'all' ? 'active' : ''} 
                onClick={() => setActiveDept('all')}
              >
                All
              </button>
              <button 
                className={activeDept === 'Engineering' ? 'active' : ''} 
                onClick={() => setActiveDept('Engineering')}
              >
                Engineering
              </button>
              <button 
                className={activeDept === 'Design' ? 'active' : ''} 
                onClick={() => setActiveDept('Design')}
              >
                Design
              </button>
              <button 
                className={activeDept === 'Trust & Safety' ? 'active' : ''} 
                onClick={() => setActiveDept('Trust & Safety')}
              >
                Trust & Safety
              </button>
              <button 
                className={activeDept === 'Host Success' ? 'active' : ''} 
                onClick={() => setActiveDept('Host Success')}
              >
                Host Success
              </button>
            </div>

            <div className="role-list" id="role-list">
              {filteredRoles.map((r, i) => (
                <div className="role-row" key={i}>
                  <div>
                    <h3>{r.title}</h3>
                    <div className="meta"><span>{r.dept}</span><span>{r.loc}</span><span>{r.type}</span></div>
                  </div>
                  <a href="/contact" className="btn btn-outline btn-sm">Apply</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section" style={{ borderBottom: 'none' }}>
          <div className="wrap">
            <div className="cta-band">
              <h2>Don't see the right role?</h2>
              <p>Send us a note anyway — we're growing quickly.</p>
              <div className="actions">
                <a href="/contact" className="btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Get in touch</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
