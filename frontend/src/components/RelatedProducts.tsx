import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { fetchProducts } from '../api/products';
import ProductCard from './ProductCard';
import './RelatedProducts.css';

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

export const RelatedProducts = ({ category, currentProductId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const response = await fetchProducts({ family: category });
        if (response.success && response.data) {
          const filtered = response.data
            .filter(p => (p.id || p._id) !== currentProductId)
            .slice(0, 4);
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load related products');
      }
    };
    loadRelated();
  }, [category, currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="related-products">
      <h3>Harmonic Kinship</h3>
      <div className="related-grid">
        {products.map(p => (
          <ProductCard key={p.id || p._id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
