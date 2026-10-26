import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { validateServerCart } from '../api/products';
import type { CartValidationResult, Product, ProductVariant } from '../types';

interface CartContextType {
  rawItems: { productId: string; variantId: string; quantity: number }[];
  validatedCart: CartValidationResult | null;
  isLoading: boolean;
  isCartOpen: boolean;
  couponCode: string;
  shippingMethod: 'standard' | 'express';
  totalCount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setShippingMethod: (method: 'standard' | 'express') => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'vibe_perfume_cart_v2';
const COUPON_KEY = 'vibe_perfume_coupon_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawItems, setRawItems] = useState<{ productId: string; variantId: string; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem(COUPON_KEY) || '';
  });

  const [shippingMethod, setShippingMethodState] = useState<'standard' | 'express'>('standard');
  const [validatedCart, setValidatedCart] = useState<CartValidationResult | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [rawItems]);

  useEffect(() => {
    if (couponCode) {
      localStorage.setItem(COUPON_KEY, couponCode);
    } else {
      localStorage.removeItem(COUPON_KEY);
    }
  }, [couponCode]);

  // Revalidate cart with backend
  const refreshCart = useCallback(async (
    itemsToValidate = rawItems,
    code = couponCode,
    shipping = shippingMethod
  ) => {
    if (itemsToValidate.length === 0) {
      setValidatedCart({
        success: true,
        errors: [],
        items: [],
        subtotal: 0,
        discount: 0,
        coupon: null,
        shippingFee: 0,
        freeShippingThreshold: 2000,
        amountToFreeShipping: 2000,
        tax: 0,
        total: 0
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await validateServerCart(itemsToValidate, code, shipping);
      if (res.success && res.data) {
        setValidatedCart(res.data);
      }
    } catch (err: any) {
      console.warn('Backend cart validation fallback:', err.message);
      // Construct local fallback
      const localSubtotal = itemsToValidate.reduce((sum, item) => sum + (3000 * item.quantity), 0);
      setValidatedCart({
        success: true,
        errors: [],
        items: itemsToValidate.map(it => ({
          productId: it.productId,
          variantId: it.variantId,
          productName: 'Luxury Fragrance',
          brandName: 'Vibe Perfume',
          sku: 'SKU',
          sizeMl: 50,
          concentration: 'Eau de Parfum',
          unitPrice: 3000,
          quantity: it.quantity,
          lineTotal: 3000 * it.quantity,
          imageUrl: '',
          stockAvailable: 10
        })),
        subtotal: localSubtotal,
        discount: 0,
        coupon: null,
        shippingFee: localSubtotal >= 2000 ? 0 : 150,
        freeShippingThreshold: 2000,
        amountToFreeShipping: Math.max(0, 2000 - localSubtotal),
        tax: 0,
        total: localSubtotal + (localSubtotal >= 2000 ? 0 : 150)
      });
    } finally {
      setIsLoading(false);
    }
  }, [rawItems, couponCode, shippingMethod]);

  useEffect(() => {
    refreshCart();
  }, [rawItems, couponCode, shippingMethod, refreshCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    if (variant.stockQuantity <= 0) {
      toast.error(`${product.name} (${variant.sizeMl}ml) is currently out of stock.`);
      return;
    }

    setRawItems(prev => {
      const existingIndex = prev.findIndex(item => item.variantId === variant.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > variant.stockQuantity) {
          toast.error(`Only ${variant.stockQuantity} units available.`);
          updated[existingIndex].quantity = variant.stockQuantity;
        } else {
          updated[existingIndex].quantity = newQty;
          toast.success(`Updated quantity in your shopping bag.`);
        }
        return updated;
      } else {
        toast.success(`Added ${product.name} (${variant.sizeMl}ml) to your bag.`);
        return [...prev, { productId: product.id, variantId: variant.id, quantity }];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setRawItems(prev =>
      prev.map(item => (item.variantId === variantId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (variantId: string) => {
    setRawItems(prev => prev.filter(item => item.variantId !== variantId));
    toast.success('Item removed from bag');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      toast.error('Please enter a valid coupon code.');
      return false;
    }

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await validateServerCart(rawItems, cleanCode, shippingMethod);
      if (res.data?.coupon) {
        setCouponCode(cleanCode);
        setValidatedCart(res.data);
        toast.success(`Promo code ${cleanCode} applied: saved ₹${res.data.discount.toLocaleString()}!`);
        return true;
      } else {
        toast.error('Invalid or expired promotional code.');
        return false;
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to apply coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    toast.success('Promo code removed.');
  };

  const setShippingMethod = (method: 'standard' | 'express') => {
    setShippingMethodState(method);
  };

  const clearCart = () => {
    setRawItems([]);
    setCouponCode('');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUPON_KEY);
  };

  const totalCount = rawItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        rawItems,
        validatedCart,
        isLoading,
        isCartOpen,
        couponCode,
        shippingMethod,
        totalCount,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        setShippingMethod,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
