#!/bin/bash

echo "🚀 Setting up StakeX with MongoDB Atlas for team development..."

# Check if MongoDB Atlas connection string is provided
if [ -z "$1" ]; then
    echo "❌ Please provide MongoDB Atlas connection string"
    echo "Usage: ./setup-atlas-team.sh 'mongodb+srv://username:password@cluster.mongodb.net/stakex_db'"
    echo ""
    echo "To get MongoDB Atlas connection string:"
    echo "1. Go to https://www.mongodb.com/atlas"
    echo "2. Click 'Connect' on your cluster"
    echo "3. Choose 'Connect your application'"
    echo "4. Copy the connection string"
    exit 1
fi

MONGODB_URI=$1

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ..
npm install

echo "🔐 Setting up environment variables..."

# Create backend .env
cat > backend/.env << EOF
# MongoDB Atlas Configuration
MONGODB_URI=$MONGODB_URI

# JWT Secret (Generated securely)
JWT_SECRET=$(openssl rand -base64 32)

# Server Configuration
PORT=5001
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

# Create frontend .env
cat > .env << EOF
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_NAME=StakeX
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Features Flags
REACT_APP_ENABLE_ALGORAND=false
REACT_APP_ENABLE_DAO=true
EOF

echo "✅ Environment setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Terminal 1: cd backend && npm run dev-mongodb"
echo "   Terminal 2: npm start"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "🔗 API health check: http://localhost:5001/health"
echo ""
echo "📊 Database: Connected to MongoDB Atlas"
echo "🔐 Security: JWT secret generated securely"
echo ""
echo "🎉 Setup complete! Happy coding!"
