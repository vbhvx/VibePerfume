import React, { useState } from 'react';
import { Search, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchOrderByNumber, cancelOrder } from '../api/products';
import type { Order } from '../types';
import './TrackOrder.css';

export const TrackOrder: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order reference number.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchOrderByNumber(orderNumber.trim(), email.trim() || undefined);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error('Order reference not found.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not find order. Please verify details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirmCancel = window.confirm(`Are you sure you want to cancel Order ${order.orderNumber}?`);
    if (!confirmCancel) return;

    try {
      setCancelling(true);
      const res = await cancelOrder(order.orderNumber, 'Requested by customer via tracking page');
      if (res.success && res.data) {
        setOrder(res.data);
        toast.success('Order has been cancelled and inventory restocked.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="track-page">
      <div className="container">
        <div className="track-box">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-eyebrow">Shipment Transparency</span>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>Track Your Fragrance</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter your Order ID (e.g. <code>VP-2026-98102</code>) to view real-time fulfillment status.
            </p>
          </div>

          <form onSubmit={handleTrack} className="track-form-row">
            <input 
              type="text" 
              className="track-input"
              placeholder="Order Number (e.g. VP-2026-98102)"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              required
            />
            <input 
              type="email" 
              className="track-input"
              placeholder="Email address (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className="btn-gold" disabled={loading}>
              <Search size={16} /> {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {order && (
            <div className="track-result-details">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Order {order.orderNumber}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Recipient: {order.shippingAddress.fullName} • Placed {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`track-status-pill ${order.orderStatus}`}>
                  {order.orderStatus}
                </span>
              </div>

              {/* Timeline Feed */}
              <div className="timeline-feed">
                {(order.timeline || []).map((step, idx) => (
                  <div key={idx} className="feed-item">
                    <div className="feed-msg">{step.message}</div>
                    <div className="feed-time">{new Date(step.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Items Summary */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-light)', fontWeight: 600 }}>
                  Items in Shipment:
                </span>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {order.items.map(it => (
                    <div key={it.variantId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span>{it.quantity}x {it.productName} ({it.sizeMl}ml)</span>
                      <span style={{ fontWeight: 600 }}>₹{it.lineTotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: 'var(--gold-light)' }}>₹{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Cancellation Option (if confirmed or processing) */}
              {['confirmed', 'processing'].includes(order.orderStatus) && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button 
                    className="btn-outline" 
                    style={{ borderColor: 'rgba(248, 113, 113, 0.4)', color: 'var(--danger)' }}
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    <Ban size={15} /> {cancelling ? 'Cancelling...' : 'Cancel Order & Restock Inventory'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
