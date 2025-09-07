import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import AccountPage from './components/AccountPage';
import CartPage from './components/CartPage';
import LogoAnimation from './components/LogoAnimation';
import AuthPage from './components/AuthPage';
import OrdersPage from './components/Orders';
import CreateProductPage from './components/AddProductModal';
import TopBar from './components/TopBar';
import FixedSidebar from './components/OverlayDrawer';
import { AppState, Page, User, Product } from './types';
import { connectLute, payAlgo } from "./wallet/lute";
import { apiService } from './services/apiService';
import { APP_CONFIG } from './config/appConfig';
import { getId } from './utils/id';

const initialUser: User = {
  id: '1',
  name: 'John Doe',
  age: 25,
  address: '123 Main St, City, State',
  memberSince: '2022',
  profilePicture: 'https://via.placeholder.com/80x80/cccccc/666666?text=JD'
};

const initialProducts: Product[] = [
];

function App() {
  const [showLogo, setShowLogo] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'landing',
    user: null,
    products: initialProducts,
    cart: [],
    myProducts: [],
    marketProducts: initialProducts,
    orderHistory: [],
    orderProducts: []
  });
  const [address, setAddress] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  // const [txId, setTxId] = useState(""); // Will be used for transaction tracking
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to map API products to frontend format
  const mapApiProduct = (p: any, currentUserId?: string): Product => ({
    id: p._id || p.id || '',
    name: p.name,
    description: p.description,
    image: p.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image', // backend now provides absolute URLs
    price: typeof p.price === 'number' ? p.price : Number(p.value ?? 0),
    demandValue: typeof p.demandValue === 'number' ? p.demandValue : p.price, // include demandValue from backend
    owner: p.owner || p.owner_id || '',
    isOwned: currentUserId ? (p.owner === currentUserId || p.owner_id === currentUserId) : false,
    isBid: Array.isArray(p.bids) ? p.bids.length > 0 : !!p.isBid,
    personalItem: p.personalItem,
  });

  // Only jump to `landing` when the user performs an explicit search (submit/click)
  const handleSearchResults = (
    results: Product[],
    q: string,
    opts?: { explicit?: boolean }
  ) => {
    const query = (q ?? '').trim();

    setSearchQuery(query);
    setSearchResults(query ? results : null);

    if (
      opts?.explicit &&          // only when user explicitly searches
      query.length > 0 &&        // ignore empty string
      isAuthenticated &&
      appState.currentPage !== 'landing'
    ) {
      setAppState(prev => ({ ...prev, currentPage: 'landing' }));
    }
  };

  const productsForLanding = isAuthenticated
    ? (searchResults ?? appState.products)
    : initialProducts;

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUserId = localStorage.getItem('userId');
      
      if (!savedToken || !savedUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await apiService.getUser(savedUserId, savedToken);
        if (me.success && me.data) {
          const u = me.data as any;
          const mappedUser: User = {
            id: u._id || '',
            name: u.name,
            age: u.age,
            address: u.address,
            memberSince: u.memberSince,
            profilePicture: u.profilePicture
          };
          // Load products from database
          const productsRes = await apiService.getProducts();
          const allProducts = productsRes.success && productsRes.data 
            ? productsRes.data.map(p => mapApiProduct(p, mappedUser.id))
            : [];
          
          // Set user state first, then authentication
          setAppState(prev => ({
            ...prev,
            user: mappedUser,
            products: allProducts,
            myProducts: allProducts.filter(p => p.owner === mappedUser.id),
            marketProducts: allProducts.filter(p => p.owner !== mappedUser.id),
          }));
          
          setToken(savedToken);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const onConnect = async () => {
    const addrs = await connectLute();
    setAddress(addrs[0]);  // choose the first, or show a picker
  };

  // pass: onPay(0.1) or onPay(2.5, "SOME_ALGO_ADDRESS")
  // const onPay = async (amountAlgos: number, to = "RECIPIENT_ALGORAND_ADDRESS") => {
  //   if (!Number.isFinite(amountAlgos) || amountAlgos <= 0) {
  //     alert("Enter a valid amount in ALGO.");
  //     return;
  //   }

  //   // Ensure we have a connected address
  //   let fromAddr = address;
  //   if (!fromAddr) {
  //     const addrs = await onConnect();              // should return string[] or string
  //     fromAddr = Array.isArray(addrs) ? addrs[0] : addrs;
  //     if (!fromAddr) {
  //       alert("Connect wallet first.");
  //       return;
  //     }
  //     setAddress?.(fromAddr);                       // if you have setAddress in scope
  //   }

  //   const microAlgos = Math.round(amountAlgos * 1_000_000);

  //   const tx = await payAlgo({
  //     from: fromAddr,
  //     to,
  //     microAlgos,
  //   });

  //   setTxId(tx);
  // };

  const navigateTo = (page: Page) => {
    setSearchResults(null); // optional: clear any active search view on nav
    setAppState(prev =>
      prev.currentPage === page ? prev : { ...prev, currentPage: page }
    );
  };

  const onLogout = () => {
    // Clear token and userId from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    
    // Reset authentication state
    setIsAuthenticated(false);
    setIsLoading(false);
    setAppState(prev => ({
      ...prev,
      user: null,
      myProducts: [],
      marketProducts: prev.products
    }));
    
    alert('Logged out successfully!');
  };

  const addProduct = async (input: { name: string; description: string; price: number; file: File; isMarketItem?: boolean; initialBid?: number }) => {
    if (!appState.user || !token) { alert('Please log in to add products'); return; }

    const { name, description, price, file, isMarketItem = false, initialBid = 0 } = input;
    if (!name.trim() || !description.trim() || !file) { alert('Fill name, description and choose an image'); return; }
    if (!Number.isFinite(price) || price <= 0) { alert('Enter a valid price'); return; }

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());
    fd.append('price', String(price));   // backend fills both price and value
    fd.append('owner', appState.user.id);
    fd.append('onMarket', 'true');
    fd.append('isMarketItem', String(isMarketItem));
    fd.append('initialBid', String(initialBid));
    fd.append('image', file);            // <-- the actual file

    const created = await apiService.createProductWithFile(fd, token);
    if (!created?.success) {
      console.error('❌ Create failed:', created);
      alert(created?.message || 'Failed to publish product.');
      return;
    }

    const p: any = created.data;
    console.log('🔍 Created product data:', { 
      _id: p._id, 
      imageUrl: p.imageUrl, 
      image: p.image,
      name: p.name 
    });
    
    const newProduct: Product = {
      id: p._id || p.id || '',
      name: p.name,
      description: p.description,
      image: p.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image', // backend now provides absolute URLs
      price: typeof p.price === 'number' ? p.price : Number(p.value ?? 0),
      demandValue: typeof p.demandValue === 'number' ? p.demandValue : p.price, // include demandValue from backend
      owner: p.owner,
      isOwned: true,
      isBid: Array.isArray(p.bids) ? p.bids.length > 0 : false,
      personalItem: p.personalItem,
    };
    
    console.log('🔍 New product mapped:', { 
      id: newProduct.id, 
      image: newProduct.image, 
      name: newProduct.name 
    });

    setAppState(prev => ({
      ...prev,
      products: [newProduct, ...prev.products],
      myProducts: [newProduct, ...prev.myProducts],
    }));

    alert('Product published successfully!');
  };

  const addToCart = async (product: Product) => {
    if (!appState.user || !token) {
      alert('Please log in to add items to cart');
      return;
    }
    
    // Defensive check for valid product ID
    const productId = String(getId(product));
    if (!productId) {
      alert('Product has no valid id. Please refresh.');
      return;
    }
    
    // Debug logging
    console.log('Adding to cart:', { productId, productName: product.name });
    
    // Regular cart addition (no bid) - sync with backend
    try {
      await apiService.addToCart(productId,appState.user.id || '', token);
      await loadCartFromBackend();
      alert('Item added to cart successfully!');
    } catch (error: any) {
      // Show backend message if present
      const msg = error?.message || 'Failed to add item to cart';
      alert(msg);
      console.error('addToCart failed:', error);
    }
  };

  const loadCartFromBackend = async () => {
    if (!appState.user || !token) return;
    
    try {
      const cartResponse = await apiService.getCart(token);
      if (cartResponse.success && cartResponse.data) {
        const { cart } = cartResponse.data;
        const cartItems = cart.map((cartItem: any) => ({
          product: mapApiProduct(cartItem.productId, appState.user!.id),
          addedAt: new Date(cartItem.addedAt)
        }));
        
        setAppState(prev => ({
          ...prev,
          cart: cartItems
        }));
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
    }
  };

  const loadOrders = async () => {
    if (!token) return;
    
    try {
      const ordersResponse = await apiService.getOrders(token);
      if (ordersResponse.success && ordersResponse.data) {
        const { historyOrders } = ordersResponse.data;
        
        // Map the order history and extract product data
        const orderHistory = historyOrders.map((order: any) => ({
          productId: order.productId._id || order.productId,
          priceAtPurchase: order.priceAtPurchase,
          purchasedAt: order.purchasedAt
        }));
        
        const orderProducts = historyOrders.map((order: any) => 
          mapApiProduct(order.productId, appState.user?.id || '')
        );
        
        setAppState(prev => ({
          ...prev,
          orderHistory,
          orderProducts
        }));
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const removeFromCart = async (index: number) => {
    if (!appState.user || !token) return;
    
    const cartItem = appState.cart[index];
    if (!cartItem) return;
    
    try {
      const removeResponse = await apiService.removeFromCart(cartItem.product.id, token);
      if (removeResponse.success) {
        // Refresh cart from backend
        await loadCartFromBackend();
        alert('Item removed from cart successfully!');
      } else {
        alert(removeResponse.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Cart removal error:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const updateProfilePicture = (imageUrl: string) => {
    if (!appState.user) return;
    
    setAppState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, profilePicture: imageUrl } : null
    }));
  };

  const handleLogin = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await apiService.login(userData.email, userData.password);
      console.log('🔐 LOGIN RAW RESPONSE:', response);
      
      if (response.success && response.data) {
        const { user: dbUser, token: authToken } = response.data;
        
        // Validate _id exists
        if (!dbUser._id) { 
          alert('Login failed: missing user id'); 
          return; 
        }
        
        // Strict mapping: no '1' fallback
        const mappedUser: User = {
          id: dbUser._id,
          name: dbUser.name,
          age: dbUser.age,
          address: dbUser.address,
          memberSince: dbUser.memberSince,
          profilePicture: dbUser.profilePicture
        };
        
        // Store token and userId in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('userId', mappedUser.id);
        
        // Load products from database
        const productsRes = await apiService.getProducts();
        const allProducts = productsRes.success && productsRes.data 
          ? productsRes.data.map(p => mapApiProduct(p, mappedUser.id))
          : [];
        
        // Set user state first, then authentication
        setAppState(prev => ({
          ...prev,
          user: mappedUser,
          products: allProducts,
          myProducts: allProducts.filter(p => p.owner === mappedUser.id),
          marketProducts: allProducts.filter(p => p.owner !== mappedUser.id)
        }));
        
        setToken(authToken);
        setIsAuthenticated(true);
        
        // Load cart and orders from backend after authentication
        await loadCartFromBackend();
        await loadOrders();
        
        alert('Login successful!');
      } else {
        alert(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSignUp = async (userData: { name: string; age: number; email: string; password: string; address: string }) => {
    try {
      const response = await apiService.signup({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        age: userData.age,
        address: userData.address
      });
      console.log('📝 SIGNUP RAW RESPONSE:', response);
      
      if (response.success && response.data) {
        const { user: dbUser, token: authToken } = response.data;
        
        // Validate _id exists
        if (!dbUser._id) { 
          alert('Login failed: missing user id'); 
          return; 
        }
        
        // Strict mapping: no '1' fallback
        const mappedUser: User = {
          id: dbUser._id,
          name: dbUser.name,
          age: dbUser.age,
          address: dbUser.address,
          memberSince: dbUser.memberSince,
          profilePicture: dbUser.profilePicture
        };
        
        // Store token and userId in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('userId', mappedUser.id);
        // Load products from database
        const productsRes = await apiService.getProducts();
        const allProducts = productsRes.success && productsRes.data 
          ? productsRes.data.map(p => mapApiProduct(p, mappedUser.id))
          : [];
        
        // Set user state first, then authentication
        setAppState(prev => ({
          ...prev,
          user: mappedUser,
          products: allProducts,
          myProducts: allProducts.filter(p => p.owner === mappedUser.id),
          marketProducts: allProducts.filter(p => p.owner !== mappedUser.id)
        }));
        
        setToken(authToken);
        setIsAuthenticated(true);
        alert(`Welcome to StakeX, ${userData.name}!`);
      } else {
        console.error('Signup error payload:', response);
        alert(response.error || response.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'landing':
        return (
          <div className="withTopbar">
            <LandingPage
              products={productsForLanding}
              onNavigate={navigateTo}
              onAddToCart={addToCart}
              onAddProduct={addProduct}
            />
          </div>
        );
      case 'account':
        if (!appState.user) return <div className="withTopbar">Please log in to view your account</div>;
        return (
          <div className="withTopbar">
            <AccountPage
              user={appState.user}
              currentProducts={appState.myProducts}
              onNavigate={navigateTo}
              onAddToCart={addToCart}
              onUpdateProfilePicture={updateProfilePicture}
            />
          </div>
        );
      case 'cart':
        return (
          <div className="withTopbar">
            <CartPage
              cart={appState.cart}
              onNavigate={navigateTo}
              onRemoveFromCart={removeFromCart}
              onAddToCart={addToCart}
            />
          </div>
        );
      case 'post':
        return (
          <div className="withTopbar">
            <CreateProductPage
              onNavigate={navigateTo}
              onCreate={addProduct}
            />
          </div>
        );
      case 'order':
        return (
          <div className="withTopbar">
            <OrdersPage
              orders={appState.orderHistory}
              products={appState.orderProducts}
              onNavigate={navigateTo}
            />
          </div>
        );
      default:
        return (
          <div className="withTopbar">
            <LandingPage
              products={productsForLanding}
              onNavigate={navigateTo}
              onAddToCart={addToCart}
              onAddProduct={addProduct}
            />
          </div>
        );
    }
  };

  if (showLogo) {
    return <LogoAnimation onComplete={() => setShowLogo(false)} />;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
  }

  // HIDE menu/search on auth pages
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  // Ensure user is loaded before showing authenticated layout
  if (!appState.user) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading user data...</div>;
  }

  return (
    <div className="App">
      {/* Fixed sidebar */}
      <FixedSidebar
        user={appState.user}
        currentPage={appState.currentPage}
        onNavigate={navigateTo}
        onLogout={onLogout}
      />

      {/* Floating search bar */}
      <TopBar
        products={appState.products}
        initialQuery={searchQuery}
        onResults={handleSearchResults}
      />

      {/* Page content (spaced using .withTopbar) */}
      {renderCurrentPage()}
    </div>
  );
}

export default App;
