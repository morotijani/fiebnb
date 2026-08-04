/* =========================================================
   FIEBNB — shared data & helpers
   ========================================================= */

const FIEBNB_LISTINGS = [
  { id:1,  title:"Breezy Studio at Airport Residential", city:"Accra", area:"Airport Residential", type:"Apartment", term:"short", price:420, unit:"night", rating:4.9, reviews:128, guests:2, beds:1, baths:1, seed:"fiebnb-l1", tags:["Self check-in","Wifi","AC"] },
  { id:2,  title:"The Osu Palm Guesthouse", city:"Accra", area:"Osu", type:"Guesthouse", term:"short", price:260, unit:"night", rating:4.7, reviews:212, guests:3, beds:2, baths:1, seed:"fiebnb-l2", tags:["Breakfast included","Wifi","Generator backup"] },
  { id:3,  title:"Labadi Suites — Executive Room", city:"Accra", area:"Labadi", type:"Hotel", term:"short", price:610, unit:"night", rating:4.8, reviews:341, guests:2, beds:1, baths:1, seed:"fiebnb-l3", tags:["Pool","Gym","Breakfast included"] },
  { id:4,  title:"Furnished 2-Bed, East Legon", city:"Accra", area:"East Legon", type:"Apartment", term:"long", price:4800, unit:"month", rating:4.9, reviews:47, guests:4, beds:2, baths:2, seed:"fiebnb-l4", tags:["Furnished","Gated compound","Parking"] },
  { id:5,  title:"Kumasi Garden City Guesthouse", city:"Kumasi", area:"Ridge", type:"Guesthouse", term:"short", price:190, unit:"night", rating:4.6, reviews:98, guests:2, beds:1, baths:1, seed:"fiebnb-l5", tags:["Wifi","Kitchenette"] },
  { id:6,  title:"Cape Coast Ocean-view Cottage", city:"Cape Coast", area:"Cape Coast Ridge", type:"Apartment", term:"short", price:340, unit:"night", rating:4.85, reviews:76, guests:4, beds:2, baths:1, seed:"fiebnb-l6", tags:["Ocean view","Wifi","Self check-in"] },
  { id:7,  title:"Takoradi Harbour Hotel — Deluxe", city:"Takoradi", area:"Harbour Area", type:"Hotel", term:"short", price:480, unit:"night", rating:4.7, reviews:154, guests:2, beds:1, baths:1, seed:"fiebnb-l7", tags:["Pool","Breakfast included"] },
  { id:8,  title:"3-Bed Family House, Spintex", city:"Accra", area:"Spintex", type:"House", term:"long", price:6200, unit:"month", rating:4.9, reviews:31, guests:6, beds:3, baths:3, seed:"fiebnb-l8", tags:["Furnished","Backup water","Parking"] },
  { id:9,  title:"Tamale City Centre Guesthouse", city:"Tamale", area:"City Centre", type:"Guesthouse", term:"short", price:150, unit:"night", rating:4.5, reviews:53, guests:2, beds:1, baths:1, seed:"fiebnb-l9", tags:["Wifi","AC"] },
  { id:10, title:"Airport City Corporate Studio", city:"Accra", area:"Airport City", type:"Apartment", term:"long", price:3900, unit:"month", rating:4.8, reviews:64, guests:2, beds:1, baths:1, seed:"fiebnb-l10", tags:["Furnished","Gym","Wifi"] },
  { id:11, title:"Elmina Heritage Guesthouse", city:"Elmina", area:"Old Town", type:"Guesthouse", term:"short", price:210, unit:"night", rating:4.75, reviews:88, guests:3, beds:2, baths:1, seed:"fiebnb-l11", tags:["Wifi","Courtyard"] },
  { id:12, title:"Trasacco Luxury Villa Room", city:"Accra", area:"Trasacco Valley", type:"House", term:"short", price:890, unit:"night", rating:4.95, reviews:39, guests:4, beds:2, baths:2, seed:"fiebnb-l12", tags:["Pool","Gym","Parking"] },
];

function starIcon(){
  return '<svg viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z"/></svg>';
}

function listingCard(l){
  return `
  <a class="card listing-card" href="listing.html?id=${l.id}">
    <div class="thumb">
      <img src="https://picsum.photos/seed/${l.seed}/500/440" alt="${l.title}">
      <span class="badge pill-tag gold">${l.type}</span>
      <span class="fav"><i data-lucide="heart"></i></span>
    </div>
    <div style="padding:0 2px 16px">
      <div class="listing-title-row">
        <h4>${l.title}</h4>
        <span class="listing-rating">${starIcon()} ${l.rating}</span>
      </div>
      <p class="listing-loc">${l.area}, ${l.city} · ${l.term === "long" ? "Long-term" : "Short stay"}</p>
      <p class="listing-price"><b>₵${l.price.toLocaleString()}</b> / ${l.unit}</p>
    </div>
  </a>`;
}

function renderRail(containerId, listings){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = listings.map(listingCard).join("");
  if(window.lucide) lucide.createIcons();
}

function renderGrid(containerId, listings){
  const el = document.getElementById(containerId);
  if(!el) return;
  if(listings.length === 0){
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink-soft)">
      <p style="font-family:var(--font-display);font-size:22px;color:var(--ink)">No stays match those filters</p>
      <p style="margin-top:8px;font-size:14.5px">Try widening your search — different area, dates or price range.</p>
    </div>`;
    return;
  }
  el.innerHTML = listings.map(listingCard).join("");
  if(window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  if(window.lucide) lucide.createIcons();
  renderRail("featured-rail", FIEBNB_LISTINGS.slice(0,8));
});

/* =========================================================
   Shared auth-page helpers — password toggles & OTP inputs
   ========================================================= */

function initPasswordToggles(){
  document.querySelectorAll(".pw-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if(!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = show
        ? '<i data-lucide="eye-off" style="width:18px;height:18px"></i>'
        : '<i data-lucide="eye" style="width:18px;height:18px"></i>';
      if(window.lucide) lucide.createIcons();
    });
  });
}

function initOtpInputs(containerId){
  const wrap = document.getElementById(containerId);
  if(!wrap) return;
  const inputs = Array.from(wrap.querySelectorAll("input"));
  inputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/[^0-9]/g, "").slice(0,1);
      if(inp.value && inputs[i+1]) inputs[i+1].focus();
    });
    inp.addEventListener("keydown", (e) => {
      if(e.key === "Backspace" && !inp.value && inputs[i-1]) inputs[i-1].focus();
    });
    inp.addEventListener("paste", (e) => {
      const text = (e.clipboardData || window.clipboardData).getData("text").replace(/[^0-9]/g, "");
      if(!text) return;
      e.preventDefault();
      text.split("").slice(0, inputs.length - i).forEach((ch, j) => { inputs[i+j].value = ch; });
      const next = inputs[Math.min(i + text.length, inputs.length - 1)];
      next.focus();
    });
  });
}

function initMethodToggle(containerId, onChange){
  const wrap = document.getElementById(containerId);
  if(!wrap) return;
  wrap.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if(onChange) onChange(btn.dataset.method);
    });
  });
}
