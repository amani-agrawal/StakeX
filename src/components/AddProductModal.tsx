import React, { useState } from 'react';
import { Product, Page } from '../types';

interface CreateProductPageProps {
  onNavigate: (page: Page) => void;
  onCreate: (product: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'>) => void;
}

const CreateProductPage: React.FC<CreateProductPageProps> = ({ onNavigate, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    link: '',
    price: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Product description is required';
    if (!formData.image.trim()) newErrors.image = 'Product image is required';
    if (formData.price && isNaN(Number(formData.price))) newErrors.price = 'Price must be a valid number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productData: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      ...(formData.link.trim() ? { link: formData.link.trim() } : {}),
      ...(formData.price ? { price: Number(formData.price) } : {})
    };

    onCreate(productData);
    onNavigate('account'); // or 'landing' if you prefer returning to home
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

      {/* Header */}
      <div style={{ padding: '16px 16px 0 16px' }}>
        <h2 style={{ margin: 0 }}>Add New Product</h2>
        <p style={{ margin: '6px 0 0 0', fontSize: 12, opacity: 0.8 }}>
          Fill the details below and publish your product.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'grid', gap: 16, maxWidth: 560 }}>
        <div className="form-group">
          <label className="form-label">
            Product Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter product name"
          />
          {errors.name && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Product Description <span className="required">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter product description"
          />
          {errors.description && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Product Image URL <span className="required">*</span>
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          {errors.image && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.image}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Product Link (optional)</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://example.com/product"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Price (optional)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.price && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>{errors.price}</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('landing')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Publish
          </button>
        </div>
      </form>

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
          style={{ background: '#7c3aed', color: '#fff' }}
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

export default CreateProductPage;
