const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

// Sample products data
const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
    price: 2999,
    discountPrice: 2499,
    category: "Electronics",
    subcategory: "Audio",
    brand: "AudioTech",
    stock: 50,
    isAvailable: true,
    tags: ["wireless", "headphones", "noise-cancellation", "premium"],
    images: [
      {
        public_id: "sample_headphones",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.5,
      count: 25
    },
    isSubscriptionAvailable: false,
    specifications: {
      "Battery Life": "30 hours",
      "Connectivity": "Bluetooth 5.0",
      "Weight": "250g"
    }
  },
  {
    name: "Organic Coffee Beans - Premium Blend",
    description: "Freshly roasted organic coffee beans from the finest coffee farms. Rich, aromatic, and perfect for your morning brew.",
    price: 899,
    discountPrice: 749,
    category: "Food & Beverages",
    subcategory: "Coffee",
    brand: "BrewMaster",
    stock: 100,
    isAvailable: true,
    tags: ["organic", "coffee", "premium", "fresh"],
    images: [
      {
        public_id: "sample_coffee",
        url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.8,
      count: 45
    },
    isSubscriptionAvailable: true,
    subscriptionPlans: [
      {
        name: "Weekly Fresh",
        interval: "weekly",
        intervalCount: 1,
        price: 699,
        discount: 10
      },
      {
        name: "Monthly Supply",
        interval: "monthly",
        intervalCount: 1,
        price: 2499,
        discount: 15
      }
    ],
    specifications: {
      "Weight": "500g",
      "Origin": "Colombia",
      "Roast Level": "Medium"
    }
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking watch with heart rate monitoring, GPS, and smartphone connectivity. Track your health and fitness goals.",
    price: 4999,
    discountPrice: 3999,
    category: "Electronics",
    subcategory: "Wearables",
    brand: "FitTech",
    stock: 30,
    isAvailable: true,
    tags: ["smartwatch", "fitness", "health", "gps"],
    images: [
      {
        public_id: "sample_watch",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.3,
      count: 18
    },
    isSubscriptionAvailable: false,
    specifications: {
      "Display": "1.4 inch AMOLED",
      "Battery": "7 days",
      "Water Resistance": "5ATM"
    }
  },
  {
    name: "Eco-Friendly Bamboo Toothbrush Set",
    description: "Sustainable bamboo toothbrushes with soft bristles. Environmentally friendly alternative to plastic toothbrushes.",
    price: 299,
    discountPrice: 249,
    category: "Health",
    subcategory: "Oral Care",
    brand: "EcoLife",
    stock: 200,
    isAvailable: true,
    tags: ["bamboo", "eco-friendly", "sustainable", "toothbrush"],
    images: [
      {
        public_id: "sample_toothbrush",
        url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.6,
      count: 32
    },
    isSubscriptionAvailable: true,
    subscriptionPlans: [
      {
        name: "Monthly Replacement",
        interval: "monthly",
        intervalCount: 3,
        price: 199,
        discount: 20
      }
    ],
    specifications: {
      "Material": "Bamboo Handle",
      "Bristles": "Soft Nylon",
      "Pack Size": "4 pieces"
    }
  },
  {
    name: "Premium Yoga Mat",
    description: "High-quality non-slip yoga mat made from eco-friendly materials. Perfect for yoga, pilates, and fitness exercises.",
    price: 1299,
    discountPrice: 999,
    category: "Sports",
    subcategory: "Fitness",
    brand: "YogaZen",
    stock: 75,
    isAvailable: true,
    tags: ["yoga", "fitness", "mat", "non-slip"],
    images: [
      {
        public_id: "sample_yoga_mat",
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.4,
      count: 28
    },
    isSubscriptionAvailable: false,
    specifications: {
      "Thickness": "6mm",
      "Material": "TPE",
      "Size": "183cm x 61cm"
    }
  },
  {
    name: "Organic Green Tea Collection",
    description: "Premium collection of organic green teas from different regions. Rich in antioxidants and perfect for daily wellness.",
    price: 599,
    discountPrice: 499,
    category: "Food & Beverages",
    subcategory: "Tea",
    brand: "TeaGarden",
    stock: 150,
    isAvailable: true,
    tags: ["green tea", "organic", "antioxidants", "wellness"],
    images: [
      {
        public_id: "sample_tea",
        url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.7,
      count: 38
    },
    isSubscriptionAvailable: true,
    subscriptionPlans: [
      {
        name: "Monthly Tea Box",
        interval: "monthly",
        intervalCount: 1,
        price: 449,
        discount: 10
      }
    ],
    specifications: {
      "Weight": "200g",
      "Varieties": "5 different teas",
      "Origin": "Assam, India"
    }
  },
  {
    name: "Wireless Charging Pad",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection.",
    price: 1499,
    discountPrice: 1199,
    category: "Electronics",
    subcategory: "Accessories",
    brand: "ChargeTech",
    stock: 80,
    isAvailable: true,
    tags: ["wireless", "charging", "fast-charge", "qi-compatible"],
    images: [
      {
        public_id: "sample_charger",
        url: "https://images.unsplash.com/photo-1609592806596-4d8b5b5e7e0a?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.2,
      count: 22
    },
    isSubscriptionAvailable: false,
    specifications: {
      "Output": "10W Fast Charging",
      "Compatibility": "Qi-enabled devices",
      "Material": "Aluminum"
    }
  },
  {
    name: "Natural Skincare Set",
    description: "Complete natural skincare routine with cleanser, toner, and moisturizer. Made with organic ingredients for all skin types.",
    price: 1899,
    discountPrice: 1499,
    category: "Beauty",
    subcategory: "Skincare",
    brand: "NaturalGlow",
    stock: 60,
    isAvailable: true,
    tags: ["skincare", "natural", "organic", "beauty"],
    images: [
      {
        public_id: "sample_skincare",
        url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
      }
    ],
    ratings: {
      average: 4.5,
      count: 35
    },
    isSubscriptionAvailable: true,
    subscriptionPlans: [
      {
        name: "Monthly Skincare",
        interval: "monthly",
        intervalCount: 2,
        price: 1299,
        discount: 15
      }
    ],
    specifications: {
      "Set Includes": "Cleanser, Toner, Moisturizer",
      "Skin Type": "All skin types",
      "Volume": "100ml each"
    }
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/subscribify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user exists, if not create one
    let adminUser = await User.findOne({ email: 'admin@subscribify.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@subscribify.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created: admin@subscribify.com / admin123');
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add createdBy field to all products
    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithCreator);
    console.log(`Inserted ${insertedProducts.length} sample products`);

    // Add some sample reviews to products
    for (let i = 0; i < insertedProducts.length; i++) {
      const product = insertedProducts[i];
      const reviewCount = Math.floor(Math.random() * 5) + 1; // 1-5 reviews per product
      
      for (let j = 0; j < reviewCount; j++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 star ratings
        product.reviews.push({
          user: adminUser._id,
          name: `Customer ${j + 1}`,
          rating: rating,
          comment: `Great product! Really satisfied with the quality and performance. Would definitely recommend to others.`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
      
      product.calculateAverageRating();
      await product.save();
    }

    console.log('Added sample reviews to products');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created admin user: admin@subscribify.com`);
    console.log(`- Inserted ${insertedProducts.length} products`);
    console.log(`- Added reviews to all products`);
    console.log('\n🚀 You can now start the application and see products!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();