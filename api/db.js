import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'db.json');

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
    category: 'Timepieces',
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

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      const defaultDb = {
        products: INITIAL_PRODUCTS,
        orders: [],
        adminSettings: DEFAULT_ADMIN_SETTINGS,
        adminUsers: []
      };
      writeDb(defaultDb);
      return defaultDb;
    }
  } catch (error) {
    console.error('Error reading db.json:', error);
  }
  
  return {
    products: INITIAL_PRODUCTS,
    orders: [],
    adminSettings: DEFAULT_ADMIN_SETTINGS,
    adminUsers: []
  };
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbData = readDb();

  if (req.method === 'GET') {
    return res.status(200).json(dbData);
  }

  if (req.method === 'POST') {
    const { action, payload } = req.body;
    
    if (!action) {
      // Direct full sync fallback
      const newDb = {
        products: req.body.products || dbData.products,
        orders: req.body.orders || dbData.orders,
        adminSettings: req.body.adminSettings || dbData.adminSettings,
        adminUsers: req.body.adminUsers || dbData.adminUsers
      };
      writeDb(newDb);
      return res.status(200).json({ success: true, db: newDb });
    }

    switch (action) {
      case 'sync':
        return res.status(200).json(dbData);

      case 'saveAdminSettings': {
        const settings = payload;
        dbData.adminSettings = settings;
        
        if (settings.hasConfigured) {
          const existingIdx = dbData.adminUsers.findIndex(u => u.username.toLowerCase() === settings.username.toLowerCase());
          const userProfile = {
            username: settings.username,
            password: settings.password,
            mobileNumber: settings.mobileNumber,
            supportEmail: settings.supportEmail
          };
          
          if (existingIdx !== -1) {
            dbData.adminUsers[existingIdx] = { ...dbData.adminUsers[existingIdx], ...userProfile };
          } else {
            dbData.adminUsers.push(userProfile);
          }
        }
        writeDb(dbData);
        return res.status(200).json({ success: true, adminSettings: dbData.adminSettings, adminUsers: dbData.adminUsers });
      }

      case 'addProduct': {
        const product = payload;
        const newProduct = {
          ...product,
          id: product.id || 'prod-' + Date.now(),
          price: parseFloat(product.price) || 0,
          stock: parseInt(product.stock) || 0,
          rating: product.rating || 5.0,
          reviews: product.reviews || [],
          featured: product.featured || false,
          specifications: product.specifications || {}
        };
        dbData.products.push(newProduct);
        writeDb(dbData);
        return res.status(200).json({ success: true, product: newProduct });
      }

      case 'updateProduct': {
        const { id, updatedFields } = payload;
        const index = dbData.products.findIndex(p => p.id === id);
        if (index !== -1) {
          dbData.products[index] = {
            ...dbData.products[index],
            ...updatedFields,
            price: parseFloat(updatedFields.price) || dbData.products[index].price,
            stock: parseInt(updatedFields.stock) || dbData.products[index].stock
          };
          writeDb(dbData);
          return res.status(200).json({ success: true, product: dbData.products[index] });
        }
        return res.status(444).json({ success: false, error: 'Product not found' });
      }

      case 'deleteProduct': {
        const { id } = payload;
        dbData.products = dbData.products.filter(p => p.id !== id);
        writeDb(dbData);
        return res.status(200).json({ success: true });
      }

      case 'addOrder': {
        const orderData = payload;
        dbData.orders.push(orderData);

        // Deduct stock
        orderData.items.forEach(orderItem => {
          const pIndex = dbData.products.findIndex(p => p.id === orderItem.id);
          if (pIndex !== -1) {
            dbData.products[pIndex].stock = Math.max(0, dbData.products[pIndex].stock - orderItem.quantity);
          }
        });
        
        writeDb(dbData);
        return res.status(200).json({ success: true, order: orderData });
      }

      case 'updateOrderStatus': {
        const { id, newStatus } = payload;
        const index = dbData.orders.findIndex(o => o.id === id);
        if (index !== -1) {
          dbData.orders[index].status = newStatus;
          writeDb(dbData);
          return res.status(200).json({ success: true, order: dbData.orders[index] });
        }
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
