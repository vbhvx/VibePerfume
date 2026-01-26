import { 
  brands as defaultBrands, 
  fragranceFamilies as defaultFamilies, 
  noteGlossary as defaultNotes, 
  products as defaultProducts, 
  reviews as defaultReviews, 
  coupons as defaultCoupons, 
  sampleOrders as defaultOrders 
} from '../data/storeData.js';
import type { 
  Product, 
  Brand, 
  FragranceFamily, 
  NoteGlossaryItem, 
  Review, 
  Order, 
  CartValidationResult, 
  ScentFinderRecommendation, 
  AiSommelierResponse 
} from '../types';

const STORAGE_KEY_PRODUCTS = 'vp_catalog_products';
const STORAGE_KEY_REVIEWS = 'vp_reviews';
const STORAGE_KEY_ORDERS = 'vp_orders';

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return defaultProducts as unknown as Product[];
}

function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return defaultReviews as unknown as Review[];
}

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return defaultOrders as unknown as Order[];
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    // ignore
  }
}

function saveStoredReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    // ignore
  }
}

// 1. Products
export function fallbackFetchProducts(filters: Record<string, any> = {}) {
  let list = getStoredProducts().filter(p => p.productStatus !== 'archived');

  if (filters.family && filters.family !== 'All' && filters.family !== 'all') {
    const fam = filters.family.toLowerCase();
    list = list.filter(p => 
      (p.fragranceFamily && p.fragranceFamily.toLowerCase() === fam) ||
      (p.secondaryFamilies && p.secondaryFamilies.some(f => f.toLowerCase() === fam))
    );
  }

  if (filters.brand && filters.brand !== 'All') {
    list = list.filter(p => p.brandId === filters.brand || p.brandName.toLowerCase() === filters.brand.toLowerCase());
  }

  if (filters.q) {
    const query = filters.q.toLowerCase().trim();
    list = list.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(query);
      const brandMatch = p.brandName.toLowerCase().includes(query);
      const descMatch = (p.description || '').toLowerCase().includes(query);
      const familyMatch = (p.fragranceFamily || '').toLowerCase().includes(query);
      return nameMatch || brandMatch || descMatch || familyMatch;
    });
  }

  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    const minP = Number(filters.minPrice);
    list = list.filter(p => Math.min(...(p.variants || []).map(v => v.price)) >= minP);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    const maxP = Number(filters.maxPrice);
    list = list.filter(p => Math.min(...(p.variants || []).map(v => v.price)) <= maxP);
  }

  if (filters.sort) {
    switch (filters.sort) {
      case 'price_asc':
        list.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)));
        break;
      case 'price_desc':
        list.sort((a, b) => Math.max(...b.variants.map(v => v.price)) - Math.max(...a.variants.map(v => v.price)));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => (b.launchYear || 0) - (a.launchYear || 0));
        break;
    }
  }

  return { success: true, message: 'Retrieved from offline catalog', data: list, total: list.length };
}

export function fallbackFetchProductById(id: string) {
  const products = getStoredProducts();
  const product = products.find(p => p.id === id || p.slug === id);
  if (!product) {
    return { success: false, message: 'Product not found', data: null as any };
  }
  return { success: true, message: 'Product found', data: product };
}

// 2. Reviews
export function fallbackFetchProductReviews(productId: string) {
  const reviews = getStoredReviews();
  const filtered = reviews.filter(r => r.productId === productId);
  return { success: true, message: 'Reviews retrieved', data: filtered };
}

export function fallbackAddReview(productId: string, data: { reviewerName: string; rating: number; title?: string; comment: string; isVerifiedPurchase?: boolean }) {
  const reviews = getStoredReviews();
  const newRev: Review = {
    id: `rev-${Date.now()}`,
    productId,
    reviewerName: data.reviewerName,
    rating: Number(data.rating),
    title: data.title || '',
    body: data.comment,
    verificationStatus: data.isVerifiedPurchase ? 'verified_purchase' : 'unverified',
    moderationStatus: 'published',
    createdAt: new Date().toISOString()
  };
  reviews.unshift(newRev);
  saveStoredReviews(reviews);
  return { success: true, message: 'Thank you! Your fragrance review has been published.', data: newRev };
}

// 3. Brands, Families, Notes
export function fallbackFetchBrands() {
  return { success: true, data: defaultBrands as unknown as Brand[] };
}

export function fallbackFetchFamilies() {
  return { success: true, data: defaultFamilies as unknown as FragranceFamily[] };
}

export function fallbackFetchNotes() {
  return { success: true, data: defaultNotes as unknown as NoteGlossaryItem[] };
}

// 4. Scent Recommendations
export function fallbackGetRecommendations(preferences: any) {
  const products = getStoredProducts().filter(p => p.productStatus === 'active');
  const scored = products.map(p => {
    let score = 0;
    const matchReasons: string[] = [];

    if (preferences.family) {
      const fam = preferences.family.toLowerCase();
      if (p.fragranceFamily.toLowerCase() === fam) {
        score += 35;
        matchReasons.push(`Matches your preference for ${p.fragranceFamily} scents.`);
      } else if (p.secondaryFamilies?.some(f => f.toLowerCase() === fam)) {
        score += 25;
        matchReasons.push(`Harmonizes with ${preferences.family} accords.`);
      }
    }

    if (Array.isArray(preferences.preferredNotes) && preferences.preferredNotes.length > 0) {
      const allNotes = [
        ...(p.notes.top || []),
        ...(p.notes.heart || []),
        ...(p.notes.base || [])
      ].map(n => typeof n === 'string' ? n.toLowerCase() : n.name.toLowerCase());

      const matched = preferences.preferredNotes.filter((pn: string) => allNotes.some(n => n.includes(pn.toLowerCase())));
      if (matched.length > 0) {
        score += Math.min(25, matched.length * 12);
        matchReasons.push(`Features your preferred notes: ${matched.join(', ')}.`);
      }
    }

    if (preferences.intensity && p.intensity.toLowerCase().includes(preferences.intensity.toLowerCase())) {
      score += 15;
      matchReasons.push(`Matches your desired ${p.intensity} sillage presence.`);
    }

    if (preferences.occasion && p.occasions.some(o => o.toLowerCase().includes(preferences.occasion.toLowerCase()))) {
      score += 15;
      matchReasons.push(`Perfect for ${preferences.occasion} wear.`);
    }

    if (preferences.maxBudget) {
      const minPrice = Math.min(...p.variants.map(v => v.price));
      if (minPrice <= Number(preferences.maxBudget)) {
        score += 10;
        matchReasons.push(`Fits your budget starting at ₹${minPrice.toLocaleString()}.`);
      }
    }

    const matchPercentage = Math.min(99, Math.max(45, Math.round((score / 100) * 100)));

    return {
      product: p,
      matchScore: score,
      matchPercentage,
      matchReasons: matchReasons.length > 0 ? matchReasons : [`A celebrated ${p.fragranceFamily} fragrance.`]
    } as ScentFinderRecommendation;
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return { success: true, data: scored.slice(0, 6) };
}

// 5. AI Sommelier
export function fallbackAiSommelier(payload: any): { success: boolean; data: AiSommelierResponse } {
  const msg = (payload.message || '').toLowerCase();
  const recRes = fallbackGetRecommendations({
    family: msg.includes('wood') || msg.includes('oud') ? 'Woody' : (msg.includes('rose') || msg.includes('floral') ? 'Floral' : (msg.includes('citrus') ? 'Citrus' : undefined)),
    preferredNotes: msg.includes('oud') ? ['Oud'] : (msg.includes('vanilla') ? ['Bourbon Vanilla'] : []),
    intensity: msg.includes('intense') || msg.includes('strong') ? 'Intense' : 'Moderate',
    occasion: msg.includes('evening') || msg.includes('gala') ? 'Evening' : 'Daily Wear'
  });

  const topPerfume = recRes.data[0]?.product;
  const reply = topPerfume 
    ? `Welcome to L'Atelier. For your journey, I recommend exploring **${topPerfume.name}** by ${topPerfume.brandName}. It is an exquisite ${topPerfume.fragranceFamily.toLowerCase()} creation featuring ${topPerfume.notes.top.map(n => typeof n === 'string' ? n : n.name).join(' and ')} that radiates with effortless poise.`
    : `Greetings from L'Atelier Vibe Perfume. Share your coveted scent notes, favorite occasions, or sillage preferences, and I will compose a personalized olfactory wardrobe for you.`;

  const formattedMatches = recRes.data.map(r => ({
    ...r.product,
    matchPercentage: r.matchPercentage,
    sommelierRationale: r.matchReasons.join(' ')
  }));

  return {
    success: true,
    data: {
      reply,
      isFinal: true,
      collectedPreferences: {
        family: topPerfume?.fragranceFamily || 'Woody',
        notes: topPerfume ? topPerfume.notes.heart.map(n => typeof n === 'string' ? n : n.name) : ['Oud', 'Bergamot'],
        intensity: topPerfume?.intensity || 'Intense',
        occasion: topPerfume?.occasions[0] || 'Evening'
      },
      recommendations: formattedMatches,
      quickChips: ['Explore notes', 'View flacon details', 'Compare scents', 'Add to bag']
    }
  };
}

// 6. Commerce Cart & Coupon
export function fallbackValidateCart(items: any[] = [], couponCode = '', shippingMethod = 'standard'): { success: boolean; data: CartValidationResult } {
  const products = getStoredProducts();
  const validatedItems: any[] = [];
  let subtotal = 0;

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) continue;
    const variant = prod.variants.find(v => v.id === item.variantId);
    if (!variant) continue;

    const qty = Math.max(1, Number(item.quantity || 1));
    const lineTotal = variant.price * qty;
    subtotal += lineTotal;

    validatedItems.push({
      productId: prod.id,
      variantId: variant.id,
      productName: prod.name,
      brandName: prod.brandName,
      sku: variant.sku,
      sizeMl: variant.sizeMl,
      concentration: variant.concentration,
      unitPrice: variant.price,
      compareAtPrice: variant.compareAtPrice,
      quantity: qty,
      lineTotal,
      imageUrl: prod.mainImageUrl,
      stockAvailable: variant.stockQuantity
    });
  }

  let discount = 0;
  let couponDetails = null;
  if (couponCode) {
    const code = couponCode.toUpperCase().trim();
    const coupon = (defaultCoupons as any[]).find(c => c.code === code);
    if (coupon && subtotal >= coupon.minOrderValue) {
      discount = coupon.discountType === 'percentage' 
        ? Math.round((subtotal * coupon.value) / 100) 
        : coupon.value;
      couponDetails = { code: coupon.code, description: coupon.description, discountAmount: discount };
    }
  }

  const shippingFee = shippingMethod === 'express' ? 250 : (subtotal >= 2000 ? 0 : 150);
  const total = Math.max(0, subtotal - discount + shippingFee);

  return {
    success: true,
    data: {
      success: true,
      errors: [],
      items: validatedItems,
      subtotal,
      discount,
      coupon: couponDetails,
      shippingFee,
      freeShippingThreshold: 2000,
      amountToFreeShipping: Math.max(0, 2000 - subtotal),
      tax: 0,
      total
    }
  };
}

export function fallbackValidateCoupon(code: string, subtotal: number) {
  const coupon = (defaultCoupons as any[]).find(c => c.code === code.toUpperCase().trim());
  if (!coupon) {
    return { success: false, message: 'Invalid promotional code' };
  }
  if (subtotal < coupon.minOrderValue) {
    return { success: false, message: `Coupon requires minimum order of ₹${coupon.minOrderValue.toLocaleString()}` };
  }
  const discountAmount = coupon.discountType === 'percentage'
    ? Math.round((subtotal * coupon.value) / 100)
    : coupon.value;
  return {
    success: true,
    data: { code: coupon.code, description: coupon.description, discountAmount }
  };
}

// 7. Orders
export function fallbackCreateOrder(payload: any) {
  const validatedCart = fallbackValidateCart(payload.items, payload.discountCode, payload.shippingMethod).data;
  const orderNumber = `VP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerId: 'guest',
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    orderStatus: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: payload.paymentMethod || 'Credit Card',
    paymentTransactionId: `TXN-${Date.now()}`,
    currency: 'INR',
    subtotal: validatedCart.subtotal,
    discount: validatedCart.discount,
    discountCode: validatedCart.coupon ? validatedCart.coupon.code : undefined,
    shipping: validatedCart.shippingFee,
    tax: 0,
    total: validatedCart.total,
    shippingAddress: payload.shippingAddress,
    items: validatedCart.items,
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

  const orders = getStoredOrders();
  orders.unshift(newOrder);
  saveStoredOrders(orders);

  return { success: true, message: 'Your fragrance order has been successfully placed.', data: newOrder };
}

export function fallbackFetchOrderByNumber(orderNumber: string, email?: string) {
  const orders = getStoredOrders();
  const order = orders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase() || o.id === orderNumber);
  if (!order) {
    return { success: false, message: 'Order reference not found', data: null as any };
  }
  if (email && order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
    return { success: false, message: 'Email address does not match this order', data: null as any };
  }
  return { success: true, data: order };
}

export function fallbackCancelOrder(orderNumber: string, reason?: string) {
  const orders = getStoredOrders();
  const order = orders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase() || o.id === orderNumber);
  if (!order) {
    return { success: false, message: 'Order not found', data: null as any };
  }
  order.orderStatus = 'cancelled';
  order.timeline.push({
    status: 'cancelled',
    timestamp: new Date().toISOString(),
    message: `Cancellation: ${reason || 'Customer request'}. Inventory restocked.`
  });
  order.updatedAt = new Date().toISOString();
  saveStoredOrders(orders);
  return { success: true, message: 'Order has been successfully cancelled.', data: order };
}

// 8. Admin
export function fallbackFetchAdminMetrics() {
  const products = getStoredProducts();
  const orders = getStoredOrders();
  const reviews = getStoredReviews();
  const totalRevenue = orders.filter(o => o.orderStatus !== 'cancelled').reduce((sum, o) => sum + o.total, 0);

  return {
    success: true,
    data: {
      totalRevenue,
      totalOrders: orders.length,
      activeProducts: products.length,
      pendingReviews: reviews.filter(r => r.moderationStatus === 'pending').length,
      lowStockVariants: products.reduce((acc, p) => acc + p.variants.filter(v => v.stockQuantity <= 10).length, 0),
      averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0
    }
  };
}

export function fallbackFetchAdminOrders() {
  return { success: true, data: getStoredOrders() };
}

export function fallbackUpdateOrderStatus(orderId: string, status: string, note?: string) {
  const orders = getStoredOrders();
  const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
  if (!order) return { success: false, message: 'Order not found', data: null as any };
  order.orderStatus = status as any;
  order.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    message: note || `Order status updated to ${status}`
  });
  order.updatedAt = new Date().toISOString();
  saveStoredOrders(orders);
  return { success: true, data: order };
}

export function fallbackFetchAdminReviews() {
  return { success: true, data: getStoredReviews() };
}

export function fallbackModerateReview(id: string, moderationStatus: string, verificationStatus?: string) {
  const reviews = getStoredReviews();
  const rev = reviews.find(r => r.id === id);
  if (!rev) return { success: false, message: 'Review not found', data: null as any };
  if (moderationStatus) rev.moderationStatus = moderationStatus as any;
  if (verificationStatus) rev.verificationStatus = verificationStatus as any;
  rev.updatedAt = new Date().toISOString();
  saveStoredReviews(reviews);
  return { success: true, data: rev };
}

export function fallbackAdjustStock(variantId: string, quantityDelta: number) {
  const products = getStoredProducts();
  let updatedVariant: any = null;
  for (const p of products) {
    const v = p.variants.find(v => v.id === variantId || v.sku === variantId);
    if (v) {
      v.stockQuantity = Math.max(0, v.stockQuantity + quantityDelta);
      v.status = v.stockQuantity === 0 ? 'out_of_stock' : (v.stockQuantity <= 5 ? 'low_stock' : 'in_stock');
      updatedVariant = v;
      break;
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (e) {
    // ignore
  }
  return { success: true, data: updatedVariant };
}
