import React, { useState, useRef } from 'react';
import { User, Product, Page } from '../types';
import DemandValueBadge from './DemandValueBadge';

interface AccountPageProps {
  user: User;
  currentProducts: Product[];
  onNavigate: (page: Page) => void;
  onAddToCart: (product: Product, bidAmount?: number) => void;
  onUpdateProfilePicture?: (imageUrl: string) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ 
  user, 
  currentProducts, 
  onNavigate, 
  onAddToCart,
  onUpdateProfilePicture
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'market'>('my');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfilePicture(imageUrl);
        if (onUpdateProfilePicture) {
          onUpdateProfilePicture(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="page-container">

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-picture-container" onClick={handleImageClick}>
          <img 
            src={profilePicture} 
            alt="Profile"
            className="profile-picture"
          />
          <div className="profile-upload-overlay">
            <span className="upload-icon">📷</span>
            <span className="upload-text">Tap to change</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* User Details */}
      <div className="user-details">
        <div className="user-detail">
          <span className="user-detail-label">Name:</span>
          <span className="user-detail-value">{user.name}</span>
        </div>
        <div className="user-detail">
          <span className="user-detail-label">Age:</span>
          <span className="user-detail-value">{user.age}</span>
        </div>
        <div className="user-detail">
          <span className="user-detail-label">Address:</span>
          <span className="user-detail-value">{user.address}</span>
        </div>
        <div className="user-detail">
          <span className="user-detail-label">Member Since:</span>
          <span className="user-detail-value">{user.memberSince}</span>
        </div>
      </div>

      {/* Product Toggle */}
      <div className="toggle-section">
        <div className="toggle-group">
          <button
            className={`toggle-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Products
          </button>
          <button
            className={`toggle-btn ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            Market Products
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="product-grid">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => ( ((product.personalItem===true && activeTab==='my') || (product.personalItem===false && activeTab==='market')) && (
            <div key={product.id} className="product-card">
              <img 
                src={product.imageUrl || product.image || 'https://via.placeholder.com/200x200?text=No+Image'} 
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              {product.price && (
                <div className="product-price">${product.price}</div>
              )}
              <DemandValueBadge value={product.demandValue} />
              {product.link && (
                <div style={{ marginBottom: '10px' }}>
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none', fontSize: '12px' }}
                  >
                    View Original →
                  </a>
                </div>
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
          )))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No {activeTab === 'my' ? 'my' : 'market'} products found</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AccountPage;
