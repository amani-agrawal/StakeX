const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age cannot exceed 120']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters'],
    match: [/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Please enter a valid phone number (e.g., 123-456-7890 or (123) 456-7890)']
  },
  memberSince: {
    type: String,
    default: new Date().getFullYear().toString()
  },
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/80x80/cccccc/666666?text=U'
  },
  // Embedded subdocuments for better data structure
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  historyOrders: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    priceAtPurchase: { type: Number, required: true, min: 0 },
    purchasedAt: { type: Date, default: Date.now }
  }],
  
  ongoingBids: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    amount: { type: Number, required: true, min: 0 },
    placedAt: { type: Date, default: Date.now }
  }],
  
  itemsToSell: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    askingPrice: { type: Number, min: 0 },
    listedAt: { type: Date, default: Date.now }
  }],


  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
