import React from 'react';
import { HistoryOrder, Product, Page } from '../types';
import DemandValueBadge from './DemandValueBadge';

interface OrdersPageProps {
  orders: HistoryOrder[];
  products: Product[];
  onNavigate: (page: Page) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, products, onNavigate }) => {
  // Create a quick index for product lookups
  const byId = new Map(products.map(p => [p.id, p]));

  if (!orders?.length) {
    return (
      <div className="page-container">
        <div className="cart-section">
          <h2 className="section-title">Order History</h2>
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No orders yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="cart-section">
        <h2 className="section-title">Order History</h2>
        <div className="grid gap-3">
          {orders.map((order, i) => {
            const product = byId.get(order.productId);
            return (
              <div key={`${order.productId}-${i}`} className="cart-item">
                <img
                  src={product?.imageUrl || product?.image || 'https://via.placeholder.com/200x200?text=No+Image'}
                  alt={product?.name || 'Product'}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <div className="cart-item-name">{product?.name || 'Unknown product'}</div>
                  <div className="cart-item-price">
                    Price at purchase: ${order.priceAtPurchase.toFixed(2)}
                  </div>
                  <DemandValueBadge value={product?.demandValue} />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Purchased: {new Date(order.purchasedAt).toLocaleString()}
                  </div>
                  {product?.description && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      {product.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;