import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEditMode, PageParagraphs } from '../admin/EditModeContext';

const statusColors = {
  'התקבלה': { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  'בדרך':   { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
  'נמסרה':  { bg: '#f9fafb', color: '#374151', border: '#d1d5db' },
};

const Orders = () => {
  const orders = useSelector(state => state.orders.list);
  const navigate = useNavigate();
  const { active, settings: liveS, panelOpen, editable } = useEditMode() || {};
  const s = liveS || {};
  const ed = editable || (() => ({}));

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', paddingTop: active ? '52px' : 0, paddingRight: active && panelOpen ? '480px' : 0, transition: 'padding-right 0.3s' }}>
        <div style={{ fontSize: '80px' }}>📦</div>
        <h2 {...ed('ordersEmptyTitle')} style={{ fontSize: '28px', color: '#1f2937' }}>{s.ordersEmptyTitle || 'אין הזמנות עדיין'}</h2>
        <p {...ed('ordersEmptyText')} style={{ color: '#6b7280' }}>{s.ordersEmptyText || 'ההזמנות שלך יופיעו כאן לאחר הרכישה'}</p>
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'linear-gradient(135deg, #e8a87c, #c8622a)', color: 'white', padding: '12px 32px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', boxShadow: '0 4px 12px rgba(200,98,42,0.3)' }}
        >
          <span {...ed('ordersShopBtn')}>{s.ordersShopBtn || 'עבור לחנות'}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', paddingTop: active ? '72px' : 0, paddingRight: active && panelOpen ? '480px' : '20px', transition: 'padding-right 0.3s' }}>
      <h1 {...ed('ordersTitle')} style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#1f2937' }}>{s.ordersTitle || '📦 ההזמנות שלי'}</h1>
      <PageParagraphs page="orders" slot="top" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map(order => {
          const sc = statusColors[order.status] || statusColors['התקבלה'];
          return (
            <div key={order.id} style={{
              backgroundColor: 'white', borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>הזמנה #{order.id}</span>
                  <span style={{ color: '#6b7280', fontSize: '14px', marginRight: '12px' }}>{order.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                    backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                  }}>
                    {order.status}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#c8622a' }}>
                    ₪{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'
                  }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>× {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                      ₪{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px', marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
                  📍 {order.shipping?.address}, {order.shipping?.city}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <PageParagraphs page="orders" slot="bottom" />
    </div>
  );
};

export default Orders;
