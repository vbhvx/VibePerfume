import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { fetchOrderByNumber } from '../api/products';
import type { Order } from '../types';
import './OrderConfirmation.css';

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderNumber) return;
      try {
        setLoading(true);
        const res = await fetchOrderByNumber(orderNumber);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container order-conf-page" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <Sparkles size={36} style={{ color: 'var(--gold-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving your order ledger snapshot...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container order-conf-page" style={{ textAlign: 'center', padding: '8rem 0' }}>
        <h2>Order Snapshot Unavailable</h2>
        <p>Could not find reference for order {orderNumber}.</p>
        <Link to="/collections" className="btn-gold" style={{ marginTop: '1.5rem' }}>
          Back to Storefront
        </Link>
      </div>
    );
  }

  const steps = [
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Curating' },
    { id: 'shipped', label: 'Dispatched' },
    { id: 'delivered', label: 'Delivered' }
  ];

  const currentIdx = steps.findIndex(s => s.id === order.orderStatus);

  return (
    <div className="order-conf-page">
      <div className="container">
        <div className="order-conf-box">
          <div className="order-conf-header">
            <div className="conf-icon-circle">
              <Check size={32} />
            </div>
            <span className="section-eyebrow">Order Placed & Verified</span>
            <h1>Thank You for Exploring Scent With Us</h1>
            <div className="order-num-tag">{order.orderNumber}</div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.88rem' }}>
              Confirmation sent to <strong>{order.customerEmail}</strong>
            </p>
          </div>

          {/* Fulfillment Status Timeline */}
          <div className="order-timeline-wrap">
            <div className="timeline-steps-row">
              {steps.map((st, idx) => {
                const isCompleted = idx <= (currentIdx >= 0 ? currentIdx : 0);
                return (
                  <div key={st.id} className={`timeline-step-node ${isCompleted ? 'completed' : ''}`}>
                    <div className="node-circle">
                      {isCompleted ? <Check size={14} /> : idx + 1}
                    </div>
                    <span>{st.label}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gold-light)' }}>
              Status: <strong>{order.orderStatus.toUpperCase()}</strong> • Standard temperature-controlled dispatch
            </div>
          </div>

          {/* Risk-Free Tester Reminder */}
          <div style={{ padding: '1rem', background: 'rgba(212, 175, 55, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--gold-border)', marginBottom: '2rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Sparkles size={20} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-primary)' }}>
              Remember: Your package contains a <strong>complimentary 2ml tester vial</strong>. Please test the sample on skin first before opening the sealed master bottle.
            </p>
          </div>

          {/* Ordered Line Items Snapshot */}
          <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Formulations in this Order</h4>
          <table className="order-snapshot-table">
            <tbody>
              {order.items.map(item => (
                <tr key={item.variantId}>
                  <td style={{ width: '60px' }}>
                    <img src={item.imageUrl} alt={item.productName} style={{ width: '48px', height: '56px', objectFit: 'cover', borderRadius: '4px', background: '#111' }} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.sizeMl}ml • {item.concentration} • Qty: {item.quantity}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#fff' }}>
                    ₹{item.lineTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ color: 'var(--text-muted)', paddingTop: '1.2rem' }}>Total Paid ({order.paymentMethod})</td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', color: 'var(--gold-light)', paddingTop: '1.2rem' }}>
                  ₹{order.total.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Delivery Address */}
          <div style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-light)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Shipping Destination
            </span>
            <div style={{ fontSize: '0.88rem', color: '#fff' }}>{order.shippingAddress.fullName}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            </div>
          </div>

          <div className="order-conf-actions">
            <Link to="/track-order" className="btn-outline">
              Live Order Tracker
            </Link>
            <Link to="/collections" className="btn-gold">
              Continue Scent Browsing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
