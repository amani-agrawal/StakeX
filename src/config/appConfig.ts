// Application Configuration
// This file contains all configurable values that were previously hardcoded

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    ENDPOINTS: {
      HEALTH: '/health',
      AUTH: '/api/auth',
      USERS: '/api/users',
      POSTS: '/api/posts',
      BIDS: '/api/bids',
      DAO: '/api/dao'
    }
  },

  // Database Configuration
  DATABASE: {
    NAME: process.env.REACT_APP_DB_NAME || 'stake_db',
    COLLECTIONS: {
      USERS: 'users',
      POSTS: 'posts',
      BIDS: 'bids',
      DAOS: 'daos',
      DAO_SHARES: 'dao_shares',
      DAO_PROPOSALS: 'dao_proposals',
      DAO_VOTES: 'dao_votes',
      TRANSACTIONS: 'transactions',
      NOTIFICATIONS: 'notifications'
    }
  },

  // Default User Configuration
  DEFAULT_USER: {
    ID: '1',
    AGE: 25,
    MEMBER_SINCE: '2024',
    PROFILE_PICTURE: 'https://via.placeholder.com/80x80/cccccc/666666?text=JD'
  },

  // No hardcoded sample products - all data comes from database

  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: 280,
    SEARCH_PLACEHOLDER: 'Search products by name or description...',
    ALERTS: {
      PRODUCT_ADDED: 'Product added to cart!',
      BID_PLACED: 'Bid placed successfully!',
      LOGIN_SUCCESS: 'Login successful!',
      SIGNUP_SUCCESS: 'Account created successfully!'
    }
  },

  // Algorand Configuration
  ALGORAND: {
    NETWORK: process.env.REACT_APP_ALGORAND_NETWORK || 'testnet',
    API_URL: process.env.REACT_APP_ALGORAND_API_URL || 'https://testnet-api.algonode.cloud',
    API_TOKEN: process.env.REACT_APP_ALGORAND_API_TOKEN || '',
    WALLET: {
      CONNECT_MESSAGE: 'Connect your Algorand wallet to continue',
      PAYMENT_SUCCESS: 'Payment successful!',
      PAYMENT_FAILED: 'Payment failed. Please try again.'
    }
  },

  // Pagination Configuration
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  },

  // Search Configuration
  SEARCH: {
    MIN_QUERY_LENGTH: 1,
    MAX_QUERY_LENGTH: 100,
    DEBOUNCE_DELAY: 300
  }
};

// Environment-specific configurations
export const getConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...APP_CONFIG,
    ENV: {
      IS_DEVELOPMENT: isDevelopment,
      IS_PRODUCTION: isProduction,
      NODE_ENV: process.env.NODE_ENV
    }
  };
};

export default APP_CONFIG;
