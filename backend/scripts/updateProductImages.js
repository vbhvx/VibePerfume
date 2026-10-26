import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDataPath = path.resolve(__dirname, '../data/seedData.js');
const storeJsonPath = path.resolve(__dirname, '../data/store.json');

const productImages = {
  'prod-1': {
    mainImageUrl: '/images/perfumes/noir-absolu-main.jpg',
    galleryImages: [
      '/images/perfumes/noir-absolu-main.jpg',
      '/images/perfumes/noir-absolu-1.jpg',
      '/images/perfumes/noir-absolu-2.jpg'
    ]
  },
  'prod-2': {
    mainImageUrl: '/images/perfumes/rose-eclat-main.jpg',
    galleryImages: [
      '/images/perfumes/rose-eclat-main.jpg',
      '/images/perfumes/rose-eclat-1.jpg',
      '/images/perfumes/rose-eclat-2.jpg'
    ]
  },
  'prod-3': {
    mainImageUrl: '/images/perfumes/citrus-verve-main.jpg',
    galleryImages: [
      '/images/perfumes/citrus-verve-main.jpg',
      '/images/perfumes/citrus-verve-1.jpg',
      '/images/perfumes/citrus-verve-2.jpg'
    ]
  },
  'prod-4': {
    mainImageUrl: '/images/perfumes/oud-mystique-main.jpg',
    galleryImages: [
      '/images/perfumes/oud-mystique-main.jpg',
      '/images/perfumes/oud-mystique-1.jpg',
      '/images/perfumes/oud-mystique-2.jpg'
    ]
  },
  'prod-5': {
    mainImageUrl: '/images/perfumes/marine-royale-main.jpg',
    galleryImages: [
      '/images/perfumes/marine-royale-main.jpg',
      '/images/perfumes/marine-royale-1.jpg',
      '/images/perfumes/marine-royale-2.jpg'
    ]
  },
  'prod-6': {
    mainImageUrl: '/images/perfumes/hinoki-sylvan-main.jpg',
    galleryImages: [
      '/images/perfumes/hinoki-sylvan-main.jpg',
      '/images/perfumes/hinoki-sylvan-1.jpg',
      '/images/perfumes/hinoki-sylvan-2.jpg'
    ]
  },
  'prod-7': {
    mainImageUrl: '/images/perfumes/vanille-doree-main.jpg',
    galleryImages: [
      '/images/perfumes/vanille-doree-main.jpg',
      '/images/perfumes/vanille-doree-1.jpg',
      '/images/perfumes/vanille-doree-2.jpg'
    ]
  },
  'prod-8': {
    mainImageUrl: '/images/perfumes/sovereign-leather-main.jpg',
    galleryImages: [
      '/images/perfumes/sovereign-leather-main.jpg',
      '/images/perfumes/sovereign-leather-1.jpg',
      '/images/perfumes/sovereign-leather-2.jpg'
    ]
  }
};

// Update store.json
if (fs.existsSync(storeJsonPath)) {
  const store = JSON.parse(fs.readFileSync(storeJsonPath, 'utf8'));
  if (store.products && Array.isArray(store.products)) {
    store.products.forEach(p => {
      if (productImages[p.id]) {
        p.mainImageUrl = productImages[p.id].mainImageUrl;
        p.galleryImages = productImages[p.id].galleryImages;
      }
    });
    fs.writeFileSync(storeJsonPath, JSON.stringify(store, null, 2), 'utf8');
    console.log(`✓ Successfully updated products in ${storeJsonPath}`);
  }
}

// Update seedData.js
let seedContent = fs.readFileSync(seedDataPath, 'utf8');
for (const [prodId, data] of Object.entries(productImages)) {
  // Regex pattern matching product definition with id: prodId
  const prodRegex = new RegExp(
    `id:\\s*"${prodId}"[\\s\\S]*?mainImageUrl:\\s*"[^"]*"[\\s\\S]*?galleryImages:\\s*\\[[\\s\\S]*?\\]`
  );
  seedContent = seedContent.replace(prodRegex, (match) => {
    let updated = match.replace(/mainImageUrl:\s*"[^"]*"/, `mainImageUrl: "${data.mainImageUrl}"`);
    const galleryFormatted = `galleryImages: [\n      "${data.galleryImages[0]}",\n      "${data.galleryImages[1]}",\n      "${data.galleryImages[2]}"\n    ]`;
    updated = updated.replace(/galleryImages:\s*\[[\s\S]*?\]/, galleryFormatted);
    return updated;
  });
}

fs.writeFileSync(seedDataPath, seedContent, 'utf8');
console.log(`✓ Successfully updated products in ${seedDataPath}`);
