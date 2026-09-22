import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart, addOrder, addToast } from '../store/store';
import emailjs from '@emailjs/browser';
import Confetti from '../components/Confetti';
import { useEditMode } from '../admin/EditModeContext';

const Checkout = () => {
  const { items } = useSelector(state => state.cart);
  const user = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { active, panelOpen, settings: liveS } = useEditMode() || {};
  const s = liveS || {};

  const steps = [
    s.checkoutStep1 || 'פרטי משלוח',
    s.checkoutStep2 || 'פרטי תשלום',
    s.checkoutStep3 || 'אישור הזמנה',
  ];

  const [step, setStep] = useState(0);
  const [orderDone, setOrderDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [formError, setFormError] = useState('');

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    zip: ''
  });

  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping_cost = total > Number(s.checkoutFreeShipping || 500) ? 0 : Number(s.checkoutShippingCost || 29);

  const isShippingValid = () => Object.values(shipping).every(v => v.trim() !== '');
  const isPaymentValid = () => Object.values(payment).every(v => v.trim() !== '') && payment.cardNumber.replace(/\s/g, '').length === 16 && payment.expiry.length === 5 && payment.cvv.length === 3;

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    return clean.length >= 3 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
  };

  const handlePlaceOrder = async () => {
    const order = {
      id: orderNumber,
      userId: user?.id,
      date: new Date().toLocaleDateString('he-IL'),
      items: [...items],
      total: total + shipping_cost,
      shipping,
      status: 'התקבלה'
    };
    dispatch(addOrder(order));
    dispatch(clearCart());
    dispatch(addToast({ type: 'success', message: `ההזמנה #${orderNumber} התקבלה בהצלחה! 🎉`, duration: 5000 }));

    const orderItems = items.map(i => `${i.name} × ${i.quantity} — ₪${(i.price * i.quantity).toLocaleString()}`).join('\n');
    try {
      await emailjs.send(
        'service_k7s01se',
        'template_iyprvm8',
        {
          customer_name: `${shipping.firstName} ${shipping.lastName}`,
          to_email: shipping.email,
          order_id: orderNumber,
          order_items: orderItems,
          total_price: (total + shipping_cost).toLocaleString(),
          address: `${shipping.address}, ${shipping.city}`,
        },
        'Msl7gvtuWwferlS3G'
      );
    } catch (e) {
      console.error('emailjs error', e);
    }

    setShowConfetti(true);
    setOrderDone(true);
  };

  if (items.length === 0 && !orderDone) {
    navigate('/cart');
    return null;
  }

  if (orderDone) {
    return (
      <>
    <Confetti active={showConfetti} />
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '80px' }}>🎉</div>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>{s.checkoutSuccessTitle || 'ההזמנה התקבלה!'}</h1>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>תודה על הקנייה, {shipping.firstName}!</p>
        <div style={{ backgroundColor: '#fdf3ec', border: '2px solid #c8622a', borderRadius: '12px', padding: '20px 40px' }}>
          <p style={{ color: '#3b1a08', fontSize: '16px' }}>מספר הזמנה</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#c8622a' }}>#{orderNumber}</p>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>אישור ישלח לכתובת {shipping.email}</p>
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'linear-gradient(135deg, #e8a87c, #c8622a)', color: 'white', padding: '12px 32px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '10px', boxShadow: '0 4px 12px rgba(200,98,42,0.3)' }}
        >
          {s.checkoutSuccessBtn || 'חזור לחנות'}
        </button>
      </div>
    </>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', paddingTop: active ? '72px' : 0, paddingRight: active && panelOpen ? '480px' : '20px', transition: 'padding 0.3s' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#1f2937' }}>{s.checkoutTitle || 'תשלום'}</h1>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '14px',
                backgroundColor: i <= step ? '#c8622a' : '#f0e0cc',
                color: i <= step ? 'white' : '#9ca3af'
              }}>{i + 1}</div>
              <span style={{ fontSize: '12px', color: i <= step ? '#c8622a' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: i < step ? '#c8622a' : '#f0e0cc', margin: '0 8px', marginBottom: '20px' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Form */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

            {step === 0 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>📦 פרטי משלוח</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'שם פרטי', key: 'firstName' },
                    { label: 'שם משפחה', key: 'lastName' },
                    { label: 'אימייל', key: 'email', full: true },
                    { label: 'טלפון', key: 'phone', full: true },
                    { label: 'כתובת', key: 'address', full: true },
                    { label: 'עיר', key: 'city' },
                    { label: 'מיקוד', key: 'zip' }
                  ].map(({ label, key, full }) => (
                    <div key={key} style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>{label}</label>
                      <input
                        value={shipping[key]}
                        onChange={e => setShipping(prev => ({ ...prev, [key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>💳 פרטי תשלום</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>מספר כרטיס</label>
                    <input
                      value={payment.cardNumber}
                      onChange={e => setPayment(prev => ({ ...prev, cardNumber: formatCard(e.target.value) }))}
                      placeholder="0000 0000 0000 0000"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', letterSpacing: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>שם בעל הכרטיס</label>
                    <input
                      value={payment.cardName}
                      onChange={e => setPayment(prev => ({ ...prev, cardName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>תוקף</label>
                      <input
                        value={payment.expiry}
                        onChange={e => setPayment(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>CVV</label>
                      <input
                        value={payment.cvv}
                        onChange={e => setPayment(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                        placeholder="123"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔒</span>
                    <span style={{ fontSize: '13px', color: '#166534' }}>התשלום מאובטח ומוצפן</span>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>✅ אישור הזמנה</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>פרטי משלוח</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>{shipping.firstName} {shipping.lastName}</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>{shipping.address}, {shipping.city}</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>{shipping.phone}</p>
                  </div>
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>פרטי תשלום</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>כרטיס המסתיים ב-{payment.cardNumber.slice(-4)}</p>
                  </div>
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>מוצרים</h3>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>₪{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {formError && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>
                ⚠️ {formError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '15px', color: '#374151' }}
                >
                  {s.checkoutBtnBack || '← חזור'}
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 0 && !isShippingValid()) { setFormError('יש למלא את כל פרטי המשלוח'); return; }
                  if (step === 1 && !isPaymentValid()) { setFormError('יש למלא את כל פרטי התשלום בצורה תקינה'); return; }
                  setFormError('');
                  step < 2 ? setStep(s => s + 1) : handlePlaceOrder();
                }}
                style={{ marginRight: step === 0 ? 'auto' : '0', padding: '12px 28px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #e8a87c, #c8622a)', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 12px rgba(200,98,42,0.3)' }}
              >
                {step === 2 ? (s.checkoutBtnPlace || '✅ בצע הזמנה') : (s.checkoutBtnNext || 'המשך →')}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>סיכום</h2>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>× {item.quantity}</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937' }}>₪{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                <span>משלוח</span>
                <span>{shipping_cost === 0 ? '🎁 חינם' : `₪${shipping_cost}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>
                <span>סה"כ</span>
                <span style={{ color: '#c8622a' }}>₪{(total + shipping_cost).toLocaleString()}</span>
              </div>
              {shipping_cost === 0 && (
                <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px', textAlign: 'center' }}>{s.checkoutFreeLabel || `✓ משלוח חינם על קנייה מעל ₪${s.checkoutFreeShipping || 500}`}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
