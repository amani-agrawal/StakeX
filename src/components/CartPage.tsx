import React from 'react';
import { CartItem, Page, Product } from '../types';
import { connectLute, payAlgo } from '../wallet/lute';

interface CartPageProps {
  cart: CartItem[];
  onNavigate: (page: Page) => void;
  onRemoveFromCart: (index: number) => void;
  onAddToCart: (product: Product, bidAmount?: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, onNavigate, onRemoveFromCart, onAddToCart }) => {
  const handleBid = async (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // Demand value = product.price
    const max = typeof product.price === 'number' ? product.price : null;
    if (max === null) {
      alert('This product has no demand value set.');
      return;
    }

    const input = prompt(`Enter your bid for ${product.name} (0 < bid ≤ ${max}):`);
    if (input == null) return; // user cancelled

    const amount = Number(input);
    if (!Number.isFinite(amount) || amount <= 0 || amount > max) {
      alert(`Invalid bid. Please enter a number greater than 0 and up to ${max}.`);
      return;
    }

    const normalized = Math.round(amount * 100) / 100; // optional: 2 decimals

    try {
      // Create bid first (independent of payment)
      onAddToCart(product, normalized);
      alert(`Bid of $${normalized} placed for ${product.name}!`);
      
      // Optional: Handle wallet payment separately (non-blocking)
      try {
        alert('Connecting to Lute wallet for payment...');
        const addresses = await connectLute();
        
        if (addresses && addresses.length > 0) {
          const fromAddress = addresses[0];
          alert(`Connected to wallet: ${fromAddress.substring(0, 8)}...`);

          // For demo purposes, we'll use a placeholder recipient address
          const toAddress = product.owner;
          
          // Convert ALGO to microAlgos (1 ALGO = 1,000,000 microAlgos)
          const microAlgos = Math.round(normalized * 1000000);

          alert(`Processing payment of ${normalized} ALGO (${microAlgos} microAlgos)...`);
          
          // Process the payment through Lute
          const txId = await payAlgo({
            from: fromAddress,
            to: toAddress,
            microAlgos: microAlgos
          });

          alert(`Payment successful! Transaction ID: ${txId}`);
        } else {
          alert('Wallet connection failed, but bid was placed successfully.');
        }
      } catch (paymentError: any) {
        console.error('Payment error:', paymentError);
        alert(`Payment failed: ${paymentError?.message || 'Unknown error'}. Bid was still placed successfully.`);
      }
      
    } catch (error: any) {
      console.error('Bid creation error:', error);
      alert(`Failed to place bid: ${error?.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <div className="page-container">
      {/* Cart Items Only */}
      <div className="cart-section">
        <h2 className="section-title">Your Cart</h2>
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <img 
                src={item.product.imageUrl || item.product.image || 'https://via.placeholder.com/200x200?text=No+Image'} 
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-price">
                  {item.bidAmount ? `Bid: $${item.bidAmount}` : `Price: $${item.product.price || 'N/A'}`}
                </div>
                {item.product.demandValue != null && typeof item.product.demandValue === 'number' && item.product.demandValue !== item.product.price && (
                  <div className="cart-item-demand-value" style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '14px' }}>
                    Demand Value: ${item.product.demandValue}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Added: {item.addedAt.toLocaleDateString()}
                </div>
              </div>
              <div className="cart-item-description">{item.product.description}</div>
              
              {/* Action Buttons */}
              <div className="cart-item-actions">
                <button 
                  className="btn btn-success btn-small" 
                  onClick={(e) => handleBid(item.product, e)}
                >
                  Bid
                </button>
                <button 
                  className="btn btn-danger btn-small" 
                  onClick={() => onRemoveFromCart(index)}
                >
                  Remove
                </button>
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
    </div>
  );
};

export default CartPage;
