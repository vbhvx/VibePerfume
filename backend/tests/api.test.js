import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../server.js';
import { db } from '../data/db.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    // Start on port 5051 for test
    server = app.listen(5051, () => {
      baseUrl = 'http://localhost:5051';
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('VibePerfume API Endpoints', () => {
  test('GET /api/products returns all active products with variants and notes', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length >= 8);
    const prod = json.data[0];
    assert.ok(prod.name);
    assert.ok(prod.variants.length > 0);
    assert.ok(prod.notes.top.length > 0);
  });

  test('GET /api/products?family=woody filters correctly', async () => {
    const res = await fetch(`${baseUrl}/api/products?family=woody`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(json.data.length > 0);
    assert.ok(json.data.every(p => p.fragranceFamily.toLowerCase() === 'woody' || p.secondaryFamilies?.some(f => f.toLowerCase() === 'woody')));
  });

  test('GET /api/discovery/brands returns luxury brands', async () => {
    const res = await fetch(`${baseUrl}/api/discovery/brands`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(json.data.length >= 5);
  });

  test('POST /api/discovery/scent-finder provides weighted recommendations with reasons', async () => {
    const res = await fetch(`${baseUrl}/api/discovery/scent-finder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family: 'Woody',
        preferredNotes: ['Oud', 'Sandalwood'],
        intensity: 'Intense',
        occasion: 'Evening',
        maxBudget: 6000
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(json.data.length > 0);
    const topMatch = json.data[0];
    assert.ok(topMatch.matchPercentage >= 70);
    assert.ok(topMatch.matchReasons.length > 0);
  });

  test('POST /api/discovery/ai-sommelier provides conversational scent consultation', async () => {
    const res = await fetch(`${baseUrl}/api/discovery/ai-sommelier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want a woody oud perfume for an evening gala that lasts all night',
        conversationHistory: []
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.reply.length > 0);
    assert.ok(json.data.recommendations.length > 0);
    assert.ok(json.data.recommendations[0].matchPercentage >= 75);
  });

  test('POST /api/commerce/cart/validate calculates authoritative totals & free shipping', async () => {
    const products = db.getProducts();
    const p1 = products[0];
    const v1 = p1.variants[0];

    const res = await fetch(`${baseUrl}/api/commerce/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: p1.id, variantId: v1.id, quantity: 1 }],
        couponCode: 'VIBE10'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.data.subtotal, v1.price);
    assert.strictEqual(json.data.discount, Math.round(v1.price * 0.1));
    assert.strictEqual(json.data.total, v1.price - json.data.discount + json.data.shippingFee);
  });

  test('POST /api/commerce/checkout/orders creates order and decrements inventory', async () => {
    const products = db.getProducts();
    const p1 = products[0];
    const v1 = p1.variants[0];
    const initialStock = v1.stockQuantity;

    const res = await fetch(`${baseUrl}/api/commerce/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: 'test.buyer@example.com',
        customerPhone: '+91 99999 88888',
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '42 Jasmine Lane',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        },
        items: [{ productId: p1.id, variantId: v1.id, quantity: 1 }],
        paymentMethod: 'Credit Card'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.ok(json.data.orderNumber.startsWith('VP-2026-'));
    assert.strictEqual(json.data.orderStatus, 'confirmed');

    // Verify stock decremented
    const freshP1 = db.getProductById(p1.id);
    const freshV1 = freshP1.variants.find(v => v.id === v1.id);
    assert.strictEqual(freshV1.stockQuantity, initialStock - 1);
  });

  test('GET /api/commerce/coupons/validate rejects invalid or below minimum coupons', async () => {
    // 1. Invalid code
    const resInvalid = await fetch(`${baseUrl}/api/commerce/coupons/validate?code=NONEXISTENT&subtotal=5000`);
    assert.strictEqual(resInvalid.status, 400);
    const jsonInvalid = await resInvalid.json();
    assert.strictEqual(jsonInvalid.success, false);
    assert.match(jsonInvalid.message, /invalid/i);

    // 2. Below minimum spend (LUXE500 requires ₹5000)
    const resLow = await fetch(`${baseUrl}/api/commerce/coupons/validate?code=LUXE500&subtotal=1000`);
    assert.strictEqual(resLow.status, 400);
    const jsonLow = await resLow.json();
    assert.strictEqual(jsonLow.success, false);
    assert.match(jsonLow.message, /minimum order/i);
  });

  test('POST /api/products/:id/reviews validates input and returns 400 on invalid data', async () => {
    const products = db.getProducts();
    const targetProd = products[0];

    // Missing comment & invalid rating (rating = 10)
    const res = await fetch(`${baseUrl}/api/products/${targetProd.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewerName: 'A',
        rating: 10,
        comment: ''
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(json.success, false);
    assert.ok(json.errors.length >= 2);
  });

  test('POST /api/commerce/orders/:orderNumber/cancel cancels order and restocks inventory', async () => {
    const products = db.getProducts();
    const p1 = products[0];
    const v1 = p1.variants[0];
    const preOrderStock = v1.stockQuantity;

    // Place an order first
    const orderRes = await fetch(`${baseUrl}/api/commerce/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: 'cancel.test@example.com',
        shippingAddress: {
          fullName: 'Cancel Test',
          addressLine1: '10 King Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        },
        items: [{ productId: p1.id, variantId: v1.id, quantity: 2 }]
      })
    });
    const orderJson = await orderRes.json();
    assert.strictEqual(orderRes.status, 201);
    const orderNumber = orderJson.data.orderNumber;

    // Verify stock dropped by 2
    const midStock = db.getProductById(p1.id).variants.find(v => v.id === v1.id).stockQuantity;
    assert.strictEqual(midStock, preOrderStock - 2);

    // Cancel order
    const cancelRes = await fetch(`${baseUrl}/api/commerce/orders/${orderNumber}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Changed mind before dispatch' })
    });
    const cancelJson = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelJson.success, true);
    assert.strictEqual(cancelJson.data.orderStatus, 'cancelled');

    // Verify stock is restored
    const finalStock = db.getProductById(p1.id).variants.find(v => v.id === v1.id).stockQuantity;
    assert.strictEqual(finalStock, preOrderStock);
  });

  test('PATCH /api/admin/orders/:id/status updates status with audit note', async () => {
    const orders = db.getAllOrders();
    assert.ok(orders.length > 0);
    const targetOrder = orders[0];

    const res = await fetch(`${baseUrl}/api/admin/orders/${targetOrder.orderNumber}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped', note: 'Dispatched via BlueDart Express Air' })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.data.orderStatus, 'shipped');
    assert.ok(json.data.timeline.some(t => t.message.includes('BlueDart')));
  });

  test('PATCH /api/admin/inventory adjusts variant stock quantity and logs delta', async () => {
    const products = db.getProducts();
    const p1 = products[0];
    const v1 = p1.variants[0];
    const currentStock = v1.stockQuantity;

    const res = await fetch(`${baseUrl}/api/admin/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variantId: v1.id,
        quantityDelta: 5,
        reason: 'Laboratory replenishment batch arrival'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.data.stockQuantity, currentStock + 5);
  });

  test('GET /api/products/:id returns 404 for unknown product id', async () => {
    const res = await fetch(`${baseUrl}/api/products/unknown-perfume-xyz-999`);
    assert.strictEqual(res.status, 404);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });
});
