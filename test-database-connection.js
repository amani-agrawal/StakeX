// Test script to verify MongoDB Atlas connection
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB Atlas connection...');
    console.log('📍 Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test creating a test document
    const testCollection = db.collection('test');
    await testCollection.insertOne({ 
      message: 'Test connection successful', 
      timestamp: new Date() 
    });
    console.log('✅ Test document created successfully!');
    
    // Clean up test document
    await testCollection.deleteOne({ message: 'Test connection successful' });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
