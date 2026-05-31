import React, { useState } from 'react';
import { db } from '../services/db';
import { Eye, CheckCircle, Truck, PackageCheck, Calendar, MapPin, Receipt, X } from 'lucide-react';

export default function AdminOrders({ orders, onRefresh }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    db.updateOrderStatus(id, newStatus);
    onRefresh();
    // Keep overlay in sync if open
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(prev => ({
        ...prev,
        status: newStatus
      }));
    }
  };

  const getStatusLed = (status) => {
    if (status === 'Pending') return 'yellow';
    if (status === 'Confirmed') return 'green';
    if (status === 'Shipped') return 'blue';
    return 'green';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>
        CUSTOMER ORDERS
      </h3>

      {/* Orders Table Panel */}
      <div className="skeuo-outset" style={{ overflowX: 'auto', backgroundColor: '#eef2f7', borderRadius: 'var(--border-radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '2px dashed rgba(0,0,0,0.1)' }}>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ORDER ID</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ORDER DATE</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CUSTOMER</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TOTAL PRICE</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ORDER STATUS</th>
              <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {/* ID with digital look */}
                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px' }}>
                  {order.id}
                </td>
                
                <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {new Date(order.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{order.customer.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{order.customer.email}</span>
                  </div>
                </td>

                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}>
                  ₹{order.total.toFixed(2)}
                </td>

                {/* Status dial changer */}
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Glowing LED indicating state */}
                    <div className={`led-indicator ${getStatusLed(order.status)}`}></div>
                    
                    <div className="skeuo-inset-sm" style={{ padding: '2px 4px', backgroundColor: '#e6edf7' }}>
                      <select
                        id={`status-select-${order.id}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </td>

                {/* Action quick view */}
                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                  <button
                    id={`view-order-btn-${order.id}`}
                    onClick={() => setSelectedOrder(order)}
                    className="tactile-button"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                    title="Inspect Order Details"
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic invoice details popup (Skeuomorphic Ledger Overlay) */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(30,37,48,0.4)',
          backdropFilter: 'blur(5px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div 
            className="skeuo-outset" 
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-base)',
              padding: '28px',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="tactile-button"
              style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
            >
              <X size={14} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} />
              <span>Order Details</span>
            </h3>

            {/* Printed Paper Ticket in ledger */}
            <div 
              className="paper-texture receipt-tear" 
              style={{
                padding: '20px',
                color: '#333',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                textAlign: 'left',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {/* Receipt Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #aaa', paddingBottom: '10px' }}>
                <strong style={{ fontSize: '14px' }}>ORDER DETAILS</strong>
                <p style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }}>{selectedOrder.id}</p>
                <p style={{ fontSize: '11px', color: '#666' }}>{new Date(selectedOrder.date).toLocaleString()}</p>
              </div>

              {/* Customer details */}
              <div style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#666', fontWeight: 800, marginBottom: '4px' }}>
                  <MapPin size={10} />
                  <span>DELIVERY ADDRESS</span>
                </div>
                <strong>{selectedOrder.customer.name}</strong>
                <p style={{ margin: '2px 0' }}>{selectedOrder.customer.address}</p>
                <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>EMAIL: {selectedOrder.customer.email}</p>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#666', fontWeight: 800, marginBottom: '4px' }}>
                  <Calendar size={10} />
                  <span>PRODUCTS ORDERED</span>
                </div>
                {selectedOrder.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Payment Details */}
              <div style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#666', fontWeight: 800, marginBottom: '4px' }}>
                  <Receipt size={10} />
                  <span>PAYMENT LOGS</span>
                </div>
                <div><strong>PAYMENT METHOD:</strong> {selectedOrder.paymentMethod}</div>
                {selectedOrder.customer.transactionId && (
                  <div><strong>REF ID:</strong> {selectedOrder.customer.transactionId}</div>
                )}
                {selectedOrder.customer.paymentScreenshot && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', display: 'block', marginBottom: '4px' }}>PROOF SCREENSHOT (CLICK TO ENLARGE):</span>
                    <a href={selectedOrder.customer.paymentScreenshot} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                      <img 
                        src={selectedOrder.customer.paymentScreenshot} 
                        alt="Payment Proof" 
                        style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', cursor: 'zoom-in' }} 
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Calculation Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DELIVERY STATUS</span>
                  <span>{selectedOrder.shippingSpeed} (₹{selectedOrder.shippingCost.toFixed(2)})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, marginTop: '8px', borderTop: '1px solid #333', paddingTop: '6px' }}>
                  <span>GRAND TOTAL</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Change Status dials on popup */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status:</span>
                <div className={`led-indicator ${getStatusLed(selectedOrder.status)}`}></div>
                <strong style={{ fontSize: '13px' }}>{selectedOrder.status}</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedOrder.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Confirmed')}
                    className="tactile-button tactile-button-gold"
                    style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                  >
                    <CheckCircle size={12} />
                    <span>Confirm Order</span>
                  </button>
                )}
                {selectedOrder.status === 'Confirmed' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Shipped')}
                    className="tactile-button"
                    style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                  >
                    <Truck size={12} />
                    <span>Ship Package</span>
                  </button>
                )}
                {selectedOrder.status === 'Shipped' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                    className="tactile-button tactile-button-gold"
                    style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                  >
                    <PackageCheck size={12} />
                    <span>Set Delivered</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
