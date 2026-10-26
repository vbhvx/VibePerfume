export interface FragranceNote {
  name: string;
  category: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  sizeMl: number;
  concentration: string;
  packagingType: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Product {
  id: string;
  _id?: string; // backwards compatibility if needed
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  fragranceFamily: string;
  secondaryFamilies?: string[];
  genderPresentation?: 'Unisex' | 'Masculine' | 'Feminine';
  launchYear?: number;
  perfumer?: string;
  intensity: 'Subtle' | 'Moderate' | 'Intense' | 'Very Intense' | string;
  longevity: string;
  sillage: 'Intimate' | 'Moderate' | 'Enormous' | string;
  characterDescriptors: string[];
  occasions: string[];
  seasons: string[];
  productStatus: 'active' | 'draft' | 'archived' | string;
  mainImageUrl: string;
  galleryImages: string[];
  notes: {
    top: (FragranceNote | string)[];
    heart: (FragranceNote | string)[];
    base: (FragranceNote | string)[];
  };
  variants: ProductVariant[];
  defaultVariantId?: string;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  origin: string;
  foundedYear: number;
  description: string;
  status: string;
}

export interface FragranceFamily {
  id: string;
  name: string;
  description: string;
}

export interface NoteGlossaryItem {
  name: string;
  category: string;
  description: string;
  productCount?: number;
}

export interface Review {
  id: string;
  _id?: string;
  productId: string;
  reviewerName: string;
  rating: number;
  title?: string;
  body?: string;
  comment?: string; // backwards compatibility
  verificationStatus: 'verified_purchase' | 'unverified';
  moderationStatus: 'published' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  brandName: string;
  sku: string;
  sizeMl: number;
  concentration: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string;
  stockAvailable: number;
}

export interface CartValidationResult {
  success: boolean;
  errors: string[];
  items: CartItem[];
  subtotal: number;
  discount: number;
  coupon?: {
    code: string;
    description: string;
    discountAmount: number;
  } | null;
  shippingFee: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  tax: number;
  total: number;
}

export interface ScentFinderRecommendation {
  product: Product;
  matchScore: number;
  matchPercentage: number;
  matchReasons: string[];
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerPhone?: string;
  orderStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: string;
  paymentMethod: string;
  paymentTransactionId?: string;
  currency: string;
  subtotal: number;
  discount: number;
  discountCode?: string | null;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  timeline: {
    status: string;
    timestamp: string;
    message: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: { field: string; message: string }[];
  total?: number;
}

export interface AiSommelierPayload {
  message?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  collectedPreferences?: Record<string, any>;
}

export interface AiSommelierProductMatch extends Product {
  matchPercentage: number;
  sommelierRationale: string;
}

export interface AiSommelierResponse {
  reply: string;
  isFinal: boolean;
  collectedPreferences: Record<string, any>;
  recommendations: AiSommelierProductMatch[];
  quickChips: string[];
}
