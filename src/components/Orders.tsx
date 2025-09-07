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

     
      {/* Owned Products Section */}
      <div className="cart-section">
        <h2 className="section-title">Order History:</h2>
        {ownedProducts.length > 0 ? (
          ownedProducts.map((product) => (
            <div key={product.id} className="cart-item">
              <img 
                src={product.imageUrl || product.image || 'https://via.placeholder.com/200x200?text=No+Image'} 
                alt={product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{product.name}</div>
                <div className="cart-item-price">
                  {product.price ? `Owned - $${product.price}` : 'Owned'}
                </div>
                {product.demandValue != null && typeof product.demandValue === 'number' && product.demandValue !== product.price && (
                  <div className="cart-item-demand-value" style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '14px' }}>
                    Demand Value: ${product.demandValue}
                  </div>
                )}
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

    </div>
  );
};

export default OrdersPage;