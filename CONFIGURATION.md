# StakeX Configuration Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Database Configuration
REACT_APP_DB_NAME=stake_db

# Algorand Configuration
REACT_APP_ALGORAND_NETWORK=testnet
REACT_APP_ALGORAND_API_URL=https://testnet-api.algonode.cloud
REACT_APP_ALGORAND_API_TOKEN=

# Environment
NODE_ENV=development
```

## Configuration Files

### 1. `src/config/appConfig.ts`
Contains all application configuration including:
- API endpoints
- Database settings
- Default user settings
- Sample products
- UI configuration
- Algorand settings

### 2. Backend Configuration
The backend uses environment variables from `backend/.env`:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`

## Hardcoded Values Removed

The following hardcoded values have been moved to configuration:

### Frontend
- ✅ Sample products → `APP_CONFIG.SAMPLE_PRODUCTS`
- ✅ Default user settings → `APP_CONFIG.DEFAULT_USER`
- ✅ Alert messages → `APP_CONFIG.UI.ALERTS`
- ✅ Search placeholder → `APP_CONFIG.UI.SEARCH_PLACEHOLDER`
- ✅ API URLs → `APP_CONFIG.API.BASE_URL`

### Backend
- ✅ Database name → Environment variable
- ✅ JWT secret → Environment variable
- ✅ Port → Environment variable

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Update API URLs to production endpoints
3. Use production database credentials
4. Set secure JWT secrets
5. Configure Algorand mainnet settings

## Customization

All configurable values are now in `src/config/appConfig.ts`. You can:
- Change sample products
- Modify UI text and messages
- Update API endpoints
- Configure Algorand settings
- Adjust pagination and search settings

