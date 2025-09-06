import React from 'react';
import { Product, Page } from '../types';

interface LandingPageProps {
  products: Product[];
  onNavigate: (page: Page) => void;
  onAddToCart: (product: Product, bidAmount?: number) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'>) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  products, 
  onNavigate, 
  onAddToCart, 
  onAddProduct 
}) => {

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
    alert('Product added to cart!');
  };

  const handleBid = (product: Product) => {
    const bidAmount = prompt(`Enter your bid amount for ${product.name}:`);
    if (bidAmount && !isNaN(Number(bidAmount))) {
      onAddToCart(product, Number(bidAmount));
      alert(`Bid of $${bidAmount} placed for ${product.name}!`);
    }
  };

  return (
    <div className="page-container">
      {/* Top Bar */}
      <div className="top-bar">
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('cart')}
        >
          Cart
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('order')}
        >
          Orders
        </button>
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img 
              src={product.image} 
              alt={product.name}
              className="product-image"
            />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            {product.price && (
              <div className="product-price">${product.price}</div>
            )}
            <div className="product-actions">
              <button 
                className="btn btn-primary btn-small"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
              <button 
                className="btn btn-success btn-small"
                onClick={() => handleBid(product)}
              >
                Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-bar">
        <button 
          className="btn btn-primary"
          onClick={() => onNavigate('landing')}
        >
          Home
        </button>
        <button 
          className="btn btn-add"
          onClick={() => onNavigate('post')}
          title="Add New Product"
        >
          +
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('account')}
        >
          Account
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
