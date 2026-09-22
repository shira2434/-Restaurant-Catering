import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/api';
import { addToCart, addToast } from '../store/store';
import { useEditMode } from '../admin/EditModeContext';

const PRIMARY = '#c8622a';

const BuildBox = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [boxName, setBoxName] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { active, panelOpen, settings: liveS } = useEditMode() || {};
  const s = liveS || {};
  const MIN = Number(s.buildboxMin) || 3;
  const MAX = Number(s.buildboxMax) || 5;
  const DISCOUNT = Number(s.buildboxDiscount) || 10;

  useEffect(() => {
    productsAPI.getProducts({ limit: 100 }).then(r => {
      setProducts(r.data.products.filter(p => p.category !== 'שתייה'));
    });
  }, []);

  const toggle = (product) => {
    const idx = selected.findIndex(s => s.id === product.id);
    if (idx !== -1) {
      setSelected(prev => prev.filter(s => s.id !== product.id));
    } else if (selected.length < MAX) {
      setSelected(prev => [...prev, product]);
    } else {
      dispatch(addToast({ type: 'warning', message: `ניתן לבחור עד ${MAX} פריטים במארז` }));
    }
  };

  const totalPrice = selected.reduce((sum, p) => sum + p.price, 0);

  const handleAddBox = () => {
    if (selected.length < MIN) {
      dispatch(addToast({ type: 'warning', message: `יש לבחור לפחות ${MIN} פריטים` }));
      return;
    }
    const box = {
      id: Date.now(),
      name: boxName || `🎁 מארז אישי (${selected.length} מנות)`,
      price: Math.round(totalPrice * (1 - DISCOUNT / 100)),
      image: selected[0].image,
      category: 'מארזים',
      description: selected.map(p => p.name).join(', '),
      quantity: 1
    };
    dispatch(addToCart(box));
    dispatch(addToast({ type: 'success', message: 'המארז האישי נוסף לסל! 🎁', duration: 4000 }));
    navigate('/cart');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px', paddingTop: active ? '72px' : 0, paddingRight: active && panelOpen ? '480px' : '20px', transition: 'padding 0.3s' }}>

      <div style={{
        background: 'linear-gradient(135deg, #e8a87c, #8b3a1a)',
        borderRadius: '24px', padding: '36px', textAlign: 'center', marginBottom: '30px',
        boxShadow: '0 15px 35px rgba(139,58,26,0.25)'
      }}>
        <h1 style={{ fontSize: '42px', color: 'white', fontWeight: 'bold', margin: 0 }}>{s.buildboxTitle || '🎁 הרכב מארז אישי'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '10px', fontSize: '16px' }}>
          {s.buildboxSubtitle || `בחר ${MIN}–${MAX} מנות וצור מארז קייטרינג מיוחד עם ${DISCOUNT}% הנחה!`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {products.map(product => {
              const isSelected = selected.some(s => s.id === product.id);
              return (
                <div key={product.id} onClick={() => toggle(product)} style={{
                  backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                  border: `3px solid ${isSelected ? PRIMARY : '#f0e0cc'}`,
                  boxShadow: isSelected ? `0 8px 24px rgba(200,98,42,0.3)` : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.2s', position: 'relative'
                }}>
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px', zIndex: 1,
                      background: PRIMARY, color: 'white', borderRadius: '50%',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
                    }}>✓</div>
                  )}
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px' }}>{product.name}</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: PRIMARY, margin: 0 }}>₪{product.price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '24px',
            boxShadow: '0 4px 16px rgba(200,98,42,0.1)', border: '2px solid #f0e0cc',
            position: 'sticky', top: '90px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              🎁 המארז שלי
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>{s.buildboxNameLabel || 'שם המארז (אופציונלי)'}</label>
              <input value={boxName} onChange={e => setBoxName(e.target.value)}
                placeholder="למשל: מארז ארוחת עסקים 🍽️"
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid #f0e0cc', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px', minHeight: '80px' }}>
              {selected.length === 0 ? (
                <p style={{ color: '#d1d5db', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
                  {s.buildboxEmptyText || 'לחץ על מנות כדי להוסיף 🍽️'}
                </p>
              ) : (
                selected.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#374151' }}>🍴 {p.name}</span>
                    <span style={{ color: PRIMARY, fontWeight: '600' }}>₪{p.price}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '2px dashed #f0e0cc', paddingTop: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                <span>מחיר מקורי</span>
                <span>₪{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', marginBottom: '8px' }}>
                <span>הנחת מארז {DISCOUNT}%</span>
                <span>-₪{Math.round(totalPrice * DISCOUNT / 100)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px' }}>
                <span>סה"כ</span>
                <span style={{ color: PRIMARY }}>₪{Math.round(totalPrice * (1 - DISCOUNT / 100))}</span>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginBottom: '14px' }}>
              {selected.length}/{MAX} מנות נבחרו
              {selected.length < MIN && <span style={{ color: '#f59e0b' }}> (מינימום {MIN})</span>}
            </div>

            <button onClick={handleAddBox} style={{
              width: '100%',
              background: selected.length >= MIN ? 'linear-gradient(135deg, #e8a87c, #c8622a)' : '#e5e7eb',
              color: selected.length >= MIN ? 'white' : '#9ca3af',
              padding: '14px', borderRadius: '50px', border: 'none',
              cursor: selected.length >= MIN ? 'pointer' : 'not-allowed',
              fontSize: '16px', fontWeight: 'bold',
              boxShadow: selected.length >= MIN ? '0 4px 16px rgba(200,98,42,0.4)' : 'none'
            }}>
              {s.buildboxBtn || '🎁 הוסף מארז לסל'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildBox;
