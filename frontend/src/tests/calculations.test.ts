import { describe, it, expect } from 'vitest';

describe('Fragrance Commerce & Olfactory Calculations', () => {
  it('calculates price per milliliter accurately', () => {
    const calculatePricePerMl = (price: number, sizeMl: number) => {
      if (sizeMl <= 0) return 0;
      return Math.round(price / sizeMl);
    };

    expect(calculatePricePerMl(2490, 30)).toBe(83); // 2490 / 30 = 83
    expect(calculatePricePerMl(3490, 50)).toBe(70); // 3490 / 50 = 69.8 => 70
    expect(calculatePricePerMl(5490, 100)).toBe(55); // 5490 / 100 = 54.9 => 55
  });

  it('determines free express shipping threshold properly', () => {
    const getShippingFee = (subtotal: number, isExpress = false) => {
      if (isExpress) return 250;
      return subtotal >= 2000 ? 0 : 150;
    };

    expect(getShippingFee(1800)).toBe(150);
    expect(getShippingFee(2000)).toBe(0);
    expect(getShippingFee(3490)).toBe(0);
    expect(getShippingFee(3490, true)).toBe(250);
  });

  it('applies percentage and fixed coupons correctly', () => {
    const applyDiscount = (subtotal: number, coupon: { type: 'percentage' | 'fixed'; value: number }) => {
      if (coupon.type === 'percentage') {
        return Math.round((subtotal * coupon.value) / 100);
      }
      return Math.min(coupon.value, subtotal);
    };

    // VIBE10 (10% off)
    expect(applyDiscount(3490, { type: 'percentage', value: 10 })).toBe(349);
    // LUXE500 (₹500 fixed)
    expect(applyDiscount(4500, { type: 'fixed', value: 500 })).toBe(500);
  });

  it('calculates review distribution percentages accurately', () => {
    const reviews = [
      { rating: 5 }, { rating: 5 }, { rating: 5 },
      { rating: 4 }, { rating: 4 },
      { rating: 3 }
    ];

    const total = reviews.length; // 6
    const fiveStarPct = Math.round((reviews.filter(r => r.rating === 5).length / total) * 100);
    const fourStarPct = Math.round((reviews.filter(r => r.rating === 4).length / total) * 100);
    const threeStarPct = Math.round((reviews.filter(r => r.rating === 3).length / total) * 100);

    expect(fiveStarPct).toBe(50); // 3/6 = 50%
    expect(fourStarPct).toBe(33); // 2/6 = 33%
    expect(threeStarPct).toBe(17); // 1/6 = 17%
  });

  it('handles edge cases in price per ml safely without dividing by zero or NaN', () => {
    const calculatePricePerMl = (price: number, sizeMl: number) => {
      if (!sizeMl || sizeMl <= 0 || isNaN(sizeMl) || isNaN(price)) return 0;
      return Math.round(price / sizeMl);
    };

    expect(calculatePricePerMl(3000, 0)).toBe(0);
    expect(calculatePricePerMl(3000, -50)).toBe(0);
    expect(calculatePricePerMl(0, 100)).toBe(0);
  });

  it('bounds scent match percentage correctly between 45% and 99%', () => {
    const calculateMatchPct = (score: number) => {
      return Math.min(99, Math.max(45, Math.round((score / 100) * 100)));
    };

    expect(calculateMatchPct(120)).toBe(99); // capped at 99
    expect(calculateMatchPct(15)).toBe(45);  // floored at 45
    expect(calculateMatchPct(85)).toBe(85);
  });

  it('calculates amount remaining for free shipping threshold', () => {
    const getAmountToFreeShipping = (subtotal: number, threshold = 2000) => {
      return Math.max(0, threshold - subtotal);
    };

    expect(getAmountToFreeShipping(1200)).toBe(800);
    expect(getAmountToFreeShipping(1999)).toBe(1);
    expect(getAmountToFreeShipping(2000)).toBe(0);
    expect(getAmountToFreeShipping(3500)).toBe(0);
  });
});
