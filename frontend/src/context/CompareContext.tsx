import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { Product } from '../types';

interface CompareContextType {
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const STORAGE_KEY = 'vibe_perfume_compare_v2';

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareProducts, setCompareProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareProducts));
    } catch (e) {
      console.error('Failed to sync compare items:', e);
    }
  }, [compareProducts]);

  const addToCompare = (product: Product) => {
    setCompareProducts(prev => {
      if (prev.some(p => p.id === product.id)) {
        toast(`${product.name} is already in comparison.`);
        return prev;
      }
      if (prev.length >= 4) {
        toast.error('You can compare a maximum of 4 fragrances simultaneously.');
        return prev;
      }
      toast.success(`Added ${product.name} to fragrance comparison (${prev.length + 1}/4).`);
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Removed fragrance from comparison.');
  };

  const isInCompare = (productId: string) => {
    return compareProducts.some(p => p.id === productId);
  };

  const clearCompare = () => {
    setCompareProducts([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Comparison matrix cleared.');
  };

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        compareCount: compareProducts.length
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
