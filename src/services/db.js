// AURA - Database Service

const PRODUCTS_KEY = 'aura_products';
const ORDERS_KEY = 'aura_orders';


const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Aether Heritage Chronograph',
    description: 'A stunning mechanical wrist timepiece featuring a precision dual-dial flyback chronograph, wrapped in hand-stitched tan Italian leather. Embellished with high-polish steel dials and an open-heart skeleton case backing.',
    price: 385.00,
    category: 'Timepieces',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600',
    stock: 12,
    rating: 4.9,
    featured: true,
    specifications: {
      'Movement': 'Automatic Mechanical (42h reserve)',
      'Water Resistance': '5 ATM (50 meters)',
      'Strap Material': 'Full-Grain Calfskin Leather',
      'Case Diameter': '42mm'
    },
    reviews: [
      { user: 'Alexander V.', rating: 5, comment: 'The mechanical detail is unmatched. The leather smells genuine and holds exceptionally well. Worth every dollar.' },
      { user: 'Marcus K.', rating: 4, comment: 'Beautiful piece of engineering. Just wish the case was a millimeter thinner.' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Vanguard Vacuum Tube Speaker',
    description: 'Immerse your space in warm, rich analog audio. Engineered with dual glowing glow-tubes, copper coils, and an oiled solid walnut wood housing. Equipped with modern AptX Bluetooth 5.0 alongside analog RCA inputs.',
    price: 450.00,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600',
    stock: 8,
    rating: 4.8,
    featured: true,
    specifications: {
      'Amplifier Type': 'Class A Vacuum Tube Triode',
      'Output Power': '2 x 15W RMS',
      'Housing': 'American Walnut Wood & Cast Brass',
      'Inputs': 'Bluetooth 5.0, RCA Auxiliary'
    },
    reviews: [
      { user: 'Elena R.', rating: 5, comment: 'The sound has a warm quality that digital speakers just cannot replicate. And that tube glow is hypnotic at night!' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Forge Mechanical Brass Keyboard',
    description: 'A tactile typing masterpiece. Assembled with a sandblasted heavy brass chassis, clicky blue mechanical switches, and custom-molded retro round keycaps that replicate the authentic feedback of a vintage typewriter.',
    price: 220.00,
    category: 'Office',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
    stock: 15,
    rating: 4.7,
    featured: false,
    specifications: {
      'Key Switches': 'Tactile Clicky Blue (50g actuation)',
      'Connection': 'Detachable Braided USB-C',
      'Frame': 'CNC Machined Brass & Rosewood Accent',
      'Layout': 'Tenkeyless (87 Keys)'
    },
    reviews: [
      { user: 'Julian P.', rating: 5, comment: 'The heavy brass base prevents it from slipping. The click sound is crisp and feels incredibly satisfying.' }
    ]
  },
  {
    id: 'prod-4',
    name: 'Monarch Solid Brass Pen',
    description: 'Precisely balanced and weighted, this fountain pen is precision-crafted from raw, solid brass. Designed to age gracefully, developing a unique, deep bronze patina over years of writing. Fitted with an iridium medium-nib.',
    price: 115.00,
    category: 'Office',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600',
    stock: 25,
    rating: 4.9,
    featured: true,
    specifications: {
      'Material': 'Raw Solid Brass C360',
      'Nib Size': 'Medium (Schmidt Iridium System)',
      'Ink Supply': 'Converter & Standard International Cartridges',
      'Weight': '48 grams'
    },
    reviews: [
      { user: 'Clara S.', rating: 5, comment: 'The ink flows flawlessly. The patina is already forming and looks absolutely spectacular.' }
    ]
  },
  {
    id: 'prod-5',
    name: 'Sovereign Leather-Bound Journal',
    description: 'Capture your thoughts on thick, 120GSM acid-free cotton paper, hand-stitched into a rustic full-grain leather cover. Closes with a heavy brass key clasp to secure your ideas, sketches, and notes.',
    price: 65.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    stock: 40,
    rating: 4.6,
    featured: false,
    specifications: {
      'Paper Type': '120GSM Deckled Edge Cotton Paper',
      'Page Count': '240 Blank Pages (Front & Back)',
      'Cover': 'Distilled Crazy Horse Leather',
      'Closure': 'Antique Brass Toggle Lock'
    },
    reviews: []
  },
  {
    id: 'prod-6',
    name: 'Century Reflex Twin-Lens Camera',
    description: 'A fully functional mechanical medium-format film camera mimicking the classic twin-lens design of the 1950s. Designed for vintage film hobbyists, complete with a leather carrying neck strap and waist-level finder.',
    price: 520.00,
    category: 'Timepieces', // Fits collectible tech well
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    stock: 5,
    rating: 4.8,
    featured: false,
    specifications: {
      'Film Format': '120 Roll Film (6x6 format)',
      'Lenses': '80mm f/3.5 Dual Optics',
      'Shutter': 'Mechanical Leaf Shutter (1/500s - 1s, Bulb)',
      'Weight': '980 grams'
    },
    reviews: [
      { user: 'David G.', rating: 5, comment: 'It is a mechanical sculpture. The photos produced are gorgeous, full of analog soul.' }
    ]
  }
];

const INITIAL_ORDERS = [];
const SETTINGS_KEY = 'aura_admin_settings';
const ADMIN_USERS_KEY = 'aura_admin_users';

const DEFAULT_ADMIN_SETTINGS = {
  hasConfigured: false,
  username: '',
  password: '',
  mobileNumber: '',
  supportEmail: 'support@aura.com',
  upiId: '',
  bankDetails: '',
  paymentLink: '',
  deliveryFee: 50,
  googleAccount: null
};

// Helper to initialize local storage
function initializeStorage() {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
  const existingOrders = localStorage.getItem(ORDERS_KEY);
  if (!existingOrders || JSON.parse(existingOrders).length > 0 && JSON.parse(existingOrders)[0].id === 'ORD-84902') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_ADMIN_SETTINGS));
  }
  if (!localStorage.getItem(ADMIN_USERS_KEY)) {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify([]));
  }
}

// Run immediately
initializeStorage();

export const db = {
  // SETTINGS & USER REGISTRY ACTIONS
  getAdminSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || DEFAULT_ADMIN_SETTINGS;
  },

  saveAdminSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // Also save/update in our users registry
    if (settings.hasConfigured) {
      const users = this.getAdminUsers();
      const existingIdx = users.findIndex(u => u.username.toLowerCase() === settings.username.toLowerCase());
      const userProfile = {
        username: settings.username,
        password: settings.password,
        mobileNumber: settings.mobileNumber,
        supportEmail: settings.supportEmail
      };
      
      if (existingIdx !== -1) {
        users[existingIdx] = { ...users[existingIdx], ...userProfile };
      } else {
        users.push(userProfile);
      }
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
    }

    return settings;
  },

  getAdminUsers() {
    return JSON.parse(localStorage.getItem(ADMIN_USERS_KEY)) || [];
  },

  checkUsernameTaken(username) {
    const users = this.getAdminUsers();
    return users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
  },

  verifyAdminCredentials(username, password) {
    const users = this.getAdminUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (user && user.password === password) {
      // Set as currently active active settings session
      const currentSettings = this.getAdminSettings();
      this.saveAdminSettings({
        ...currentSettings,
        hasConfigured: true,
        username: user.username,
        password: user.password,
        mobileNumber: user.mobileNumber,
        supportEmail: user.supportEmail || currentSettings.supportEmail
      });
      return true;
    }
    return false;
  },


  getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },

  addProduct(product) {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: 'prod-' + Date.now(),
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0,
      rating: 5.0,
      reviews: [],
      featured: product.featured || false,
      specifications: product.specifications || {}
    };
    products.push(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  },

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedFields,
        price: parseFloat(updatedFields.price) || products[index].price,
        stock: parseInt(updatedFields.stock) || products[index].stock
      };
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
    return true;
  },

  // ORDERS ACTIONS
  getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  },

  addOrder(orderData) {
    const orders = this.getOrders();
    const products = this.getProducts();

    const newOrder = {
      ...orderData,
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      status: 'Pending'
    };

    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // Deduct stock
    orderData.items.forEach(orderItem => {
      const pIndex = products.findIndex(p => p.id === orderItem.id);
      if (pIndex !== -1) {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - orderItem.quantity);
      }
    });
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    return newOrder;
  },

  updateOrderStatus(id, newStatus) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = newStatus;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  },

  // STATS GENERATOR FOR ADMIN PANEL
  getStats() {
    const orders = this.getOrders();
    const products = this.getProducts();
    
    const revenue = orders.reduce((sum, order) => sum + (order.total - order.shippingCost), 0);
    const totalOrders = orders.length;
    const itemsSold = orders.reduce((sum, order) => {
      return sum + order.items.reduce((iSum, item) => iSum + item.quantity, 0);
    }, 0);
    
    // Average Order Value (AOV)
    const aov = totalOrders > 0 ? (revenue / totalOrders) : 0;
    
    // Conversion rate simulation
    const simulatedTraffic = 1840; // Simulated active store visits
    const conversionRate = simulatedTraffic > 0 ? ((totalOrders / simulatedTraffic) * 100).toFixed(2) : 0;
    
    // Calculate category breakdown
    const categoryBreakdown = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        const category = prod ? prod.category : 'General';
        const saleValue = item.price * item.quantity;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + saleValue;
      });
    });

    // Recent orders (last 5)
    const recentOrders = [...orders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // Group sales by day (for charts)
    const salesByDay = {};
    orders.forEach(order => {
      const dateLabel = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesByDay[dateLabel] = (salesByDay[dateLabel] || 0) + (order.total - order.shippingCost);
    });
    
    const salesHistory = Object.keys(salesByDay).map(day => ({
      date: day,
      amount: salesByDay[day]
    })).slice(-7); // Last 7 unique days

    return {
      revenue: parseFloat(revenue.toFixed(2)),
      totalOrders,
      itemsSold,
      aov: parseFloat(aov.toFixed(2)),
      conversionRate,
      traffic: simulatedTraffic,
      categoryBreakdown,
      recentOrders,
      salesHistory
    };
  }
};
