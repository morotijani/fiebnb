import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Heart } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { FIEBNB_LISTINGS } from '../../data/mockListings';
import './BrowseView.css';

const StarIcon = () => (
  <svg viewBox="0 0 20 20" style={{ width: '13px', height: '13px', fill: 'var(--gold-deep)', stroke: 'none' }}>
    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z"/>
  </svg>
);

const BrowseView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [qLoc, setQLoc] = useState('');
  const [term, setTerm] = useState(searchParams.get('term') || 'all');
  const [types, setTypes] = useState(searchParams.get('type') ? [searchParams.get('type')] : []);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('rec');

  // Fetch real properties from database
  const { data: dbProperties = [] } = useQuery({
    queryKey: ['publicProperties'],
    queryFn: async () => {
      try {
        const res = await axiosClient.get('/properties/public');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  // Combine DB listings with Mock listings
  const allListings = useMemo(() => {
    const formattedDb = dbProperties.map(p => {
      const isHomeowner = p.property_type === 'HOMEOWNER';
      return {
        id: p.id,
        title: p.title,
        city: p.address?.split(',')[1]?.trim() || 'Accra',
        area: p.address?.split(',')[0]?.trim() || p.address || 'Greater Accra',
        type: isHomeowner ? 'House' : (p.property_type === 'APARTMENT' ? 'Apartment' : 'Hotel'),
        term: isHomeowner || p.property_type === 'APARTMENT' ? 'long' : 'short',
        price: p.base_price,
        unit: isHomeowner || p.property_type === 'APARTMENT' ? 'month' : 'night',
        rating: 4.9,
        reviews: 18,
        guests: (p.bedrooms || 1) * 2,
        beds: p.bedrooms || 1,
        baths: p.bathrooms || 1,
        seed: `fiebnb-${p.id.slice(0, 5)}`,
        tags: p.amenities && p.amenities.length > 0 ? p.amenities : ['Water reservoir', 'Gated compound', 'Parking'],
        imageUrl: p.images && p.images.length > 0
          ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:3000${p.images[0]}`)
          : null
      };
    });
    return [...formattedDb, ...FIEBNB_LISTINGS];
  }, [dbProperties]);

  // Computed listings
  const filteredListings = useMemo(() => {
    let list = [...allListings];

    if (qLoc) {
      const q = qLoc.toLowerCase();
      list = list.filter(l => (l.city + " " + l.area).toLowerCase().includes(q));
    }
    if (city) {
      list = list.filter(l => l.city === city);
    }
    if (term !== 'all') {
      list = list.filter(l => l.term === term);
    }
    if (types.length > 0) {
      list = list.filter(l => types.includes(l.type));
    }
    if (minPrice && !isNaN(minPrice)) {
      list = list.filter(l => l.price >= parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      list = list.filter(l => l.price <= parseFloat(maxPrice));
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [qLoc, city, term, types, minPrice, maxPrice, sort]);

  const handleTypeChange = (typeStr) => {
    setTypes(prev => prev.includes(typeStr) ? prev.filter(t => t !== typeStr) : [...prev, typeStr]);
  };

  const resetFilters = () => {
    setQLoc('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setTypes([]);
    setSort('rec');
    setTerm('all');
    setSearchParams({}); // Clear URL params
  };

  return (
    <div className="browse-page">
      <header className="browse-head">
        <div className="wrap">
          <div className="browse-bar">
            <input 
              type="text" 
              placeholder="Search by city or area — e.g. Osu, Kumasi" 
              value={qLoc}
              onChange={(e) => setQLoc(e.target.value)}
            />
            <div className="div"></div>
            <select>
              <option>1 guest</option>
              <option>2 guests</option>
              <option>3 guests</option>
              <option>4+ guests</option>
            </select>
            <button className="btn btn-primary btn-sm">
              <Search size={15} /> Search
            </button>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="browse-layout">
          <aside className="filters">
            <h3>Filters</h3>
            <div className="filter-group">
              <div className="fg-title">Stay length</div>
              <div className="term-toggle">
                <button className={term === 'all' ? 'active' : ''} onClick={() => setTerm('all')}>Any</button>
                <button className={term === 'short' ? 'active' : ''} onClick={() => setTerm('short')}>Short stay</button>
                <button className={term === 'long' ? 'active' : ''} onClick={() => setTerm('long')}>Long-term</button>
              </div>
            </div>
            
            <div className="filter-group">
              <div className="fg-title">Property type</div>
              {['Hotel', 'Guesthouse', 'Apartment', 'House'].map(typeStr => (
                <label className="chk-row" key={typeStr}>
                  <span className="chk-label">
                    <input 
                      type="checkbox" 
                      className="f-type" 
                      value={typeStr} 
                      checked={types.includes(typeStr)}
                      onChange={() => handleTypeChange(typeStr)}
                    /> 
                    {typeStr}
                  </span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="fg-title">Price range (₵)</div>
              <div className="price-inputs">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span>–</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <div className="fg-title">City</div>
              <select 
                style={{width: '100%', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 10px', fontSize: '14px'}}
                value={city}
                onChange={e => setCity(e.target.value)}
              >
                <option value="">All cities</option>
                <option value="Accra">Accra</option>
                <option value="Kumasi">Kumasi</option>
                <option value="Takoradi">Takoradi</option>
                <option value="Cape Coast">Cape Coast</option>
                <option value="Elmina">Elmina</option>
                <option value="Tamale">Tamale</option>
              </select>
            </div>
            <button className="btn btn-ghost btn-block" style={{marginTop: '16px'}} onClick={resetFilters}>Clear all</button>
          </aside>

          <section>
            <div className="results-head">
              <div>
                <h1>Stays across Ghana</h1>
                <p className="results-count">{filteredListings.length} stay{filteredListings.length === 1 ? '' : 's'} found</p>
              </div>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="rec">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
            
            <div className="grid">
              {filteredListings.length === 0 ? (
                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--ink-soft)'}}>
                  <p style={{fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--ink)'}}>No stays match those filters</p>
                  <p style={{marginTop: '8px', fontSize: '14.5px'}}>Try widening your search — different area, dates or price range.</p>
                </div>
              ) : (
                filteredListings.map(l => (
                  <Link key={l.id} className="card listing-card" to={`/listing/${l.id}`}>
                    <div className="thumb">
                      <img src={l.imageUrl || `https://picsum.photos/seed/${l.seed}/500/440`} alt={l.title} />
                      <span className={`badge pill-tag ${l.term === 'long' ? 'forest' : 'gold'}`}>
                        {l.term === 'long' ? 'Long-term' : l.type}
                      </span>
                      <span className="fav"><Heart size={17} /></span>
                    </div>
                    <div style={{padding: '0 2px 16px'}}>
                      <div className="listing-title-row">
                        <h4>{l.title}</h4>
                        <span className="listing-rating"><StarIcon /> {l.rating}</span>
                      </div>
                      <p className="listing-loc">{l.area}, {l.city} · {l.term === "long" ? "Long-term" : "Short stay"}</p>
                      <p className="listing-price"><b>GH₵{l.price.toLocaleString()}</b> / {l.unit}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BrowseView;
