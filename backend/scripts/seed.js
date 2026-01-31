import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { brands, fragranceFamilies, noteGlossary, products, reviews, coupons, sampleOrders } from '../data/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/store.json');

const seedDB = async () => {
  try {
    console.log('Seeding Vibe Perfume store data...');

    // 1. Seed file-based store (store.json)
    const storeData = {
      brands,
      fragranceFamilies,
      noteGlossary,
      products,
      reviews,
      coupons,
      orders: sampleOrders,
      inventoryLogs: []
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(storeData, null, 2), 'utf-8');
    console.log(`✓ Seeded ${products.length} luxury products to local database (${DB_FILE})`);
    console.log(`✓ Seeded ${brands.length} fragrance houses & ${fragranceFamilies.length} scent families`);
    console.log(`✓ Seeded ${reviews.length} authenticated reviews`);
    console.log(`✓ Seeded ${coupons.length} promotional coupons & ${sampleOrders.length} sample orders`);

    // 2. Optional MongoDB seed if URI provided
    if (process.env.MONGODB_URI) {
      try {
        const mongoose = (await import('mongoose')).default;
        const Product = (await import('../models/Product.js')).default;
        const Review = (await import('../models/Review.js')).default;

        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('✓ Connected to MongoDB. Seeding collections...');

        await Product.deleteMany({});
        await Review.deleteMany({});

        const mongoProducts = products.map(p => ({
          name: p.name,
          brand: p.brandName,
          category: p.fragranceFamily.toLowerCase(),
          shortDescription: p.shortDescription,
          description: p.description,
          price: p.variants?.[0]?.price || 2490,
          currency: 'INR',
          images: p.galleryImages || [p.mainImageUrl],
          sizes: (p.variants || []).map(v => `${v.sizeMl}ml`),
          notes: {
            top: (p.notes?.top || []).map(n => n.name),
            heart: (p.notes?.heart || []).map(n => n.name),
            base: (p.notes?.base || []).map(n => n.name)
          }
        }));

        const createdProducts = await Product.insertMany(mongoProducts);
        console.log(`✓ Seeded ${createdProducts.length} products to MongoDB.`);
        await mongoose.disconnect();
      } catch (mongoErr) {
        console.log(`ℹ MongoDB not reachable (${mongoErr.message}). Continuing with atomic JSON storage.`);
      }
    }

    console.log('\n✨ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();

