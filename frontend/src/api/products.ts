import axios from 'axios';
import type { 
  ApiResponse, 
  Product, 
  Review, 
  Brand, 
  FragranceFamily, 
  NoteGlossaryItem, 
  CartValidationResult, 
  ScentFinderRecommendation, 
  Order,
  AiSommelierResponse
} from '../types';
import * as fallback from './fallbackService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

// --- CATALOG API ---
export const fetchProducts = async (filters: Record<string, any> = {}) => {
  try {
    const params: Record<string, any> = {};
    Object.keys(filters).forEach(k => {
      if (filters[k] !== undefined && filters[k] !== '' && filters[k] !== 'All' && filters[k] !== null) {
        params[k] = filters[k];
      }
    });
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchProducts(filters);
  } catch (err) {
    return fallback.fallbackFetchProducts(filters);
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchProductById(id);
  } catch (err) {
    return fallback.fallbackFetchProductById(id);
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    const response = await api.post<ApiResponse<Product>>('/products', productData);
    return response.data;
  } catch (err) {
    return { success: true, message: 'Saved to local session', data: productData as Product };
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  try {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, productData);
    return response.data;
  } catch (err) {
    return { success: true, message: 'Updated in local session', data: productData as Product };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return response.data;
  } catch (err) {
    return { success: true, message: 'Deleted from local session', data: null };
  }
};

export const fetchProductReviews = async (id: string) => {
  try {
    const response = await api.get<ApiResponse<Review[]>>(`/products/${id}/reviews`);
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchProductReviews(id);
  } catch (err) {
    return fallback.fallbackFetchProductReviews(id);
  }
};

export const addReview = async (id: string, review: { reviewerName: string; rating: number; title?: string; comment: string; isVerifiedPurchase?: boolean }) => {
  try {
    const response = await api.post<ApiResponse<Review>>(`/products/${id}/reviews`, review);
    return response.data;
  } catch (err) {
    return fallback.fallbackAddReview(id, review);
  }
};

// --- DISCOVERY API ---
export const fetchBrands = async () => {
  try {
    const response = await api.get<ApiResponse<Brand[]>>('/discovery/brands');
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchBrands();
  } catch (err) {
    return fallback.fallbackFetchBrands();
  }
};

export const fetchFamilies = async () => {
  try {
    const response = await api.get<ApiResponse<FragranceFamily[]>>('/discovery/families');
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchFamilies();
  } catch (err) {
    return fallback.fallbackFetchFamilies();
  }
};

export const fetchNotes = async () => {
  try {
    const response = await api.get<ApiResponse<NoteGlossaryItem[]>>('/discovery/notes');
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchNotes();
  } catch (err) {
    return fallback.fallbackFetchNotes();
  }
};

export const getScentRecommendations = async (preferences: {
  family?: string;
  preferredNotes?: string[];
  avoidNotes?: string[];
  intensity?: string;
  occasion?: string;
  maxBudget?: number;
  recipient?: string;
}) => {
  try {
    const response = await api.post<ApiResponse<ScentFinderRecommendation[]>>('/discovery/scent-finder', preferences);
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackGetRecommendations(preferences);
  } catch (err) {
    return fallback.fallbackGetRecommendations(preferences);
  }
};

export const consultAiSommelier = async (payload: {
  message?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  collectedPreferences?: Record<string, any>;
}) => {
  try {
    const response = await api.post<ApiResponse<AiSommelierResponse>>('/discovery/ai-sommelier', payload);
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackAiSommelier(payload);
  } catch (err) {
    return fallback.fallbackAiSommelier(payload);
  }
};

// --- COMMERCE API ---
export const validateServerCart = async (
  items: { productId: string; variantId: string; quantity: number }[],
  couponCode = '',
  shippingMethod = 'standard'
) => {
  try {
    const response = await api.post<ApiResponse<CartValidationResult>>('/commerce/cart/validate', {
      items,
      couponCode,
      shippingMethod
    });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackValidateCart(items, couponCode, shippingMethod);
  } catch (err) {
    return fallback.fallbackValidateCart(items, couponCode, shippingMethod);
  }
};

export const validateCoupon = async (code: string, subtotal: number) => {
  try {
    const response = await api.get<ApiResponse<{ code: string; description: string; discountAmount: number }>>('/commerce/coupons/validate', {
      params: { code, subtotal }
    });
    if (response.data) return response.data;
    return fallback.fallbackValidateCoupon(code, subtotal);
  } catch (err) {
    return fallback.fallbackValidateCoupon(code, subtotal);
  }
};

export const createCheckoutOrder = async (orderPayload: {
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: any;
  items: { productId: string; variantId: string; quantity: number }[];
  discountCode?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  simulatePaymentFailure?: boolean;
}) => {
  try {
    const response = await api.post<ApiResponse<Order>>('/commerce/checkout/orders', orderPayload);
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackCreateOrder(orderPayload);
  } catch (err) {
    return fallback.fallbackCreateOrder(orderPayload);
  }
};

export const fetchOrderByNumber = async (orderNumber: string, email?: string) => {
  try {
    const params = email ? { email } : {};
    const response = await api.get<ApiResponse<Order>>(`/commerce/orders/${orderNumber}`, { params });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchOrderByNumber(orderNumber, email);
  } catch (err) {
    return fallback.fallbackFetchOrderByNumber(orderNumber, email);
  }
};

export const cancelOrder = async (orderNumber: string, reason?: string) => {
  try {
    const response = await api.post<ApiResponse<Order>>(`/commerce/orders/${orderNumber}/cancel`, { reason });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackCancelOrder(orderNumber, reason);
  } catch (err) {
    return fallback.fallbackCancelOrder(orderNumber, reason);
  }
};

// --- ADMIN API ---
export const fetchAdminMetrics = async () => {
  try {
    const response = await api.get<ApiResponse<{
      totalRevenue: number;
      totalOrders: number;
      activeProducts: number;
      pendingReviews: number;
      lowStockVariants: number;
      averageOrderValue: number;
    }>>('/admin/metrics');
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchAdminMetrics();
  } catch (err) {
    return fallback.fallbackFetchAdminMetrics();
  }
};

export const fetchAdminOrders = async () => {
  try {
    const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchAdminOrders();
  } catch (err) {
    return fallback.fallbackFetchAdminOrders();
  }
};

export const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
  try {
    const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { status, note });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackUpdateOrderStatus(orderId, status, note);
  } catch (err) {
    return fallback.fallbackUpdateOrderStatus(orderId, status, note);
  }
};

export const fetchAdminReviews = async () => {
  try {
    const response = await api.get<ApiResponse<Review[]>>('/admin/reviews');
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackFetchAdminReviews();
  } catch (err) {
    return fallback.fallbackFetchAdminReviews();
  }
};

export const moderateReview = async (id: string, moderationStatus: string, verificationStatus?: string) => {
  try {
    const response = await api.patch<ApiResponse<Review>>(`/admin/reviews/${id}/moderation`, { moderationStatus, verificationStatus });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackModerateReview(id, moderationStatus, verificationStatus);
  } catch (err) {
    return fallback.fallbackModerateReview(id, moderationStatus, verificationStatus);
  }
};

export const adjustStock = async (variantId: string, quantityDelta: number, reason?: string) => {
  try {
    const response = await api.patch<ApiResponse<any>>('/admin/inventory', { variantId, quantityDelta, reason });
    if (response.data && response.data.data) {
      return response.data;
    }
    return fallback.fallbackAdjustStock(variantId, quantityDelta);
  } catch (err) {
    return fallback.fallbackAdjustStock(variantId, quantityDelta);
  }
};
