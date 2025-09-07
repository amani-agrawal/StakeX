import React, { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { Product } from '../types';

type Props = {
  products: Product[];
  initialQuery?: string;
  onResults: (results: Product[], query: string, opts?: { explicit?: boolean }) => void;
};

const TopBar: React.FC<Props> = ({ products, initialQuery = '', onResults }) => {
  const [q, setQ] = useState(initialQuery);
  const fuse = useMemo(
    () =>
      new Fuse(products, {
        threshold: 0.35,
        minMatchCharLength: 2,
        ignoreLocation: true,
        keys: ['name', 'description'],
      }),
    [products]
  );

  // Debounced search - only for typing, not explicit search
  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) {
        onResults(products, '', { explicit: false });
      } else {
        const found = fuse.search(q).map(r => r.item);
        onResults(found, q, { explicit: false });
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q, fuse, onResults, products]);

  // Handle explicit search on form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      onResults(products, '', { explicit: true });
    } else {
      const found = fuse.search(query).map(r => r.item);
      onResults(found, query, { explicit: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="topbar">
      <input
        className="searchInput"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products… (typo friendly)"
      />
      <button type="submit" className="searchButton">Search</button>
    </form>
  );
};

export default TopBar;
