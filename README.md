# Stakex - Product Marketplace

A modern TypeScript/React web application for a product marketplace with bidding functionality.

## Features

### 🏠 Landing Page
- Display list of available products
- Cart and Bid buttons in top-right corner
- Add new product button (+) in bottom center
- Home and Account navigation buttons
- Product cards with images, descriptions, and prices

### 👤 Account Page
- Profile picture and user details (Name, Age, Address, Member Since)
- Instagram-style aesthetic layout
- Toggle between "My Products" and "Market Products"
- My Products: Products you own and are selling
- Market Products: Products you're selling from external market links

### 🛒 Cart Page
- Products you have bid for (with bid amounts)
- Products you already own
- Clean, organized display of cart items

### ➕ Add Product Modal
- Product image (required)
- Product description (required)
- Product link (optional - for market products)
- Price (optional)
- Form validation for required fields

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd Desktop/Code/Stakex
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── LandingPage.tsx      # Main landing page
│   ├── AccountPage.tsx      # User profile and products page
│   ├── CartPage.tsx         # Cart and owned products page
│   └── AddProductModal.tsx  # Modal for adding new products
├── types/
│   └── index.ts             # TypeScript type definitions
├── App.tsx                  # Main application component
├── App.css                  # Global styles
├── index.tsx               # Application entry point
└── index.css               # Base styles
```

## Usage

1. **Browse Products**: View available products on the landing page
2. **Add to Cart**: Click "Add to Cart" to add products to your cart
3. **Place Bids**: Click "Bid" to place a bid on a product
4. **Add Products**: Click the "+" button to add your own products
5. **View Account**: Click "Account" to see your profile and manage your products
6. **View Cart**: Click "Cart" to see your bids and owned products

## Data Models

### Product
- `id`: Unique identifier
- `name`: Product name
- `description`: Product description
- `image`: Product image URL
- `link`: Optional external market link
- `price`: Optional price
- `owner`: Owner user ID
- `isOwned`: Whether user owns this product
- `isBid`: Whether user has bid on this product

### User
- `id`: Unique identifier
- `name`: User's name
- `age`: User's age
- `address`: User's address
- `memberSince`: Membership start year
- `profilePicture`: Profile picture URL

### CartItem
- `product`: Product object
- `bidAmount`: Optional bid amount
- `addedAt`: When item was added to cart

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- Algorand payment integration
- User authentication
- Real-time bidding
- Image upload functionality
- Advanced search and filtering
- Mobile app version

## Built With

- React 18
- TypeScript
- CSS3
- Modern web standards

## License

This project is created for hackathon purposes.
