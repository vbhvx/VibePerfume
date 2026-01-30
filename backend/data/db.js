import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { brands, fragranceFamilies, noteGlossary, products, reviews, coupons, sampleOrders } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function isTestMode() {
  return process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));
}

function getDbFile() {
  if (isTestMode()) {
    return path.join(__dirname, 'store.test.json');
  }
  return path.join(__dirname, 'store.json');
}

function createInitialData() {
  return {
    brands: JSON.parse(JSON.stringify(brands)),
    fragranceFamilies: JSON.parse(JSON.stringify(fragranceFamilies)),
    noteGlossary: JSON.parse(JSON.stringify(noteGlossary)),
    products: JSON.parse(JSON.stringify(products)),
    reviews: JSON.parse(JSON.stringify(reviews)),
    coupons: JSON.parse(JSON.stringify(coupons)),
    orders: JSON.parse(JSON.stringify(sampleOrders)),
    inventoryLogs: []
  };
}

// Initialize store if missing
function loadStore() {
  const dbFile = getDbFile();
  try {
    if (!fs.existsSync(dbFile)) {
      const initialData = createInitialData();
      fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load DB store, falling back to seed data:', err.message);
    return createInitialData();
  }
}

function saveStore(data) {
  const dbFile = getDbFile();
  try {
    const tmpFile = `${dbFile}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, dbFile);
  } catch (err) {
    console.error('Failed to save DB store:', err.message);
  }
}

export const db = {
  resetStore() {
    const initialData = createInitialData();
    saveStore(initialData);
    return initialData;
  },

  cleanupTestStore() {
    if (isTestMode()) {
      const testFile = getDbFile();
      if (fs.existsSync(testFile)) {
        try {
          fs.unlinkSync(testFile);
        } catch {}
      }
    }
  },
  // --- BRANDS ---
  getBrands() {
    const store = loadStore();
    return store.brands || [];
  },

  // --- FAMILIES ---
  getFragranceFamilies() {
    const store = loadStore();
    return store.fragranceFamilies || [];
  },

  // --- NOTES ---
  getNotes() {
    const store = loadStore();
    const products = store.products || [];
    const glossary = store.noteGlossary || [];

    // Augment with count of products containing each note
    return glossary.map(note => {
      const count = products.filter(p => {
        if (!p.notes) return false;
        const allNotes = [
          ...(p.notes.top || []),
          ...(p.notes.heart || []),
          ...(p.notes.base || [])
        ].map(n => typeof n === 'string' ? n.toLowerCase() : n.name.toLowerCase());
        return allNotes.some(n => n.includes(note.name.toLowerCase()));
      }).length;
      return { ...note, productCount: count };
    });
  },

  // --- PRODUCTS ---
  getProducts(filters = {}) {
    const store = loadStore();
    let result = (store.products || []).filter(p => p.productStatus !== 'archived');

    // Filter by family / category
    if (filters.family && filters.family !== 'All' && filters.family !== 'all') {
      const fam = filters.family.toLowerCase();
      result = result.filter(p => 
        (p.fragranceFamily && p.fragranceFamily.toLowerCase() === fam) ||
        (p.secondaryFamilies && p.secondaryFamilies.some(f => f.toLowerCase() === fam))
      );
    }

    // Filter by brand
    if (filters.brand && filters.brand !== 'All') {
      result = result.filter(p => p.brandId === filters.brand || p.brandName.toLowerCase() === filters.brand.toLowerCase());
    }

    // Filter by specific note
    if (filters.note) {
      const targetNote = filters.note.toLowerCase();
      result = result.filter(p => {
        if (!p.notes) return false;
        const allNotes = [
          ...(p.notes.top || []),
          ...(p.notes.heart || []),
          ...(p.notes.base || [])
        ].map(n => typeof n === 'string' ? n.toLowerCase() : n.name.toLowerCase());
        return allNotes.some(n => n.includes(targetNote));
      });
    }

    // Filter by price range
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      const minP = Number(filters.minPrice);
      result = result.filter(p => {
        const lowestVariant = Math.min(...(p.variants || []).map(v => v.price));
        return lowestVariant >= minP;
      });
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      const maxP = Number(filters.maxPrice);
      result = result.filter(p => {
        const lowestVariant = Math.min(...(p.variants || []).map(v => v.price));
        return lowestVariant <= maxP;
      });
    }

    // Filter by in-stock only
    if (filters.inStock === 'true' || filters.inStock === true) {
      result = result.filter(p => 
        (p.variants || []).some(v => v.stockQuantity > 0)
      );
    }

    // Filter by rating
    if (filters.minRating) {
      const minR = Number(filters.minRating);
      result = result.filter(p => (p.rating || 0) >= minR);
    }

    // Filter by concentration
    if (filters.concentration && filters.concentration !== 'All') {
      const conc = filters.concentration.toLowerCase();
      result = result.filter(p => 
        (p.variants || []).some(v => v.concentration.toLowerCase().includes(conc))
      );
    }

    // Filter by size
    if (filters.sizeMl) {
      const s = Number(filters.sizeMl);
      result = result.filter(p => 
        (p.variants || []).some(v => v.sizeMl === s)
      );
    }

    // Filter by occasion
    if (filters.occasion) {
      const occ = filters.occasion.toLowerCase();
      result = result.filter(p => 
        (p.occasions || []).some(o => o.toLowerCase().includes(occ))
      );
    }

    // Filter by query / full-text search
    if (filters.q) {
      const query = filters.q.toLowerCase().trim();
      result = result.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const brandMatch = p.brandName.toLowerCase().includes(query);
        const descMatch = (p.description || '').toLowerCase().includes(query);
        const familyMatch = (p.fragranceFamily || '').toLowerCase().includes(query);
        const descripMatch = (p.characterDescriptors || []).some(d => d.toLowerCase().includes(query));
        const notesMatch = p.notes ? [
          ...(p.notes.top || []),
          ...(p.notes.heart || []),
          ...(p.notes.base || [])
        ].some(n => (typeof n === 'string' ? n : n.name).toLowerCase().includes(query)) : false;

        return nameMatch || brandMatch || descMatch || familyMatch || descripMatch || notesMatch;
      });
    }

    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          result.sort((a, b) => {
            const minA = Math.min(...(a.variants || []).map(v => v.price));
            const minB = Math.min(...(b.variants || []).map(v => v.price));
            return minA - minB;
          });
          break;
        case 'price_desc':
          result.sort((a, b) => {
            const maxA = Math.max(...(a.variants || []).map(v => v.price));
            const maxB = Math.max(...(b.variants || []).map(v => v.price));
            return maxB - maxA;
          });
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          result.sort((a, b) => (b.launchYear || 0) - (a.launchYear || 0));
          break;
        case 'featured':
        default:
          // Keep default curated order
          break;
      }
    }

    if (filters.limit) {
      result = result.slice(0, Number(filters.limit));
    }

    return result;
  },

  getProductById(id) {
    const store = loadStore();
    return (store.products || []).find(p => p.id === id || p.slug === id) || null;
  },

  createProduct(productData) {
    const store = loadStore();
    const id = `prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = {
      ...productData,
      id,
      slug,
      productStatus: productData.productStatus || 'active',
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    store.products.push(newProduct);
    saveStore(store);
    return newProduct;
  },

  updateProduct(id, updateData) {
    const store = loadStore();
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    store.products[index] = {
      ...store.products[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    saveStore(store);
    return store.products[index];
  },

  deleteProduct(id) {
    const store = loadStore();
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    store.products.splice(index, 1);
    saveStore(store);
    return true;
  },

  // --- REVIEWS ---
  getReviewsForProduct(productId) {
    const store = loadStore();
    return (store.reviews || [])
      .filter(r => r.productId === productId && r.moderationStatus === 'published')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllReviews() {
    const store = loadStore();
    return store.reviews || [];
  },

  addReview(reviewData) {
    const store = loadStore();
    const newReview = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId,
      reviewerName: reviewData.reviewerName,
      rating: Number(reviewData.rating),
      title: reviewData.title || '',
      body: reviewData.body || reviewData.comment || '',
      verificationStatus: reviewData.verificationStatus || 'unverified',
      moderationStatus: 'published', // automatically published in standard demo mode
      createdAt: new Date().toISOString()
    };

    store.reviews.push(newReview);

    // Recalculate product aggregate rating
    const prodReviews = store.reviews.filter(r => r.productId === reviewData.productId && r.moderationStatus === 'published');
    const totalScore = prodReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = prodReviews.length > 0 ? Number((totalScore / prodReviews.length).toFixed(1)) : 5.0;

    const prodIndex = store.products.findIndex(p => p.id === reviewData.productId);
    if (prodIndex !== -1) {
      store.products[prodIndex].rating = avg;
      store.products[prodIndex].reviewCount = prodReviews.length;
    }

    saveStore(store);
    return newReview;
  },

  updateReviewModeration(id, moderationStatus, verificationStatus) {
    const store = loadStore();
    const rev = store.reviews.find(r => r.id === id);
    if (!rev) return null;

    if (moderationStatus) rev.moderationStatus = moderationStatus;
    if (verificationStatus) rev.verificationStatus = verificationStatus;
    rev.updatedAt = new Date().toISOString();

    // Recalculate product rating
    const prodReviews = store.reviews.filter(r => r.productId === rev.productId && r.moderationStatus === 'published');
    const totalScore = prodReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = prodReviews.length > 0 ? Number((totalScore / prodReviews.length).toFixed(1)) : 5.0;

    const prodIndex = store.products.findIndex(p => p.id === rev.productId);
    if (prodIndex !== -1) {
      store.products[prodIndex].rating = avg;
      store.products[prodIndex].reviewCount = prodReviews.length;
    }

    saveStore(store);
    return rev;
  },

  // --- COUPONS ---
  validateCoupon(code, subtotal) {
    const store = loadStore();
    if (!code) return { valid: false, message: 'No coupon code provided' };

    const coupon = (store.coupons || []).find(c => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!coupon) return { valid: false, message: 'Invalid promotional code' };

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Coupon requires minimum order of ₹${coupon.minOrderValue.toLocaleString()}`
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountAmount: Math.min(discountAmount, subtotal)
      }
    };
  },

  // --- CART REVALIDATION ---
  validateCart(items = [], couponCode = '', shippingMethod = 'standard') {
    const store = loadStore();
    const validatedItems = [];
    let subtotal = 0;
    const errors = [];

    for (const item of items) {
      const product = (store.products || []).find(p => p.id === item.productId);
      if (!product) {
        errors.push(`Product ${item.productId} is no longer available.`);
        continue;
      }

      const variant = (product.variants || []).find(v => v.id === item.variantId);
      if (!variant) {
        errors.push(`Variant for ${product.name} is no longer available.`);
        continue;
      }

      const requestedQty = Math.max(1, Number(item.quantity || 1));
      const availableStock = variant.stockQuantity;
      const actualQty = Math.min(requestedQty, availableStock);

      if (availableStock === 0) {
        errors.push(`${product.name} (${variant.sizeMl}ml) is currently out of stock.`);
        continue;
      }

      if (requestedQty > availableStock) {
        errors.push(`Only ${availableStock} units of ${product.name} (${variant.sizeMl}ml) are currently available.`);
      }

      const lineTotal = variant.price * actualQty;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        brandName: product.brandName,
        sku: variant.sku,
        sizeMl: variant.sizeMl,
        concentration: variant.concentration,
        unitPrice: variant.price,
        compareAtPrice: variant.compareAtPrice,
        quantity: actualQty,
        lineTotal,
        imageUrl: product.mainImageUrl,
        stockAvailable: availableStock
      });
    }

    // Shipping calculation: Free over 2000, else 150 for standard; 250 for express
    let shippingFee = 0;
    if (shippingMethod === 'express') {
      shippingFee = 250;
    } else {
      shippingFee = subtotal >= 2000 ? 0 : 150;
    }

    // Discount validation
    let discount = 0;
    let couponDetails = null;
    if (couponCode) {
      const couponRes = this.validateCoupon(couponCode, subtotal);
      if (couponRes.valid) {
        discount = couponRes.coupon.discountAmount;
        couponDetails = couponRes.coupon;
      }
    }

    const total = Math.max(0, subtotal - discount + shippingFee);

    return {
      success: errors.length === 0,
      errors,
      items: validatedItems,
      subtotal,
      discount,
      coupon: couponDetails,
      shippingFee,
      freeShippingThreshold: 2000,
      amountToFreeShipping: Math.max(0, 2000 - subtotal),
      tax: 0, // Included in price
      total
    };
  },

  // --- ORDERS ---
  createOrder(orderPayload) {
    const store = loadStore();

    // 1. Revalidate cart items against current authoritative prices and stock
    const cartValidation = this.validateCart(
      orderPayload.items,
      orderPayload.discountCode,
      orderPayload.shippingMethod || 'standard'
    );

    if (cartValidation.items.length === 0) {
      throw new Error('Cannot create order with an empty or invalid cart.');
    }

    // 2. Decrement inventory for each variant
    for (const line of cartValidation.items) {
      const prodIndex = store.products.findIndex(p => p.id === line.productId);
      if (prodIndex !== -1) {
        const varIndex = store.products[prodIndex].variants.findIndex(v => v.id === line.variantId);
        if (varIndex !== -1) {
          const currentStock = store.products[prodIndex].variants[varIndex].stockQuantity;
          const newStock = Math.max(0, currentStock - line.quantity);
          store.products[prodIndex].variants[varIndex].stockQuantity = newStock;
          store.products[prodIndex].variants[varIndex].status = newStock === 0 ? 'out_of_stock' : (newStock <= 5 ? 'low_stock' : 'in_stock');

          store.inventoryLogs = store.inventoryLogs || [];
          store.inventoryLogs.push({
            id: `inv-${Date.now()}-${line.sku}`,
            sku: line.sku,
            variantId: line.variantId,
            delta: -line.quantity,
            newStock,
            reason: `Order ${orderPayload.orderNumber || 'New Order'} checkout`,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    const orderNumber = `VP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: orderPayload.customerId || 'guest',
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      orderStatus: 'confirmed',
      paymentStatus: orderPayload.paymentStatus || 'paid',
      paymentMethod: orderPayload.paymentMethod || 'Credit Card',
      paymentTransactionId: orderPayload.paymentTransactionId || `TXN-${Date.now()}`,
      currency: 'INR',
      subtotal: cartValidation.subtotal,
      discount: cartValidation.discount,
      discountCode: cartValidation.coupon ? cartValidation.coupon.code : null,
      shipping: cartValidation.shippingFee,
      tax: 0,
      total: cartValidation.total,
      shippingAddress: orderPayload.shippingAddress,
      items: cartValidation.items,
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          message: 'Order verified and confirmed. Complimentary 2ml sample vial included.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.orders = store.orders || [];
    store.orders.unshift(newOrder);
    saveStore(store);

    return newOrder;
  },

  getOrder(orderNumber) {
    const store = loadStore();
    return (store.orders || []).find(o => 
      o.orderNumber.toUpperCase() === orderNumber.toUpperCase() ||
      o.id === orderNumber
    ) || null;
  },

  getAllOrders() {
    const store = loadStore();
    return store.orders || [];
  },

  updateOrderStatus(orderId, status, note = '') {
    const store = loadStore();
    const order = (store.orders || []).find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      message: note || `Order status updated to ${status}`
    });
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return order;
  },

  cancelOrder(orderId, reason = 'Customer requested cancellation') {
    const store = loadStore();
    const order = (store.orders || []).find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      throw new Error('Orders that have already been dispatched or delivered cannot be canceled directly. Please initiate an exchange or return.');
    }

    // Revert inventory
    for (const line of order.items) {
      const prodIndex = store.products.findIndex(p => p.id === line.productId);
      if (prodIndex !== -1) {
        const varIndex = store.products[prodIndex].variants.findIndex(v => v.id === line.variantId);
        if (varIndex !== -1) {
          store.products[prodIndex].variants[varIndex].stockQuantity += line.quantity;
          store.products[prodIndex].variants[varIndex].status = 'in_stock';
        }
      }
    }

    order.orderStatus = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: `Cancellation: ${reason}. Inventory restocked.`
    });
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return order;
  },

  // --- INVENTORY ADJUSTMENT ---
  adjustInventory(variantId, quantityDelta, reason = 'Manual staff adjustment') {
    const store = loadStore();
    let updatedVariant = null;

    for (const prod of store.products) {
      const v = (prod.variants || []).find(item => item.id === variantId || item.sku === variantId);
      if (v) {
        v.stockQuantity = Math.max(0, v.stockQuantity + Number(quantityDelta));
        v.status = v.stockQuantity === 0 ? 'out_of_stock' : (v.stockQuantity <= 5 ? 'low_stock' : 'in_stock');
        updatedVariant = v;

        store.inventoryLogs = store.inventoryLogs || [];
        store.inventoryLogs.push({
          id: `inv-${Date.now()}`,
          sku: v.sku,
          variantId: v.id,
          delta: quantityDelta,
          newStock: v.stockQuantity,
          reason,
          createdAt: new Date().toISOString()
        });
        break;
      }
    }

    if (updatedVariant) saveStore(store);
    return updatedVariant;
  },

  // --- SCENT FINDER ALGORITHM ---
  recommendFragrances(preferences = {}) {
    const store = loadStore();
    const allProducts = (store.products || []).filter(p => p.productStatus === 'active');

    // Weights:
    // Family match: 35
    // Preferred notes match: 25
    // Intensity match: 15
    // Occasion match: 15
    // Budget match: 10
    const scoredProducts = allProducts.map(p => {
      let score = 0;
      const matchReasons = [];

      // 1. Scent Family
      if (preferences.family) {
        const famPref = preferences.family.toLowerCase();
        const primaryMatch = p.fragranceFamily.toLowerCase() === famPref;
        const secondaryMatch = (p.secondaryFamilies || []).some(f => f.toLowerCase() === famPref);
        if (primaryMatch) {
          score += 35;
          matchReasons.push(`Matches your primary preference for ${p.fragranceFamily} scents.`);
        } else if (secondaryMatch) {
          score += 25;
          matchReasons.push(`Harmonizes with ${p.fragranceFamily} and contains ${preferences.family} undertones.`);
        }
      }

      // 2. Preferred Notes
      if (Array.isArray(preferences.preferredNotes) && preferences.preferredNotes.length > 0) {
        const prodNotes = [
          ...(p.notes.top || []),
          ...(p.notes.heart || []),
          ...(p.notes.base || [])
        ].map(n => (typeof n === 'string' ? n : n.name).toLowerCase());

        const matchedNotes = preferences.preferredNotes.filter(pref => 
          prodNotes.some(pn => pn.includes(pref.toLowerCase()))
        );

        if (matchedNotes.length > 0) {
          const noteScore = Math.min(25, matchedNotes.length * 12);
          score += noteScore;
          matchReasons.push(`Features your coveted notes: ${matchedNotes.join(', ')}.`);
        }
      }

      // 2b. Avoided Notes penalty
      if (Array.isArray(preferences.avoidNotes) && preferences.avoidNotes.length > 0) {
        const prodNotes = [
          ...(p.notes.top || []),
          ...(p.notes.heart || []),
          ...(p.notes.base || [])
        ].map(n => (typeof n === 'string' ? n : n.name).toLowerCase());

        const avoidedFound = preferences.avoidNotes.filter(avoid => 
          prodNotes.some(pn => pn.includes(avoid.toLowerCase()))
        );

        if (avoidedFound.length > 0) {
          score -= 40; // High penalty
        }
      }

      // 3. Intensity / Sillage
      if (preferences.intensity) {
        const targetInt = preferences.intensity.toLowerCase();
        if (p.intensity && p.intensity.toLowerCase().includes(targetInt)) {
          score += 15;
          matchReasons.push(`Perfect ${p.intensity} presence matching your sillage preference.`);
        }
      }

      // 4. Occasion
      if (preferences.occasion) {
        const occPref = preferences.occasion.toLowerCase();
        const occMatch = (p.occasions || []).some(o => o.toLowerCase().includes(occPref));
        if (occMatch) {
          score += 15;
          matchReasons.push(`Recommended for ${preferences.occasion} wear.`);
        }
      }

      // 5. Budget
      if (preferences.maxBudget) {
        const minVariantPrice = Math.min(...(p.variants || []).map(v => v.price));
        if (minVariantPrice <= Number(preferences.maxBudget)) {
          score += 10;
          matchReasons.push(`Available within your budget starting at ₹${minVariantPrice.toLocaleString()}.`);
        }
      }

      // Base minimum match calculation (capped between 40% and 99%)
      const matchPercentage = Math.min(99, Math.max(45, Math.round((score / 100) * 100)));

      return {
        product: p,
        matchScore: score,
        matchPercentage,
        matchReasons: matchReasons.length > 0 ? matchReasons : [`A celebrated ${p.fragranceFamily} fragrance with exceptional customer ratings.`]
      };
    });

    // Sort descending by score
    scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
    return scoredProducts.slice(0, 6);
  }
};
