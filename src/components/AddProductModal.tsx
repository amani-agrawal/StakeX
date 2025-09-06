import React, { useState } from 'react';
import { Product } from '../types';

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'>) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    link: '',
    price: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Product image is required';
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      link: formData.link.trim() || undefined,
      price: formData.price ? Number(formData.price) : undefined
    };

    onAddProduct(productData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Product</h2>
        </div>

        <form onSubmit={handleSubmit}>
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
            {errors.name && <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>{errors.name}</div>}
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
            {errors.description && <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>{errors.description}</div>}
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
            {errors.image && <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>{errors.image}</div>}
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
            {errors.price && <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>{errors.price}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
