import React, { useState, useMemo, useCallback } from 'react';
import { Product } from '../types';

interface SearchBarProps {
  products: Product[];
  onSearchResults: (filteredProducts: Product[]) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  products, 
  onSearchResults, 
  placeholder = "Search products..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Generate common variations and misspellings
  const getWordVariations = useCallback((word: string): string[] => {
    const variations = [word];
    
    // Common letter substitutions
    const substitutions: { [key: string]: string[] } = {
      'c': ['k', 's'],
      'k': ['c'],
      's': ['c', 'z'],
      'z': ['s'],
      'ph': ['f'],
      'f': ['ph'],
      'i': ['y'],
      'y': ['i'],
      'e': ['a'],
      'a': ['e'],
      'o': ['u'],
      'u': ['o']
    };
    
    // Generate variations with common substitutions
    for (const [original, replacements] of Object.entries(substitutions)) {
      if (word.includes(original)) {
        for (const replacement of replacements) {
          variations.push(word.replace(original, replacement));
        }
      }
    }
    
    // Add common typos (missing letters, extra letters)
    for (let i = 0; i < word.length; i++) {
      // Missing letter
      variations.push(word.slice(0, i) + word.slice(i + 1));
      // Extra letter (common ones)
      ['a', 'e', 'i', 'o', 'u', 'h', 'n', 'r', 's', 't'].forEach(letter => {
        variations.push(word.slice(0, i) + letter + word.slice(i));
      });
    }
    
    return variations;
  }, []);

  // Fuzzy search function
  const fuzzySearch = useCallback((text: string, query: string): boolean => {
    if (!query) return true;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match
    if (textLower.includes(queryLower)) return true;
    
    // Fuzzy match - check if all characters in query exist in order in text
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    
    // If we found all characters in order, it's a match
    if (queryIndex === queryLower.length) return true;
    
    // Check for common misspellings and variations
    const variations = getWordVariations(queryLower);
    return variations.some(variation => textLower.includes(variation));
  }, [getWordVariations]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }

    return products.filter(product => {
      const searchFields = [
        product.name,
        product.description,
        // Add more fields if needed
      ].join(' ');

      return fuzzySearch(searchFields, searchTerm);
    });
  }, [products, searchTerm, fuzzySearch]);

  // Update parent component when search results change
  React.useEffect(() => {
    onSearchResults(filteredProducts);
  }, [filteredProducts, onSearchResults]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="search-clear" 
            onClick={clearSearch}
            title="Clear search"
          >
            ✕
          </button>
        )}
        <div className="search-icon">🔍</div>
      </div>
      {searchTerm && (
        <div className="search-results-info">
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} 
          {filteredProducts.length < products.length && ` out of ${products.length}`}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
