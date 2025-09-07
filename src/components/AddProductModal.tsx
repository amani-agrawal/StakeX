import React, { useState } from 'react';
import { Product, Page } from '../types';

interface CreateProductPageProps {
  onNavigate: (page: Page) => void;
  onCreate: (product: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'>) => void;
}

type ItemType = 'market' | 'my';

const CreateProductPage: React.FC<CreateProductPageProps> = ({ onNavigate, onCreate }) => {
  const [itemType, setItemType] = useState<ItemType>('market'); // "Market Item" | "My Item"

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    price: '',            // "value"
    yearsOfUse: '',       // only for "My Item"
    certificate: 'no',    // only for "My Item"  ('yes' | 'no')
  });

  // Support multiple (or single) image URLs
  const [images, setImages] = useState<string[]>(['']);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // -------- handlers --------
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (idx: number, value: string) => {
    setImages(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  const addImageField = () => setImages(prev => [...prev, '']);
  const removeImageField = (idx: number) =>
    setImages(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  // -------- validation --------
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Product description is required';

    const nonEmptyImages = images.map(s => s.trim()).filter(Boolean);
    if (nonEmptyImages.length === 0) {
      newErrors.images = 'At least one image URL is required';
    } else {
      // Validate that all image URLs are valid
      for (let i = 0; i < nonEmptyImages.length; i++) {
        try {
          new URL(nonEmptyImages[i]);
        } catch {
          newErrors.images = 'Please enter valid image URLs (e.g., https://example.com/image.jpg)';
          break;
        }
      }
    }

    if (formData.price && isNaN(Number(formData.price))) newErrors.price = 'Value must be a valid number';

    if (itemType === 'my' && formData.yearsOfUse && (isNaN(Number(formData.yearsOfUse)) || Number(formData.yearsOfUse) < 0)) {
      newErrors.yearsOfUse = 'Years of use must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- submit --------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const primaryImage = images.map(s => s.trim()).find(Boolean) || '';
    
    // Debug: Log what we're about to send
    console.log('📝 Form data:', formData);
    console.log('🖼️ Images:', images);
    console.log('🖼️ Primary image:', primaryImage);

    // For now, we keep the Product type unchanged (single image).
    // We'll append My Item extras into the description so you don't need a type change yet.
    const descriptionAugmented =
      itemType === 'my'
        ? `${formData.description.trim()}\n\nYears of use: ${formData.yearsOfUse || 'N/A'}\nAuthenticity certificate: ${formData.certificate === 'yes' ? 'Yes' : 'No'}`
        : formData.description.trim();

    const productData: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'> = {
      name: formData.name.trim(),
      description: descriptionAugmented,
      image: primaryImage,
      ...(formData.price ? { price: Number(formData.price) } : {}),
      // Add link to description for market items instead of separate field
      ...(itemType === 'market' && formData.link.trim() ? { 
        description: `${descriptionAugmented}\n\nProduct Link: ${formData.link.trim()}` 
      } : {}),
      personalItem: itemType === 'my',
    };

    console.log('📦 Product data being sent:', productData);
    onCreate(productData);

    onNavigate('account'); // or 'landing' if you prefer
  };

  // -------- UI --------
  return (
    <div className="page-container">
      {/* Top Bar */}

      {/* Switch: Market Item / My Item */}
      <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
        <button
          type="button"
          className={`toggle-btn ${itemType === 'market' ? 'active' : ''}`}
          onClick={() => setItemType('market')}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: itemType === 'market' ? '#eef2ff' : '#fff',
            fontWeight: 600,
          }}
        >
          Market Item
        </button>
        <button
          type="button"
          className={`toggle-btn ${itemType === 'my' ? 'active' : ''}`}
          onClick={() => setItemType('my')}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: itemType === 'my' ? '#eef2ff' : '#fff',
            fontWeight: 600,
          }}
        >
          My Item
        </button>
      </div>

      {/* Header */}
      {itemType === 'market' && (
          <div style={{ padding: '0 16px' }}>
            <h2 style={{ margin: 0 }}>Add a new Market Product</h2>
            <p style={{ margin: '6px 0 0 0', fontSize: 12, opacity: 0.8 }}>
              Fill the details below and publish your product.
            </p>
          </div>
        )}
      {itemType === 'my' && (
          <div style={{ padding: '0 16px' }}>
            <h2 style={{ margin: 0 }}>Add your Product</h2>
            <p style={{ margin: '6px 0 0 0', fontSize: 12, opacity: 0.8 }}>
              Fill the details below and publish your product.
            </p>
          </div>
        )}
      

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'grid', gap: 16, maxWidth: 600 }}>
        {/* Name (common) */}
        <div className="form-group">
          <label className="form-label">Product Name <span className="required">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            className="form-input"
            placeholder="Enter product name"
          />
          {errors.name && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.name}</div>}
        </div>

        {/* Multiple / Single Images (common) */}
        <div className="form-group">
          <label className="form-label">Image URL(s) <span className="required">*</span></label>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>
            Enter a valid image URL (e.g., https://example.com/image.jpg). You can use any online image URL.
          </p>
          {images.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                type="url"
                value={url}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                className="form-input"
                placeholder="https://example.com/image.jpg"
                style={{ flex: 1 }}
              />
              {images.length > 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => removeImageField(idx)}>
                  −
                </button>
              )}
              {idx === images.length - 1 && (
                <button type="button" className="btn btn-primary" onClick={addImageField}>
                  + Add
                </button>
              )}
            </div>
          ))}
          {errors.images && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.images}</div>}
        </div>

        {/* Description (common) */}
        <div className="form-group">
          <label className="form-label">Description <span className="required">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleTextChange}
            className="form-textarea"
            placeholder="Enter product description"
          />
          {errors.description && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.description}</div>}
        </div>

        {/* Value (common) */}
        <div className="form-group">
          <label className="form-label">Value (optional)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleTextChange}
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.price && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.price}</div>}
        </div>

        {/* Market-only: Link (optional) */}
        {itemType === 'market' && (
          <div className="form-group">
            <label className="form-label">Product Link (optional)</label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleTextChange}
              className="form-input"
              placeholder="https://example.com/product"
            />
          </div>
        )}

        {/* My Item-only: Years of use + Certificate */}
        {itemType === 'my' && (
          <>
            <div className="form-group">
              <label className="form-label">Years of Use (optional)</label>
              <input
                type="number"
                name="yearsOfUse"
                value={formData.yearsOfUse}
                onChange={handleTextChange}
                className="form-input"
                placeholder="e.g., 2"
                min="0"
              />
              {errors.yearsOfUse && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.yearsOfUse}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Authenticity Certificate Provided?</label>
              <select
                name="certificate"
                value={formData.certificate}
                onChange={handleTextChange}
                className="form-input"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('landing')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Publish
          </button>
        </div>
      </form>

      {/* Bottom Navigation */}
    </div>
  );
};

export default CreateProductPage;
