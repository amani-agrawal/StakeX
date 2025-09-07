import React, { useState } from 'react';
import { Product, Page } from '../types';

interface CreateProductPageProps {
  onNavigate: (page: Page) => void;
  onCreate: (input: { name: string; description: string; price: number; file: File; isMarketItem?: boolean; initialBid?: number }) => void;
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
    isMarketItem: false,  // checkbox for market item
    initialBid: '',       // initial bid amount for market items
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // -------- handlers --------
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (errors.file) setErrors(prev => ({ ...prev, file: '' }));
  };

  // -------- validation --------
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Product description is required';
    if (!selectedFile) newErrors.file = 'Please select an image file';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price is required and must be a positive number';
    }

    if (formData.isMarketItem && (!formData.initialBid || isNaN(Number(formData.initialBid)) || Number(formData.initialBid) <= 0)) {
      newErrors.initialBid = 'Initial bid is required and must be a positive number';
    }
    if (formData.isMarketItem && Number(formData.initialBid) >= Number(formData.price)) {
      newErrors.initialBid = 'Initial bid must be less than the product price';
    }
    if (itemType === 'my' && formData.yearsOfUse && (isNaN(Number(formData.yearsOfUse)) || Number(formData.yearsOfUse) < 0)) {
      newErrors.yearsOfUse = 'Years of use must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- submit --------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedFile) return;

    // Debug: Log what we're about to send
    console.log('📝 Form data:', formData);
    console.log('📁 Selected file:', selectedFile.name, selectedFile.size, 'bytes');

    // Build description with additional info for My Items
    const descriptionAugmented =
      itemType === 'my'
        ? `${formData.description.trim()}\n\nYears of use: ${formData.yearsOfUse || 'N/A'}\nAuthenticity certificate: ${formData.certificate === 'yes' ? 'Yes' : 'No'}`
        : formData.description.trim();

    // Add link to description for market items
    const finalDescription = itemType === 'market' && formData.link.trim() 
      ? `${descriptionAugmented}\n\nProduct Link: ${formData.link.trim()}`
      : descriptionAugmented;

    const productInput = {
      name: formData.name.trim(),
      description: finalDescription,
      price: Number(formData.price),
      file: selectedFile,
      isMarketItem: formData.isMarketItem,
      initialBid: formData.isMarketItem ? Number(formData.initialBid) : 0,
    };

    console.log('📦 Product input being sent:', productInput);
    onCreate(productInput);
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

        {/* Image File Upload */}
        <div className="form-group">
          <label className="form-label">Product Image <span className="required">*</span></label>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>
            Upload an image file (JPG, PNG, GIF, etc.). Maximum size: 5MB.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-input"
            style={{ padding: '8px' }}
          />
          {selectedFile && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          {errors.file && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.file}</div>}
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
          <label className="form-label">Price <span className="required">*</span></label>
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

        {/* Market Item Checkbox */}
        <div className="form-group">
          <label className="form-label">
            <input
              type="checkbox"
              name="isMarketItem"
              checked={formData.isMarketItem}
              onChange={handleTextChange}
              style={{ marginRight: '8px' }}
            />
            Market Item (enables bidding)
          </label>
        </div>

        {/* Initial Bid (only for market items) */}
        {formData.isMarketItem && (
          <div className="form-group">
            <label className="form-label">Initial Bid <span className="required">*</span></label>
            <input
              type="number"
              name="initialBid"
              value={formData.initialBid}
              onChange={handleTextChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.initialBid && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.initialBid}</div>}
          </div>
        )}

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
