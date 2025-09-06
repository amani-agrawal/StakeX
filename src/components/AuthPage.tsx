import React, { useState } from 'react';
import './AuthPage.css';

interface AuthPageProps {
  onLogin: (userData: { name: string; email: string; password: string }) => void;
  onSignUp: (userData: { name: string; age: number; email: string; password: string; address: string }) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    address: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (authMode === 'login') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      }
    } else {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
      } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
        newErrors.age = 'Please enter a valid age';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (authMode === 'login') {
      onLogin({
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        password: formData.password
      });
    } else {
      onSignUp({
        name: formData.name,
        age: Number(formData.age),
        email: formData.email,
        password: formData.password,
        address: formData.address
      });
    }
  };

  const switchMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setFormData({
      name: '',
      age: '',
      email: '',
      password: '',
      address: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {authMode === 'login' ? 'Welcome Back' : 'Join StakeX'}
          </h1>
          <p className="auth-subtitle">
            {authMode === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Create your account to get started'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
          )}

          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                Age <span className="required">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`form-input ${errors.age ? 'error' : ''}`}
                placeholder="Enter your age"
                min="1"
                max="120"
              />
              {errors.age && <div className="error-message">{errors.age}</div>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                Address <span className="required">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-input ${errors.address ? 'error' : ''}`}
                placeholder="Enter your address"
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="switch-btn"
              onClick={switchMode}
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


