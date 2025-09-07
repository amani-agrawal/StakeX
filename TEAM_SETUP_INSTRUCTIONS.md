# 👥 Team Setup Instructions for StakeX

## 🚀 Quick Start for Teammates

### Prerequisites
- Node.js installed (version 16 or higher)
- Git installed
- MongoDB Atlas account (optional - can use shared credentials)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd Stakex
```

### Step 2: Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install --legacy-peer-deps
```

#### Frontend Dependencies
```bash
cd ..  # Go back to root directory
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://veerpsingh07:Veer1234@stakex.49ureww.mongodb.net/stakex_db?retryWrites=true&w=majority&appName=Stakex

# JWT Secret
JWT_SECRET=stakex-super-secret-jwt-key-2024-production-ready

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
cd ..  # Go back to root directory
npm start
```

### Step 5: Verify Everything is Working

1. **Backend Health Check**: http://localhost:5001/health
2. **Frontend**: http://localhost:3000
3. **Test API**: Try registering a user at http://localhost:5001/api/auth/register

## 🔐 Database Access Options

### Option A: Use Shared Credentials (Easiest)
Use the connection string provided above. All team members will share the same database.

### Option B: Individual Atlas Accounts (Recommended for Production)
1. Create your own MongoDB Atlas account
2. Get invited to the project by the project owner
3. Use your own connection string

### Option C: Local MongoDB (Development Only)
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Update .env file
MONGODB_URI=mongodb://localhost:27017/stakex_db
```

## 🛠️ Development Workflow

### Making Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test locally
4. Commit and push: `git push origin feature/your-feature-name`
5. Create a pull request

### API Testing
Use these endpoints to test your changes:

```bash
# Health check
curl http://localhost:5001/health

# Register a user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","age":25,"address":"123 Test St"}'

# Get products
curl http://localhost:5001/api/posts
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### 2. MongoDB Connection Issues
- Check your internet connection
- Verify the connection string in `.env`
- Make sure MongoDB Atlas allows your IP address

#### 3. Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Frontend Build Issues
```bash
# Clear React cache
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📞 Getting Help

If you encounter issues:
1. Check this troubleshooting section
2. Ask in the team chat
3. Create an issue in the repository
4. Contact the project maintainer

## 🎯 Project Structure

```
Stakex/
├── backend/                 # Node.js/Express API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Main server file
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API service
│   ├── config/             # App configuration
│   └── types/              # TypeScript types
└── public/                 # Static files
```

## 🚀 Ready to Code!

Once you've completed these steps, you should have:
- ✅ Backend running on http://localhost:5001
- ✅ Frontend running on http://localhost:3000
- ✅ Database connected to MongoDB Atlas
- ✅ All dependencies installed

Happy coding! 🎉
