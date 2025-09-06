import React from 'react';
import { CartItem, Product, Page } from '../types';

interface CartPageProps {
  cart: CartItem[];
  ownedProducts: Product[];
  onNavigate: (page: Page) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, ownedProducts, onNavigate }) => {
  return (
    <div className="page-container">
      {/* Top Bar */}
      <div className="top-bar">
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('landing')}
        >
          Home
        </button>
      </div>

      {/* Bid Products Section */}
      <div className="cart-section">
        <h2 className="section-title">Products you have bid for:</h2>
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <img 
                src={item.product.image} 
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-price">
                  {item.bidAmount ? `Bid: $${item.bidAmount}` : `Price: $${item.product.price || 'N/A'}`}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Added: {item.addedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p>No products in your cart</p>
          </div>
        )}
      </div>

      {/* Owned Products Section */}
      <div className="cart-section">
        <h2 className="section-title">Products you already own:</h2>
        {ownedProducts.length > 0 ? (
          ownedProducts.map((product) => (
            <div key={product.id} className="cart-item">
              <img 
                src={product.image} 
                alt={product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{product.name}</div>
                <div className="cart-item-price">
                  {product.price ? `Owned - $${product.price}` : 'Owned'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {product.description}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No owned products</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-bar">
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('landing')}
        >
          Home
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => onNavigate('account')}
        >
          Account
        </button>
      </div>
    </div>
  );
};

export default CartPage;
