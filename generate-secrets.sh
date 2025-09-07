#!/bin/bash

# Generate secure secrets for StakeX
echo "🔐 Generating secure secrets for StakeX..."

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT Secret: $JWT_SECRET"

# Create .env file for backend
cat > backend/.env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stakex_db

# JWT Secret (Generated securely)
JWT_SECRET=$JWT_SECRET

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Create .env file for frontend
cat > .env << EOF
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=StakeX
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Features Flags
REACT_APP_ENABLE_ALGORAND=false
REACT_APP_ENABLE_DAO=true
EOF

echo "✅ Environment files created successfully!"
echo "📁 Backend .env: backend/.env"
echo "📁 Frontend .env: .env"
echo ""
echo "🚀 You can now run:"
echo "   Backend:  cd backend && npm run dev-mongodb"
echo "   Frontend: npm start"
