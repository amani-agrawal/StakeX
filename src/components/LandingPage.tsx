import React, { useState } from 'react';
import { Product, Page } from '../types';
import { connectLute, payAlgo } from '../wallet/lute';

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
  onAddProduct,
}) => {
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onAddToCart(product);
    alert('Product added to cart!');
  };

  const handleBid = async (product: Product, e?: React.MouseEvent) => {
    //const { addMember } = useDao()
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
      // Connect to Lute wallet
      alert('Connecting to Lute wallet...');
      const addresses = await connectLute();
      
      if (!addresses || addresses.length === 0) {
        alert('Failed to connect to Lute wallet. Please try again.');
        return;
      }

      // Use the first connected address
      const fromAddress = addresses[0];
      alert(`Connected to wallet: ${fromAddress.substring(0, 8)}...`);

      // For demo purposes, we'll use a placeholder recipient address
      // In a real app, this would be the seller's address or a smart contract
      const toAddress = product.owner; // Placeholder
      
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
      
      // Only add to cart and create bid if payment was successful
      onAddToCart(product, normalized);
      alert(`Bid of $${normalized} placed for ${product.name}!`);
      //await addMember(product.daoId, addresses[0]);
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error?.message || 'Unknown error'}. Please try again.`);
    }
  };


  return (
    <div className="page-container">
      {/* Top Bar */}

      {/* Products Grid */}
      <div className="product-grid product-grid--big">
        {products.map((product) => {
          // support multiple images if present
          const imgs = (product as any).images?.length ? (product as any).images : [product.image];
          return (
            <div
              key={product.id}
              className="product-card product-card--big product-card-clickable"
              onClick={() => setOpenProduct(product)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenProduct(product); }}
            >
              {/* 1) Name */}
              <h3 className="product-name product-name--big">{product.name}</h3>

              {/* 2) Images (horizontal scroll) */}
              <div className="product-images-scroll" aria-label={`${product.name} images`}>
                {imgs.map((src: string, i: number) => (
                  <div className="product-image-slide" key={i}>
                    <img src={src} alt={`${product.name} ${i + 1}`} className="product-image--big" />
                  </div>
                ))}
              </div>

              {/* 3) Value */}
              {typeof product.price === 'number' && (
                <div className="product-price product-price--big">${product.price}</div>
              )}

              {/* 4) Description */}
              <p className="product-description product-description--big">{product.description}</p>

              {/* 5) Link / Years of use / Certificate */}
              <div className="product-meta">
                {(product as any).link && (
                  <a
                    href={(product as any).link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-link"
                  >
                    View Link →
                  </a>
                )}
                {(product as any).yearsOfUse !== undefined && (
                  <span className="product-pill">Years of use: {(product as any).yearsOfUse}</span>
                )}
                {(product as any).certificate !== undefined && (
                  <span className="product-pill">
                    Certificate: {(product as any).certificate ? 'Yes' : 'No'}
                  </span>
                )}
              </div>

              {/* Actions (still available; don’t open modal when clicking) */}
              <div className="product-actions">
                <button className="btn btn-primary btn-small" onClick={(e) => handleAddToCart(product, e)}>
                  Add to Cart
                </button>
                <button className="btn btn-success btn-small" onClick={(e) => handleBid(product, e)}>
                  Bid
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}

      {/* Optional: keep your existing modal; no change required */}
    </div>
  );
};

export default LandingPage;