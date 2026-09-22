import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity } from '../store/store';
import { useEditMode, PageParagraphs } from '../admin/EditModeContext';

const Cart = () => {
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { active, settings: liveS, panelOpen, editable } = useEditMode() || {};
  const s = liveS || {};
  const ed = editable || (() => ({}));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', paddingTop: active ? '52px' : 0, paddingRight: active && panelOpen ? '480px' : 0, transition: 'padding-right 0.3s' }}>
        <div style={{ fontSize: '80px' }}>🛒</div>
        <h2 {...ed('cartEmptyTitle')} style={{ fontSize: '28px', color: '#1f2937' }}>{s.cartEmptyTitle || 'הסל שלך ריק'}</h2>
        <p {...ed('cartEmptyText')} style={{ color: '#6b7280' }}>{s.cartEmptyText || 'הוסף מוצרים כדי להתחיל'}</p>
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'linear-gradient(135deg, #e8a87c, #c8622a)', color: 'white', padding: '12px 32px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', boxShadow: '0 4px 12px rgba(200,98,42,0.3)' }}
        >
          המשך לקנות
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', paddingTop: active ? '72px' : 0, paddingRight: active && panelOpen ? '480px' : '20px', transition: 'padding-right 0.3s' }}>
      <h1 {...ed('cartTitle')} style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px', color: '#3b1a08' }}>{s.cartTitle || '🛒 סל הקניות שלי'}</h1>

      <PageParagraphs page="cart" slot="top" />

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Items */}
        <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <div key={item.id} style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: '16px', alignItems: 'center'
            }}>
              <img src={item.image} alt={item.name} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px', color: '#1f2937' }}>{item.name}</h3>
                <p style={{ color: '#c8622a', fontWeight: 'bold', fontSize: '18px' }}>₪{item.price.toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => item.quantity > 1
                    ? dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                    : dispatch(removeFromCart(item.id))}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #c8622a', background: 'white', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#c8622a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', lineHeight: '1' }}
                ><span style={{marginTop: '-2px'}}>−</span></button>
                <span style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #c8622a', background: 'white', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#c8622a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', lineHeight: '1' }}
                ><span style={{marginTop: '-2px'}}>+</span></button>
              </div>
              <div style={{ textAlign: 'left', minWidth: '80px' }}>
                <p style={{ fontWeight: 'bold', color: '#1f2937' }}>₪{(item.price * item.quantity).toLocaleString()}</p>
                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}
                >🗑 {s.cartRemoveBtn || 'הסר'}</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
            <h2 {...ed('cartSummaryTitle')} style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>{s.cartSummaryTitle || 'סיכום הזמנה'}</h2>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '20px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₪{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', color: '#1f2937', borderTop: '2px solid #f0e0cc', paddingTop: '16px', marginBottom: '24px' }}>
              <span>סה"כ</span>
              <span style={{ color: '#c8622a' }}>₪{total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', background: 'linear-gradient(135deg, #e8a87c, #c8622a)', color: 'white', padding: '14px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', boxShadow: '0 4px 16px rgba(200,98,42,0.35)' }}
            >
              <span {...ed('cartCheckoutBtn')}>{s.cartCheckoutBtn || 'המשך לתשלום →'}</span>
            </button>
            <button
              onClick={() => navigate('/home')}
              style={{ width: '100%', backgroundColor: 'transparent', color: '#6b7280', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}
            >
              <span {...ed('cartContinueBtn')}>{s.cartContinueBtn || '← המשך בקניה'}</span>
            </button>
          </div>
        </div>
      </div>
      <PageParagraphs page="cart" slot="bottom" />
    </div>
  );
};

export default Cart;
