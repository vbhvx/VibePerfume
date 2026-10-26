import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../../frontend/public/images/perfumes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const imagesToDownload = [
  // Product 1: Noir Absolu (Woody / Dark Amber Oud)
  {
    filename: 'noir-absolu-main.jpg',
    url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'noir-absolu-1.jpg',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'noir-absolu-2.jpg',
    url: 'https://images.unsplash.com/photo-1458538977777-0549b2370168?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 2: Rose Éclat (Floral / Rose / Jasmine)
  {
    filename: 'rose-eclat-main.jpg',
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'rose-eclat-1.jpg',
    url: 'https://images.unsplash.com/photo-1588514912908-8f5891714f8d?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'rose-eclat-2.jpg',
    url: 'https://images.unsplash.com/photo-1763986665850-6e66549aa8e0?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 3: Citrus Verve (Citrus / Amalfi Lemon / Basil)
  {
    filename: 'citrus-verve-main.jpg',
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'citrus-verve-1.jpg',
    url: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'citrus-verve-2.jpg',
    url: 'https://images.unsplash.com/photo-1761329842950-f3551938e4da?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 4: Oud Mystique (Oriental / Arabian Oud / Saffron / Cardamom) - Fixes 404!
  {
    filename: 'oud-mystique-main.jpg',
    url: 'https://images.unsplash.com/photo-1608828201325-cfc4c1cc6ef9?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'oud-mystique-1.jpg',
    url: 'https://images.unsplash.com/photo-1608828201317-ce72715cb12a?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'oud-mystique-2.jpg',
    url: 'https://images.unsplash.com/photo-1700665053090-e64274eeba84?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 5: Marine Royale (Aquatic / Mineral / Ocean Driftwood)
  {
    filename: 'marine-royale-main.jpg',
    url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'marine-royale-1.jpg',
    url: 'https://images.unsplash.com/photo-1761659760494-32b921a2449f?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'marine-royale-2.jpg',
    url: 'https://images.unsplash.com/photo-1588514912908-8f5891714f8d?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 6: Hinoki Sylvan (Woody / Japanese Hinoki / Zen Green)
  {
    filename: 'hinoki-sylvan-main.jpg',
    url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'hinoki-sylvan-1.jpg',
    url: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'hinoki-sylvan-2.jpg',
    url: 'https://images.unsplash.com/photo-1585218334450-afcf929da36e?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 7: Vanille Dorée (Gourmand / Madagascar Amber Vanilla)
  {
    filename: 'vanille-doree-main.jpg',
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'vanille-doree-1.jpg',
    url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'vanille-doree-2.jpg',
    url: 'https://images.unsplash.com/photo-1605463967516-b73a52062ab0?auto=format&fit=crop&q=85&w=1000'
  },

  // Product 8: Sovereign Leather (Spicy / Cured Tobacco / Heritage Leather)
  {
    filename: 'sovereign-leather-main.jpg',
    url: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'sovereign-leather-1.jpg',
    url: 'https://images.unsplash.com/photo-1605463967516-b73a52062ab0?auto=format&fit=crop&q=85&w=1000'
  },
  {
    filename: 'sovereign-leather-2.jpg',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=85&w=1000'
  }
];

async function downloadImage(item) {
  const dest = path.join(targetDir, item.filename);
  console.log(`Downloading ${item.filename} from ${item.url}...`);
  try {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
    console.log(`✓ Saved ${item.filename} (${Math.round(buffer.length / 1024)} KB)`);
    return true;
  } catch (err) {
    console.error(`✗ Error downloading ${item.filename}:`, err.message);
    return false;
  }
}

async function run() {
  console.log(`Starting perfume asset download into ${targetDir}...`);
  let successCount = 0;
  for (const item of imagesToDownload) {
    const ok = await downloadImage(item);
    if (ok) successCount++;
  }
  console.log(`Done! Downloaded ${successCount}/${imagesToDownload.length} perfume assets.`);
}

run();
