import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import AccountPage from './components/AccountPage';
import CartPage from './components/CartPage';
import LogoAnimation from './components/LogoAnimation';
import AuthPage from './components/AuthPage';
import OrdersPage from './components/Orders';
import CreateProductPage from './components/AddProductModal';
import { AppState, Page, User, Product } from './types';
import { connectLute, payAlgo } from "./wallet/lute";

const initialUser: User = {
  id: '1',
  name: 'John Doe',
  age: 25,
  address: '123 Main St, City, State',
  memberSince: '2022',
  profilePicture: 'https://via.placeholder.com/80x80/cccccc/666666?text=JD'
};

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Vintage Camera',
    description: 'Beautiful vintage camera in excellent condition',
    image: 'https://via.placeholder.com/200x200/cccccc/666666?text=Camera',
    price: 299.99,
    owner: '1',
    isOwned: false,
    isBid: false
  },
  {
    id: '2',
    name: 'Designer Watch',
    description: 'Luxury designer watch with leather strap',
    image: 'https://via.placeholder.com/200x200/cccccc/666666?text=Watch',
    price: 599.99,
    owner: '2',
    isOwned: false,
    isBid: false
  },
  {
    id: '3',
    name: 'Art Painting',
    description: 'Original oil painting by local artist',
    image: 'https://via.placeholder.com/200x200/cccccc/666666?text=Art',
    price: 199.99,
    owner: '1',
    isOwned: true,
    isBid: false
  }
];

function App() {
  const [showLogo, setShowLogo] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'landing',
    user: initialUser,
    products: initialProducts,
    cart: [],
    myProducts: initialProducts.filter(p => p.owner === initialUser.id),
    marketProducts: initialProducts.filter(p => p.owner !== initialUser.id)
  });
  const [address, setAddress] = useState("");
  const [txId, setTxId] = useState("");

  const onConnect = async () => {
    const addrs = await connectLute();
    setAddress(addrs[0]);  // choose the first, or show a picker
  };

  const onPay = async () => {
    if (!address) return alert("Connect wallet first");
    const tx = await payAlgo({
      from: address,
      to: "RECIPIENT_ALGORAND_ADDRESS", // replace
      microAlgos: 100000,               // 0.1 ALGO
    });
    setTxId(tx);
  };


  const navigateTo = (page: Page) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
  };

  const addProduct = (product: Omit<Product, 'id' | 'owner' | 'isOwned' | 'isBid'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      owner: appState.user.id,
      isOwned: true,
      isBid: false
    };
    
    setAppState(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      myProducts: [...prev.myProducts, newProduct]
    }));
  };

  const addToCart = (product: Product, bidAmount?: number) => {
    const cartItem = {
      product,
      bidAmount,
      addedAt: new Date()
    };
    
    setAppState(prev => ({
      ...prev,
      cart: [...prev.cart, cartItem]
    }));
  };

  const updateProfilePicture = (imageUrl: string) => {
    setAppState(prev => ({
      ...prev,
      user: { ...prev.user, profilePicture: imageUrl }
    }));
  };

  const handleLogin = (userData: { name: string; email: string; password: string }) => {
    // In a real app, you would validate credentials with a server
    const user: User = {
      id: '1',
      name: userData.name,
      age: 25, // Default age for login
      address: '123 Main St, City, State', // Default address for login
      memberSince: new Date().getFullYear().toString(),
      profilePicture: 'https://via.placeholder.com/100x100/007AFF/FFFFFF?text=' + userData.name.charAt(0).toUpperCase()
    };
    
    setAppState(prev => ({
      ...prev,
      user: user,
      myProducts: prev.products.filter(p => p.owner === user.id),
      marketProducts: prev.products.filter(p => p.owner !== user.id)
    }));
    
    setIsAuthenticated(true);
  };

  const handleSignUp = (userData: { name: string; age: number; email: string; password: string; address: string }) => {
    // In a real app, you would create the user account on a server
    const user: User = {
      id: Date.now().toString(),
      name: userData.name,
      age: userData.age,
      address: userData.address,
      memberSince: new Date().getFullYear().toString(),
      profilePicture: 'https://via.placeholder.com/100x100/007AFF/FFFFFF?text=' + userData.name.charAt(0).toUpperCase()
    };
    
    setAppState(prev => ({
      ...prev,
      user: user,
      myProducts: prev.products.filter(p => p.owner === user.id),
      marketProducts: prev.products.filter(p => p.owner !== user.id)
    }));
    
    setIsAuthenticated(true);
    alert(`Welcome to StakeX, ${userData.name}!`);
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'landing':
        return <LandingPage 
          products={appState.products} 
          onNavigate={navigateTo}
          onAddToCart={addToCart}
          onAddProduct={addProduct}
        />;
      case 'account':
        return <AccountPage 
          user={appState.user}
          myProducts={appState.myProducts}
          marketProducts={appState.marketProducts}
          onNavigate={navigateTo}
          onAddToCart={addToCart}
          onUpdateProfilePicture={updateProfilePicture}
        />;
      case 'cart':
        return <CartPage 
          cart={appState.cart}
          onNavigate={navigateTo}
        />;
      case 'post':
        return <CreateProductPage
           onNavigate={navigateTo}
          onCreate={addProduct}
        ></CreateProductPage>
      case 'order':
        return <OrdersPage 
          cart={appState.cart}
          ownedProducts={appState.myProducts}
          onNavigate={navigateTo}
        />;
      default:
        return <LandingPage 
          products={appState.products} 
          onNavigate={navigateTo}
          onAddToCart={addToCart}
          onAddProduct={addProduct}
        />;
    }
  };

  if (showLogo) {
    return <LogoAnimation onComplete={() => setShowLogo(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
