#!/bin/bash

# StakeX Team Setup Script
# This script helps teammates set up the development environment quickly

echo "🚀 Setting up StakeX development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Go back to root directory
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create .env file for backend if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << 'EOF'
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://veerpsingh07:Veer1234@stakex.49ureww.mongodb.net/stakex_db?retryWrites=true&w=majority&appName=Stakex

# JWT Secret
JWT_SECRET=stakex-super-secret-jwt-key-2024-production-ready

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Backend .env file created"
else
    echo "ℹ️  Backend .env file already exists"
fi

# Create .env.local file for frontend if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cat > .env.local << 'EOF'
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api

# Database Configuration
REACT_APP_DB_NAME=stake_db

# Algorand Configuration
REACT_APP_ALGORAND_NETWORK=testnet
REACT_APP_ALGORAND_API_URL=https://testnet-api.algonode.cloud
REACT_APP_ALGORAND_API_TOKEN=

# Environment
NODE_ENV=development
EOF
    echo "✅ Frontend .env.local file created"
else
    echo "ℹ️  Frontend .env.local file already exists"
fi

echo ""
echo "🎉 Setup complete! Here's how to start the application:"
echo ""
echo "📋 To start the backend:"
echo "   cd backend && npm start"
echo ""
echo "📋 To start the frontend:"
echo "   npm start"
echo ""
echo "🌐 Your application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo "   Health:   http://localhost:5001/health"
echo ""
echo "📚 For more information, see TEAM_SETUP_INSTRUCTIONS.md"
echo ""
echo "Happy coding! 🚀"