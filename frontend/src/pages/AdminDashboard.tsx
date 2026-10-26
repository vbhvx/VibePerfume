import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  fetchAdminMetrics, 
  fetchAdminOrders, 
  updateOrderStatus, 
  fetchAdminReviews, 
  moderateReview, 
  adjustStock, 
  fetchProducts 
} from '../api/products';
import type { Order, Product, Review } from '../types';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'reviews'>('catalog');

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingReviews: 0,
    lowStockVariants: 0,
    averageOrderValue: 0
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Stock Adjust Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [stockDelta, setStockDelta] = useState(10);
  const [stockReason, setStockReason] = useState('New Atelier Batch Inward');

  const loadAllAdminData = async () => {
    try {
      const [metRes, prodRes, ordRes, revRes] = await Promise.all([
        fetchAdminMetrics(),
        fetchProducts(),
        fetchAdminOrders(),
        fetchAdminReviews()
      ]);

      if (metRes.success && metRes.data) setMetrics(metRes.data);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data);
      if (revRes.success && revRes.data) setReviews(revRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve atelier administration data.');
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus, `Staff advanced status to ${newStatus}`);
      if (res.success) {
        toast.success(`Order updated to ${newStatus}`);
        loadAllAdminData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleReviewAction = async (revId: string, modStatus: string, verStatus?: string) => {
    try {
      const res = await moderateReview(revId, modStatus, verStatus);
      if (res.success) {
        toast.success(`Review ${modStatus}`);
        loadAllAdminData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update review moderation');
    }
  };

  const handleApplyStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) return;

    try {
      const res = await adjustStock(selectedVariantId, Number(stockDelta), stockReason);
      if (res.success) {
        toast.success('Inventory balance updated in authoritative ledger.');
        setStockModalOpen(false);
        loadAllAdminData();
      }
    } catch (err: any) {
      toast.error('Failed to update inventory balance.');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header-flex">
          <div>
            <span className="section-eyebrow">Atelier Staff Administration</span>
            <h1 style={{ fontSize: '2.6rem', marginBottom: '0.4rem' }}>Commerce Control Center</h1>
            <p>Authoritative catalog maintenance, real-time inventory balances, and order fulfillment.</p>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <span className="metric-card-label">Total Realized Revenue</span>
            <div className="metric-card-val">₹{metrics.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <span className="metric-card-label">Total Orders Placed</span>
            <div className="metric-card-val">{metrics.totalOrders}</div>
          </div>
          <div className="metric-card">
            <span className="metric-card-label">Active Formulations</span>
            <div className="metric-card-val">{metrics.activeProducts}</div>
          </div>
          <div className="metric-card">
            <span className="metric-card-label">Average Order Value</span>
            <div className="metric-card-val">₹{metrics.averageOrderValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-row">
          <button 
            className={`admin-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Package size={17} /> Catalog & Inventory ({products.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={17} /> Customer Orders ({orders.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={17} /> Review Moderation Queue ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Catalog & Inventory Management */}
        {activeTab === 'catalog' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Atelier / Brand</th>
                  <th>Family</th>
                  <th>Starting Price</th>
                  <th>Sellable Variants & Stock Balances</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src={p.mainImageUrl} alt={p.name} style={{ width: '42px', height: '50px', objectFit: 'cover', borderRadius: '4px', background: '#111' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating: {p.rating} ★</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.brandName}</td>
                    <td><span className="badge-family">{p.fragranceFamily}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{Math.min(...(p.variants || []).map(v => v.price)).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(p.variants || []).map(v => (
                          <button
                            key={v.id}
                            className="btn-admin-action"
                            style={{ fontSize: '0.75rem', borderColor: v.stockQuantity <= 5 ? 'var(--warning)' : 'inherit' }}
                            onClick={() => {
                              setSelectedVariantId(v.id);
                              setStockModalOpen(true);
                            }}
                            title="Click to adjust stock"
                          >
                            {v.sizeMl}ml: <strong>{v.stockQuantity} in stock</strong>
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn-admin-action"
                        onClick={() => {
                          if (p.variants && p.variants[0]) {
                            setSelectedVariantId(p.variants[0].id);
                            setStockModalOpen(true);
                          }
                        }}
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Customer Orders Management */}
        {activeTab === 'orders' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Payable Total</th>
                  <th>Fulfillment Status</th>
                  <th>Advance Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id}>
                    <td>
                      <strong>{ord.orderNumber}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.items?.length || 0} items</div>
                    </td>
                    <td>
                      <div>{ord.shippingAddress?.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customerEmail}</div>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--gold-light)' }}>₹{ord.total?.toLocaleString()}</td>
                    <td>
                      <span className={`track-status-pill ${ord.orderStatus}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {ord.orderStatus === 'confirmed' && (
                          <button 
                            className="btn-admin-action"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'processing')}
                          >
                            Mark Processing
                          </button>
                        )}
                        {ord.orderStatus === 'processing' && (
                          <button 
                            className="btn-admin-action"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'shipped')}
                          >
                            Mark Shipped
                          </button>
                        )}
                        {ord.orderStatus === 'shipped' && (
                          <button 
                            className="btn-admin-action"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {ord.orderStatus !== 'cancelled' && ord.orderStatus !== 'delivered' && (
                          <button 
                            className="btn-admin-action"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Review Moderation */}
        {activeTab === 'reviews' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Headline & Comments</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(rev => (
                  <tr key={rev.id || rev._id}>
                    <td>
                      <strong>{rev.reviewerName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--gold-primary)' }}>
                        {rev.rating} ★
                      </div>
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      {rev.title && <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{rev.title}</div>}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {rev.body || rev.comment}
                      </p>
                    </td>
                    <td>
                      <span className={rev.verificationStatus === 'verified_purchase' ? 'badge-verified-buyer' : 'badge-family'}>
                        {rev.verificationStatus === 'verified_purchase' ? 'Verified Buyer' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: rev.moderationStatus === 'published' ? '#34d399' : 'var(--warning)' }}>
                        {rev.moderationStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {rev.moderationStatus !== 'published' && (
                          <button 
                            className="btn-admin-action"
                            onClick={() => handleReviewAction(rev.id || rev._id!, 'published')}
                          >
                            Approve
                          </button>
                        )}
                        {rev.moderationStatus !== 'rejected' && (
                          <button 
                            className="btn-admin-action"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleReviewAction(rev.id || rev._id!, 'rejected')}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {stockModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setStockModalOpen(false)}>
          <div className="search-modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="search-input-wrapper" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Adjust Variant Inventory</h3>
              <button className="search-close-btn" onClick={() => setStockModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyStockAdjust} style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Target Variant ID
                </label>
                <input 
                  type="text" 
                  value={selectedVariantId} 
                  onChange={e => setSelectedVariantId(e.target.value)}
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Stock Quantity Adjustment (+ / -)
                </label>
                <input 
                  type="number" 
                  value={stockDelta} 
                  onChange={e => setStockDelta(Number(e.target.value))}
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Audit Reason / Document Reference
                </label>
                <input 
                  type="text" 
                  value={stockReason} 
                  onChange={e => setStockReason(e.target.value)}
                  placeholder="e.g. Grasse Atelier Batch Inward #981"
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: '0.5rem' }}>
                Commit Inventory Balance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
