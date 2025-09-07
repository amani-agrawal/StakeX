# 👥 Team Setup Guide for StakeX

## 🚨 **Current Database Access Issue**

**Problem**: The current setup uses a local MongoDB database that only you can access. Your team members cannot connect to your local database.

## 🔧 **Solutions for Team Database Access**

### **Option 1: MongoDB Atlas (Recommended - Free)**
**Best for**: Development and small teams

1. **Create MongoDB Atlas Account**:
   - Go to https://www.mongodb.com/atlas
   - Sign up for free account
   - Create a new cluster (free tier available)

2. **Get Connection String**:
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/stakex_db`)

3. **Update Environment Variables**:
   ```bash
   # In backend/.env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stakex_db
   ```

4. **Share with Team**:
   - Share the connection string with your team
   - Each team member updates their `backend/.env` file

### **Option 2: Shared Development Server**
**Best for**: Larger teams with dedicated infrastructure

1. **Set up a shared MongoDB server** (AWS, DigitalOcean, etc.)
2. **Configure network access** for your team
3. **Share connection details** securely

### **Option 3: Docker with Shared Volume**
**Best for**: Teams working on same network

1. **Use Docker Compose** (already included in the project)
2. **Share the docker-compose.yml** file
3. **Team runs**: `docker-compose up`

## 🚀 **Quick Team Setup Instructions**

### **For Each Team Member:**

1. **Clone the Repository**:
   ```bash
   git clone <your-repo-url>
   cd Stakex
   ```

2. **Install Dependencies**:
   ```bash
   # Backend
   cd backend
   npm install --legacy-peer-deps
   
   # Frontend
   cd ..
   npm install
   ```

3. **Set up Environment Variables**:
   ```bash
   # Generate environment files
   ./generate-secrets.sh
   
   # OR manually create backend/.env:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stakex_db
   JWT_SECRET=your-secret-key
   PORT=5001
   NODE_ENV=development
   ```

4. **Start the Application**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev-mongodb
   
   # Terminal 2 - Frontend
   cd ..
   npm start
   ```

## 🔐 **Security Considerations**

### **For Production**:
- ✅ Use MongoDB Atlas with proper authentication
- ✅ Set up IP whitelisting
- ✅ Use strong JWT secrets
- ✅ Enable SSL/TLS connections
- ✅ Regular database backups

### **For Development**:
- ✅ Use separate development database
- ✅ Don't commit `.env` files to git
- ✅ Use different JWT secrets per environment
- ✅ Regular data cleanup

## 📊 **Database Schema Sharing**

The database schema is already defined in:
- `backend/mongodb-schema.js` - Contains all table definitions
- `src/types/index.ts` - Frontend type definitions

**All team members will have access to the same database structure** once connected.

## 🎯 **Recommended Next Steps**

1. **Set up MongoDB Atlas** (free tier)
2. **Update your local environment** to use Atlas
3. **Share connection details** with team
4. **Test with team members**
5. **Set up production database** when ready to deploy

## 📞 **Support**

If team members encounter issues:
1. Check MongoDB connection string
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check network connectivity to Atlas

---

**🎉 Once set up, all team members will have access to the same database and can collaborate on the same data!**
