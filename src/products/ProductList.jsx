import { useState, useEffect, useRef } from 'react';
import { productsAPI, adminAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, toggleWishlist, addToast } from '../store/store';
import ConfirmDialog from '../components/ConfirmDialog';
import { useEditMode, PageParagraphs } from '../admin/EditModeContext';

const PRIMARY = '#c8622a';
const PRIMARY_LIGHT = '#fdf3ec';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get('search') || '');
  const [category, setCategory] = useState(new URLSearchParams(window.location.search).get('category') || '');
  const [sortBy, setSortBy] = useState(new URLSearchParams(window.location.search).get('sort') || '');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(Number(new URLSearchParams(window.location.search).get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const { active, settings: liveS, panelOpen, editable } = useEditMode() || {};
  const s = liveS || {};
  const ed = editable || (() => ({}));
  const [addedMap, setAddedMap] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    dispatch(addToast({ type: 'success', message: `${product.name} נוסף לסל! 🛒` }));
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  const handleToggleWishlist = (product) => {
    const isInWishlist = wishlistItems.some(i => i.id === product.id);
    dispatch(toggleWishlist(product));
    dispatch(addToast({
      type: isInWishlist ? 'info' : 'success',
      message: isInWishlist ? `${product.name} הוסר מהמועדפים` : `${product.name} נוסף למועדפים! ❤️`
    }));
  };

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (category) p.set('category', category);
    if (sortBy) p.set('sort', sortBy);
    if (currentPage > 1) p.set('page', currentPage);
    window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
  }, [search, category, sortBy, currentPage]);
  const isFirstRender = useRef(true);
  const pageResetRef = useRef(false);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    pageResetRef.current = true;
    setCurrentPage(1);
  }, [search, category]);

  useEffect(() => {
    if (pageResetRef.current && currentPage !== 1) return;
    pageResetRef.current = false;
    loadProducts();
  }, [search, category, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getProducts({ search, category, page: currentPage, limit: 20 });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / 20));
      setTotalProducts(response.data.total || response.data.products.length);
    } catch {
      dispatch(addToast({ type: 'error', message: 'שגיאה בטעינת התפריט' }));
    }
    setLoading(false);
  };

  const getSortedProducts = () => {
    const sorted = [...products].filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === 'price-asc') return sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') return sorted.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    if (sortBy === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    return sorted;
  };

  const handleConfirmDelete = async () => {
    try {
      await productsAPI.deleteProduct(productToDelete.id);
      dispatch(addToast({ type: 'success', message: `${productToDelete.name} נמחק בהצלחה` }));
      loadProducts();
      setShowConfirm(false);
      setProductToDelete(null);
    } catch {
      dispatch(addToast({ type: 'error', message: 'שגיאה במחיקת המנה' }));
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product.id);
    setEditVals({ name: product.name, price: product.price, image: product.image, description: product.description });
  };

  const saveEditProduct = async (productId) => {
    setEditSaving(true);
    try {
      await adminAPI.updateProduct(productId, editVals);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...editVals } : p));
      dispatch(addToast({ type: 'success', message: 'המנה עודכנה ✅' }));
      setEditingProduct(null);
    } catch {
      dispatch(addToast({ type: 'error', message: 'שגיאה בעדכון' }));
    }
    setEditSaving(false);
  };

  const sortedProducts = getSortedProducts();

  const categoryIcons = {
    'סלטים': '🥗', 'פיצות': '🍕', 'כריכים ולחמים': '🥙',
    'פסטות': '🍝', 'מנות גבינות': '🧀', 'בוקר ובראנץ\'': '🥞',
    'קינוחים': '🍰', 'שתייה': '🥤', 'סושי': '🍣',
    'דגים': '🐟', 'בר יין וקוקטיילים': '🍷', 'מרקים': '🍜'
  };

  const categories = ['סלטים', 'פיצות', 'כריכים ולחמים', 'פסטות', 'מנות גבינות', "בוקר ובראנץ'", 'קינוחים', 'שתייה', 'סושי', 'דגים', 'בר יין וקוקטיילים', 'מרקים'];

  const maxPrice = 200;

  return (
    <div style={{ padding: '24px', paddingTop: active ? '72px' : '30px', paddingRight: active && panelOpen ? '340px' : '24px', transition: 'padding-right 0.3s' }}>

      {/* כותרת */}
      <div style={{
        background: `linear-gradient(135deg, ${s.catalogBgFrom || '#e8a87c'} 0%, ${s.catalogBgTo || '#8b3a1a'} 100%)`,
        padding: '40px', textAlign: 'center', marginBottom: '30px',
        borderRadius: '24px', boxShadow: '0 15px 35px rgba(139,58,26,0.25)',
        position: 'relative'
      }}>
        <button onClick={() => navigate('/home')} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          color: 'white', padding: '8px 16px', borderRadius: '50px',
          cursor: 'pointer', fontSize: '13px', fontWeight: '600', backdropFilter: 'blur(10px)'
        }}>
          <span {...ed('catalogBtnBack')}>{s.catalogBtnBack || '← חזרה לקטגוריות'}</span>
        </button>
        <h1 {...ed('catalogTitle')} style={{ fontSize: '48px', color: 'white', fontWeight: 'bold', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          {s.catalogTitle || "🍽️ לה קוצ'ינה"}
        </h1>
        <p {...ed('catalogSubtitle')} style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginTop: '10px', fontWeight: '300' }}>
          {s.catalogSubtitle || 'קייטרינג חלבי איטלקי • מנות טריות מדי יום ✨'}
        </p>
      </div>

      <PageParagraphs page="catalog" slot="top" />

      {/* layout: sidebar + מוצרים */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{
          minWidth: '280px', width: '280px', background: 'white', borderRadius: '20px',
          boxShadow: '0 4px 16px rgba(200,98,42,0.1)', border: '2px solid #f0e0cc',
          padding: '24px', position: 'sticky', top: '80px',
          maxHeight: 'calc(100vh - 100px)', overflowY: 'auto'
        }}>

          {/* חיפוש */}
          <h3 style={{ color: '#8b3a1a', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>🔍 חיפוש</h3>
          <input
            type="text" placeholder={s.catalogSearchLabel || 'חפש מנה...'} value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', fontSize: '14px', border: '2px solid #f0e0cc', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
          />

          {/* מיון */}
          <h3 style={{ color: '#8b3a1a', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>↕️ מיון</h3>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', fontSize: '14px', border: '2px solid #f0e0cc', borderRadius: '10px', marginBottom: '20px', background: 'white', color: '#1f2937' }}>
            <option value="">ברירת מחדל</option>
            <option value="price-asc">מחיר: נמוך לגבוה</option>
            <option value="price-desc">מחיר: גבוה לנמוך</option>
            <option value="popular">הכי פופולרי 🔥</option>
            <option value="name">לפי שם</option>
          </select>

          {/* קטגוריות */}
          <h3 style={{ color: '#8b3a1a', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>📂 קטגוריות</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            {[{ name: '', label: 'כל הקטגוריות' }, ...categories.map(c => ({ name: c, label: `${categoryIcons[c]} ${c}` }))].map(cat => (
              <button key={cat.name} onClick={() => { setCategory(cat.name); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{
                textAlign: 'right', padding: '16px 20px', borderRadius: '14px', border: 'none',
                cursor: 'pointer', fontSize: '17px', fontWeight: category === cat.name ? '700' : '400',
                background: category === cat.name ? 'linear-gradient(135deg, #e8a87c, #c8622a)' : '#fdf3ec',
                color: category === cat.name ? 'white' : '#8b3a1a', transition: 'all 0.2s'
              }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* טווח מחירים */}
          <h3 style={{ color: '#8b3a1a', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>💰 טווח מחירים</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#c8622a', fontWeight: '600', marginBottom: '6px' }}>
            <span>₪{priceRange[0]}</span>
            <span>₪{priceRange[1]}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>מינימום</label>
            <input type="range" min={0} max={maxPrice} value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1] - 5), priceRange[1]])}
              style={{ width: '100%', accentColor: '#c8622a' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>מקסימום</label>
            <input type="range" min={0} max={maxPrice} value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0] + 5)])}
              style={{ width: '100%', accentColor: '#c8622a' }}
            />
          </div>
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <button onClick={() => setPriceRange([0, maxPrice])}
              style={{ marginTop: '10px', width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #c8622a', background: 'white', color: '#c8622a', fontSize: '12px', cursor: 'pointer' }}>
              אפס מחירים
            </button>
          )}
        </div>

      {/* רשת מוצרים */}
      <div style={{ flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
        {sortedProducts.map(product => {
          const isWishlisted = wishlistItems.some(i => i.id === product.id);
          return (
            <div key={product.id} className="product-card" style={{
              backgroundColor: 'white', borderRadius: '20px',
              boxShadow: '0 4px 16px rgba(200,98,42,0.1)', overflow: 'hidden',
              border: `2px solid ${active && editingProduct === product.id ? '#c8622a' : '#f0e0cc'}`, position: 'relative'
            }}>
              {/* כפתור עריכה מהירה למנהל במצב עריכה */}
              {active && user?.isAdmin && editingProduct !== product.id && (
                <button onClick={() => openEditProduct(product)} style={{
                  position: 'absolute', top: '8px', left: '8px', zIndex: 10,
                  background: 'linear-gradient(135deg,#c8622a,#e8a87c)', color: 'white',
                  border: 'none', borderRadius: '8px', padding: '5px 10px',
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>✏️ ערוך</button>
              )}
              {/* פאנל עריכה מהירה */}
              {active && editingProduct === product.id && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(15,23,42,0.97)',
                  borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: '#e8a87c', fontWeight: '800', fontSize: '13px' }}>✏️ עריכת מנה</span>
                    <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                  </div>
                  {[{key:'name',label:'שם',type:'text'},{key:'price',label:'מחיר ₪',type:'number'},{key:'image',label:'תמונה URL',type:'text'}].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>{f.label}</label>
                      <input type={f.type} value={editVals[f.key] || ''}
                        onChange={e => setEditVals(v => ({ ...v, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>תיאור</label>
                    <textarea value={editVals.description || ''}
                      onChange={e => setEditVals(v => ({ ...v, description: e.target.value }))}
                      rows={2} style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  {editVals.image && <img src={editVals.image} alt="" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px' }} onError={e => e.target.style.display='none'} />}
                  <button onClick={() => saveEditProduct(product.id)} disabled={editSaving}
                    style={{ width: '100%', padding: '9px', background: 'linear-gradient(135deg,#c8622a,#e8a87c)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}>
                    {editSaving ? '⏳ שומר...' : '💾 שמור שינויים'}
                  </button>
                </div>
              )}
              {!user?.isAdmin && (
                <button onClick={() => handleToggleWishlist(product)} style={{
                  position: 'absolute', top: '12px', right: '12px', zIndex: 1,
                  background: 'white', border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {isWishlisted ? '❤️' : '🤍'}
                </button>
              )}
              {(product.isHot || product.sold > 100) && (
                <div style={{
                  position: 'absolute', top: '12px', left: '12px', zIndex: 1,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white', padding: '4px 10px', borderRadius: '50px',
                  fontSize: '11px', fontWeight: '700',
                }}>{s.catalogBadgeHot || '🔥 פופולרי'}</div>
              )}
              {product.isNew && !product.isHot && (
                <div style={{
                  position: 'absolute', top: '12px', left: '12px', zIndex: 1,
                  background: 'linear-gradient(135deg, #34d399, #059669)',
                  color: 'white', padding: '4px 10px', borderRadius: '50px',
                  fontSize: '11px', fontWeight: '700',
                }}>{s.catalogBadgeNew || '✨ חדש'}</div>
              )}
              {product.isSale && !product.isHot && !product.isNew && (
                <div style={{
                  position: 'absolute', top: '12px', left: '12px', zIndex: 1,
                  background: 'linear-gradient(135deg, #f87171, #dc2626)',
                  color: 'white', padding: '4px 10px', borderRadius: '50px',
                  fontSize: '11px', fontWeight: '700',
                }}>🏷️ מבצע</div>
              )}
              <img src={product.image} alt={product.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product.id}`)}
              />
              <div style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', backgroundColor: PRIMARY_LIGHT, color: PRIMARY, padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
                  {categoryIcons[product.category] || '🍽️'} {product.category}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: '10px 0 6px', color: '#1f2937' }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '14px', height: '38px', overflow: 'hidden' }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: PRIMARY }}>
                    ₪{product.price.toLocaleString()}
                  </span>
                  {product.sold > 0 && (
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
                      🔥 {product.sold} הוזמנו
                    </span>
                  )}
                </div>
                <button onClick={() => navigate(`/product/${product.id}`)} style={{
                  width: '100%', background: 'linear-gradient(135deg, #e8a87c, #c8622a)',
                  color: 'white', padding: '10px', borderRadius: '50px', border: 'none',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '8px',
                  boxShadow: '0 4px 12px rgba(200,98,42,0.3)'
                }}>
                  {s.catalogBtnDetails || 'צפה בפרטים'}
                </button>
                {!user?.isAdmin && (
                  <button onClick={() => handleAddToCart(product)} style={{
                    width: '100%',
                    background: addedMap[product.id] ? 'linear-gradient(135deg, #86efac, #16a34a)' : 'white',
                    color: addedMap[product.id] ? 'white' : PRIMARY,
                    padding: '10px', borderRadius: '50px',
                    border: `2px solid ${addedMap[product.id] ? '#16a34a' : PRIMARY}`,
                    cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
                  }}>
                    {addedMap[product.id] ? (s.catalogBtnAdded || '✓ נוסף לסל!') : (s.catalogBtnAddCart || '🛒 הוסף לסל')}
                  </button>
                )}
                {user?.isAdmin && (
                  <button onClick={() => { setProductToDelete(product); setShowConfirm(true); }}
                    style={{ width: '100%', background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '50px', border: '2px solid #fca5a5', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                    🗑 מחק מנה
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', border: '2px solid #f0e0cc' }}>
              <div className="skeleton" style={{ height: '200px', borderRadius: 0 }} />
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ height: '16px', width: '60%' }} />
                <div className="skeleton" style={{ height: '20px', width: '80%' }} />
                <div className="skeleton" style={{ height: '14px', width: '100%' }} />
                <div className="skeleton" style={{ height: '14px', width: '70%' }} />
                <div className="skeleton" style={{ height: '40px', marginTop: '8px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedProducts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <div style={{ fontSize: '60px' }}>🍽️</div>
          <p style={{ fontSize: '18px', color: '#9ca3af', marginTop: '12px' }}>{s.catalogEmptyText || 'לא נמצאו מנות'}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
          <button onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            disabled={currentPage === 1}
            style={{ padding: '8px 20px', borderRadius: '50px', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? '#e5e7eb' : 'linear-gradient(135deg,#e8a87c,#c8622a)', color: currentPage === 1 ? '#9ca3af' : 'white', fontWeight: '600' }}>
            ← הקודם
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              style={{ padding: '8px 14px', borderRadius: '50px', border: `2px solid ${currentPage === page ? PRIMARY : '#f0e0cc'}`, background: currentPage === page ? PRIMARY : 'white', color: currentPage === page ? 'white' : PRIMARY, fontWeight: 'bold', cursor: 'pointer' }}>
              {page}
            </button>
          ))}
          <button onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 20px', borderRadius: '50px', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? '#e5e7eb' : 'linear-gradient(135deg,#e8a87c,#c8622a)', color: currentPage === totalPages ? '#9ca3af' : 'white', fontWeight: '600' }}>
            הבא →
          </button>
        </div>
      )}

      </div> {/* end flex content */}
      </div> {/* end sidebar+products layout */}

      <PageParagraphs page="catalog" slot="bottom" />

      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setShowConfirm(false); setProductToDelete(null); }}
        title="מחיקת מנה"
        message="האם אתה בטוח שברצונך למחוק את המנה הזו?"
        productName={productToDelete?.name}
      />
    </div>
  );
};

export default ProductList;
