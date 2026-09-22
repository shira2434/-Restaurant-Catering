import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, toggleWishlist, addToast } from '../store/store';
import AddReview from '../reviews/AddReview';
import CustomizeModal from './CustomizeModal';
import { useEditMode } from '../admin/EditModeContext';

const CUSTOMIZABLE = ['פסטות', 'פיצות', 'סושי', 'סלטים'];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [added, setAdded] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const dispatch = useDispatch();

  const wishlistItems = useSelector(state => state.wishlist.items);
  const user = useSelector(state => state.user.currentUser);
  const isWishlisted = product ? wishlistItems.some(i => i.id === product.id) : false;
  const { active, panelOpen, editable, settings: liveS } = useEditMode() || {};
  const ed = editable || (() => ({}));
  const s = liveS || {};

  const handleAddToCart = (customProduct) => {
    const p = customProduct || product;
    dispatch(addToCart(p));
    dispatch(addToast({ type: 'success', message: `${p.name} נוסף לסל!` }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    dispatch(addToast({
      type: isWishlisted ? 'info' : 'success',
      message: isWishlisted ? `${product.name} הוסר מהמועדפים` : `${product.name} נוסף למועדפים! ❤️`
    }));
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      const [productResponse, reviewsResponse] = await Promise.all([
        productsAPI.getProduct(id),
        reviewsAPI.getProductReviews(id)
      ]);
      
      setProduct(productResponse.data);
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error('Error loading product data:', error);
    }
    setLoading(false);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      dispatch(addToast({ type: 'success', message: 'חוות הדעת נמחקה' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'שגיאה במחיקת חוות דעת' }));
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setProduct(prev => ({
      ...prev,
      sold: (prev.sold || 0) + 1
    }));
    setShowAddReview(false);
  };

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '20px'}}>טוען...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '20px', color: 'red'}}>מוצר לא נמצא</div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{minHeight: '100vh', padding: '40px 20px', paddingTop: active ? '72px' : '40px', paddingRight: active && panelOpen ? '360px' : '20px', backgroundColor: '#f8fafc', transition: 'padding 0.3s'}}>
      <div style={{maxWidth: '1100px', margin: '0 auto'}}>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '20px', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '16px', color: '#0891b2',
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600'
          }}
        >
          ← חזרה
        </button>

        {/* Top section: image left, details right */}
        <div style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: '40px',
          alignItems: 'flex-start',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '40px',
          marginBottom: '40px'
        }}>
          {/* Right side: details */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0}}>{product.name}</h1>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.isHot  && <span style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>🔥 חם</span>}
              {product.isNew  && <span style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>✨ חדש</span>}
              {product.isSale && <span style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>🏷️ מבצע</span>}
            </div>

            <div style={{fontSize: '16px', color: '#0891b2'}}>
              {averageRating} ★ <span style={{color: '#94a3b8'}}>({reviews.length} חווות דעת)</span>
            </div>

            <p style={{fontSize: '17px', color: '#64748b', lineHeight: '1.7', margin: 0}}>{product.description}</p>

            <div style={{height: '1px', backgroundColor: '#e2e8f0'}}></div>

            <div style={{fontSize: '40px', fontWeight: 'bold', color: '#0891b2'}}>₪{product.price.toLocaleString()}</div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{color: '#64748b', fontSize: '14px'}}>📦 קטגוריה: {product.category}</div>
              <div style={{color: '#64748b', fontSize: '14px'}}>📊 במלאי: {product.stock} יחידות</div>
              <div style={{color: '#64748b', fontSize: '14px'}}>🛒 נמכר: {product.sold || 0} יחידות</div>
            </div>

            {user && !user.isAdmin && (
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px'}}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    backgroundColor: added ? '#16a34a' : '#0891b2',
                    color: 'white', padding: '12px 24px', borderRadius: '12px',
                    border: 'none', cursor: 'pointer', fontSize: '15px',
                    fontWeight: 'bold', transition: 'background 0.3s'
                  }}
                >
                  {added ? '✓ נוסף לסל!' : '🛒 הוסף לסל'}
                </button>
                {CUSTOMIZABLE.includes(product.category) && (
                  <button
                    onClick={() => setShowCustomize(true)}
                    style={{
                      background: `linear-gradient(135deg, #e8a87c, #c8622a)`,
                      color: 'white', padding: '12px 24px', borderRadius: '12px',
                      border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold',
                      boxShadow: '0 4px 16px rgba(200,98,42,0.35)',
                    }}
                  >
                    🎨 התאם אישית
                  </button>
                )}
                <button
                  onClick={handleToggleWishlist}
                  style={{
                    backgroundColor: isWishlisted ? '#fef2f2' : 'white',
                    color: isWishlisted ? '#e11d48' : '#0891b2',
                    padding: '12px 24px', borderRadius: '12px',
                    border: `2px solid ${isWishlisted ? '#e11d48' : '#0891b2'}`,
                    cursor: 'pointer', fontSize: '15px'
                  }}
                >
                  {isWishlisted ? '❤️ הסר ממועדפים' : '🤍 הוסף למועדפים'}
                </button>
                <button
                  onClick={() => setShowAddReview(true)}
                  style={{
                    backgroundColor: 'white', color: '#0891b2', padding: '12px 24px',
                    borderRadius: '12px', border: '2px solid #0891b2',
                    cursor: 'pointer', fontSize: '15px'
                  }}
                >
                  ✍ כתוב חוות דעת
                </button>
              </div>
            )}
          </div>

          {/* Left side: image */}
          <div style={{flexShrink: 0}}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '420px',
                height: '340px',
                objectFit: 'cover',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.12)'
              }}
            />
          </div>
        </div>

        {/* Reviews section */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '30px',
          borderRadius: '20px',
        }}>
          <h2 style={{
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '25px',
            textAlign: 'center',
            color: '#0c4a6e'
          }}>
            {s.reviewSectionTitle || 'חווות דעת לקוחות'}
          </h2>
          
          {reviews.length === 0 ? (
            <p style={{color: '#64748b', fontSize: '18px', textAlign: 'center'}}>{s.reviewEmptyText || 'אין עדיין חווות דעת. היה הראשון לכתוב!'}</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {reviews.map(review => (
                <div key={review.id} style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <span style={{fontSize: '18px', color: '#0891b2'}}>
                      {'★'.repeat(review.rating)}
                    </span>
                    <span style={{fontSize: '14px', color: '#64748b'}}>{review.date}</span>
                  </div>
                  <h4 style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: '#0c4a6e'}}>{review.userName}</h4>
                  <p style={{color: '#475569', lineHeight: '1.5'}}>{review.comment}</p>
                  {user && user.id === review.userId && (
                    <div style={{textAlign: 'left', marginTop: '10px'}}>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        style={{
                          color: '#dc2626',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        🗑 מחק
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddReview && (
          <AddReview
            productId={parseInt(id)}
            userId={user.id}
            onReviewAdded={handleReviewAdded}
            onClose={() => setShowAddReview(false)}
          />
        )}
        {showCustomize && (
          <CustomizeModal
            product={product}
            onClose={() => setShowCustomize(false)}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
