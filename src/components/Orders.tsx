import React from 'react';
import { CartItem, Product, Page } from '../types';

interface OrdersPageProps {
  cart: CartItem[];
  ownedProducts: Product[];
  onNavigate: (page: Page) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ cart, ownedProducts, onNavigate }) => {
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
          className="btn btn-primary"
          onClick={() => onNavigate('order')}
        >
          Orders
        </button>
      </div>

      {/* Bid Products Section */}
      <div className="cart-section">
        <h2 className="section-title">Ongoing Bids:</h2>
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
            <p>No ongoing bids.</p>
          </div>
        )}
      </div>

      {/* Owned Products Section */}
      <div className="cart-section">
        <h2 className="section-title">Order History:</h2>
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

export default OrdersPage;