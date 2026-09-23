import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { productsAPI, usersAPI, ordersAPI, adminAPI } from '../api/api';
import { useEditMode } from './EditModeContext';
import styles from './AdminDashboard.module.css';

const TABS = [
  { id: 'stats',    label: 'סטטיסטיקות', icon: '📊', desc: 'סקירה כללית של העסק' },
  { id: 'orders',   label: 'הזמנות',      icon: '📋', desc: 'ניהול וסטטוס הזמנות' },
  { id: 'products', label: 'מוצרים',      icon: '📦', desc: 'עריכה והוספת מוצרים' },
  { id: 'users',    label: 'משתמשים',     icon: '👥', desc: 'ניהול לקוחות ומנהלים' },
  { id: 'design',   label: 'עיצוב האתר',  icon: '🎨', desc: 'צבעים, טקסטים, Hero' },
  { id: 'settings', label: 'הגדרות חנות', icon: '⚙️', desc: 'משלוח, שעות, מבצעים' },
  { id: 'reviews',  label: 'ביקורות',      icon: '⭐', desc: 'ניהול ביקורות לקוחות' },
];

const DEFAULT_SETTINGS = {
  heroTitle: "לה קוצ'ינה",
  heroSubtitle: 'קייטרינג חלבי איטלקי • מנות טריות מדי יום',
  heroEmoji: '☕',
  primaryColor: '#c8622a',
  secondaryColor: '#3b1a08',
  accentColor: '#e8a87c',
  heroVideoId: 'Lcyeu2hUOeY',
  categoriesTitle: 'מה תרצה היום?',
  categoriesSubtitle: 'בחר קטגוריה לצפייה במנות',
  minOrder: 50,
  deliveryCost: 25,
  freeDeliveryFrom: 200,
  openHours: 'א-ה 08:00-20:00 | ו 08:00-14:00',
  phone: '050-0000000',
  address: 'תל אביב',
  couponCode: '',
  couponDiscount: 10,
};

const STATUS_MAP = {
  pending:   { label: 'ממתין',  color: '#fef3c7', text: '#92400e', icon: '⏳' },
  confirmed: { label: 'אושר',   color: '#d1fae5', text: '#065f46', icon: '✅' },
  preparing: { label: 'בהכנה', color: '#dbeafe', text: '#1e40af', icon: '👨‍🍳' },
  delivered: { label: 'נשלח',   color: '#ede9fe', text: '#5b21b6', icon: '🚚' },
  cancelled: { label: 'בוטל',   color: '#fee2e2', text: '#991b1b', icon: '❌' },
};

export default function AdminDashboard() {
  const user = useSelector(s => s.user.currentUser);
  const navigate = useNavigate();
  const { setActive } = useEditMode() || {};

  const [tab, setTab] = useState('stats');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/home'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, u, o, s] = await Promise.all([
        productsAPI.getProducts({ limit: 999 }),
        usersAPI.getAllUsers(),
        ordersAPI.getOrders(),
        adminAPI.getSettings(),
      ]);
      setProducts(p.data.products || []);
      setUsers(u.data || []);
      setOrders(o.data || []);
      try {
        const r = await fetch('http://localhost:3000/api/reviews', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const rj = await r.json();
        setReviews(rj || []);
      } catch {}
      const merged = { ...DEFAULT_SETTINGS, ...s.data };
      setSettings(merged);
      setSavedSettings(merged);
    } catch { showToast('שגיאה בטעינת נתונים', 'error'); }
    setLoading(false);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrder = orders.length ? (totalRevenue / orders.length).toFixed(0) : 0;
  const pendingCount = orders.filter(o => !o.status || o.status === 'pending').length;
  const topProduct = (() => {
    const counts = {};
    orders.forEach(o => (o.items || []).forEach(i => { counts[i.name] = (counts[i.name] || 0) + i.quantity; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : '—';
  })();

  const saveSettings = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      setSavedSettings(settings);
      showToast('✅ ההגדרות נשמרו בהצלחה');
    } catch { showToast('שגיאה בשמירה', 'error'); }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('למחוק מוצר זה?')) return;
    try {
      await productsAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('מוצר נמחק');
    } catch { showToast('שגיאה במחיקה', 'error'); }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`למחוק ${selectedProducts.size} מוצרים?`)) return;
    try {
      await Promise.all([...selectedProducts].map(id => productsAPI.deleteProduct(id)));
      setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
      showToast(`${selectedProducts.size} מוצרים נמחקו`);
    } catch { showToast('שגיאה במחיקה', 'error'); }
  };

  const toggleSelect = (id) => setSelectedProducts(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelectAll = () => {
    if (selectedProducts.size > 0)
      setSelectedProducts(new Set());
    else
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
  };

  const saveProduct = async () => {
    try {
      await adminAPI.updateProduct(editProduct.id, editProduct);
      setProducts(prev => prev.map(p => p.id === editProduct.id ? editProduct : p));
      setEditProduct(null);
      showToast('✅ מוצר עודכן');
    } catch { showToast('שגיאה בעדכון', 'error'); }
  };

  const toggleAdmin = async (u) => {
    try {
      await usersAPI.updateUser(u.id, { isAdmin: !u.isAdmin });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isAdmin: !x.isAdmin } : x));
      showToast(`${u.firstName} ${!u.isAdmin ? 'הפך למנהל 👑' : 'הוסר מתפקיד מנהל'}`);
    } catch { showToast('שגיאה', 'error'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('למחוק משתמש זה?')) return;
    try {
      await usersAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('משתמש נמחק');
    } catch { showToast('שגיאה', 'error'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await ordersAPI.updateOrder(id, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast('סטטוס עודכן');
    } catch { showToast('שגיאה', 'error'); }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.category?.includes(searchProduct)
  );
  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );
  const filteredOrders = orders
    .filter(o => orderFilter === 'all' || (o.status || 'pending') === orderFilter)
    .filter(o => !orderSearch || (o.customerName || o.name || '').includes(orderSearch) || String(o.id).includes(orderSearch));

  const catStats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const exportCSV = () => {
    const rows = [['מזהה','לקוח','סכום','תאריך','סטטוס']];
    orders.forEach(o => rows.push([
      String(o.id).slice(-6),
      o.customerName || o.name || '',
      o.total || 0,
      o.date ? new Date(o.date).toLocaleDateString('he-IL') : '',
      STATUS_MAP[o.status]?.label || 'ממתין',
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'orders.csv';
    a.click();
  };

  const deleteReview = async (id) => {
    if (!window.confirm('למחוק ביקורת זו?')) return;
    try {
      await fetch(`http://localhost:3000/api/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast('ביקורת נמחקה');
    } catch { showToast('שגיאה', 'error'); }
  };

  const currentTab = TABS.find(t => t.id === tab);

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner} />
      <p>טוען דשבורד...</p>
    </div>
  );

  return (
    <div className={styles.dashboard} dir="rtl">
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoEmoji}>☕</span>
            {sidebarOpen && (
              <div>
                <div className={styles.sidebarTitle}>לה קוצ'ינה</div>
                <div className={styles.sidebarSub}>פאנל ניהול</div>
              </div>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {pendingCount > 0 && sidebarOpen && (
          <div className={styles.alertBanner} onClick={() => setTab('orders')}>
            <span>🔔</span>
            <span>{pendingCount} הזמנות ממתינות לאישור</span>
          </div>
        )}

        <nav className={styles.nav}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${styles.navBtn} ${tab === t.id ? styles.active : ''}`}
              onClick={() => setTab(t.id)}
              title={t.label}>
              <span className={styles.navIcon}>{t.icon}</span>
              {sidebarOpen && (
                <div className={styles.navText}>
                  <span className={styles.navLabel}>{t.label}</span>
                  <span className={styles.navDesc}>{t.desc}</span>
                </div>
              )}
              {t.id === 'orders' && pendingCount > 0 && (
                <span className={styles.navBadge}>{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.liveBtn}
            onClick={() => { setActive(true); navigate('/home'); }}>
            <span>✏️</span>
            {sidebarOpen && <span>עריכה חיה</span>}
          </button>
          <button className={styles.backBtn} onClick={() => navigate('/home')}>
            <span>🏠</span>
            {sidebarOpen && <span>חזרה לאתר</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarRight}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbIcon}>{currentTab?.icon}</span>
              <div>
                <h1 className={styles.pageTitle}>{currentTab?.label}</h1>
                <p className={styles.pageDesc}>{currentTab?.desc}</p>
              </div>
            </div>
          </div>
          <div className={styles.topBarLeft}>
            <div className={styles.adminInfo}>
              <div className={styles.adminAvatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
              <div>
                <div className={styles.adminName}>{user?.firstName} {user?.lastName}</div>
                <div className={styles.adminRole}>מנהל ראשי</div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        {tab === 'stats' && (
          <div className={styles.content}>
            <div className={styles.statsGrid}>
              {[
                { label: 'סה"כ מוצרים', value: products.length, icon: '📦', color: '#e8a87c', sub: 'במלאי' },
                { label: 'משתמשים רשומים', value: users.length, icon: '👥', color: '#6ee7b7', sub: 'לקוחות' },
                { label: 'סה"כ הזמנות', value: orders.length, icon: '📋', color: '#93c5fd', sub: 'כל הזמנה' },
                { label: 'סה"כ הכנסות', value: `₪${totalRevenue.toLocaleString()}`, icon: '💰', color: '#fcd34d', sub: 'מכל הזמנות' },
                { label: 'הזמנה ממוצעת', value: `₪${avgOrder}`, icon: '📈', color: '#f9a8d4', sub: 'ממוצע' },
                { label: 'ממתינות לאישור', value: pendingCount, icon: '⏳', color: pendingCount > 0 ? '#fca5a5' : '#6ee7b7', sub: 'הזמנות חדשות' },
              ].map(s => (
                <div key={s.label} className={styles.statCard} style={{ borderTop: `4px solid ${s.color}` }}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statSub}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div className={styles.statsRow}>
              <div className={styles.recentBox}>
                <div className={styles.boxHeader}>
                  <h2 className={styles.boxTitle}>📋 הזמנות אחרונות</h2>
                  <button className={styles.linkBtn} onClick={() => setTab('orders')}>הצג הכל ←</button>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>לקוח</th><th>סכום</th><th>תאריך</th><th>סטטוס</th></tr></thead>
                    <tbody>
                      {orders.slice(0, 6).map(o => {
                        const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
                        return (
                          <tr key={o.id}>
                            <td><strong>{o.customerName || o.name || '—'}</strong></td>
                            <td>₪{o.total || 0}</td>
                            <td>{o.date ? new Date(o.date).toLocaleDateString('he-IL') : '—'}</td>
                            <td>
                              <span className={styles.badge} style={{ background: st.color, color: st.text }}>
                                {st.icon} {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.quickBox}>
                <h2 className={styles.boxTitle}>⚡ פעולות מהירות</h2>
                <div className={styles.quickActions}>
                  <button className={styles.quickBtn} onClick={() => navigate('/add-product')}>
                    <span className={styles.quickIcon}>➕</span>
                    <span className={styles.quickLabel}>הוסף מוצר חדש</span>
                    <span className={styles.quickArrow}>←</span>
                  </button>
                  <button className={styles.quickBtn} onClick={() => setTab('orders')}>
                    <span className={styles.quickIcon}>📋</span>
                    <span className={styles.quickLabel}>נהל הזמנות</span>
                    {pendingCount > 0 && <span className={styles.quickBadge}>{pendingCount}</span>}
                    <span className={styles.quickArrow}>←</span>
                  </button>
                  <button className={styles.quickBtn} onClick={() => setTab('design')}>
                    <span className={styles.quickIcon}>🎨</span>
                    <span className={styles.quickLabel}>שנה עיצוב האתר</span>
                    <span className={styles.quickArrow}>←</span>
                  </button>
                  <button className={styles.quickBtn} onClick={() => { setActive(true); navigate('/home'); }}>
                    <span className={styles.quickIcon}>✏️</span>
                    <span className={styles.quickLabel}>עריכה חיה על האתר</span>
                    <span className={styles.quickArrow}>←</span>
                  </button>
                  <button className={styles.quickBtn} onClick={() => setTab('settings')}>
                    <span className={styles.quickIcon}>⚙️</span>
                    <span className={styles.quickLabel}>הגדרות חנות</span>
                    <span className={styles.quickArrow}>←</span>
                  </button>
                </div>

                <div className={styles.topProductBox}>
                  <div className={styles.topProductLabel}>🏆 המוצר הנמכר ביותר</div>
                  <div className={styles.topProductName}>{topProduct}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className={styles.content}>
            <div className={styles.toolbar}>
              <input className={styles.search} placeholder="🔍 חיפוש לקוח או מזהה..."
                value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
              <button className={styles.exportBtn} onClick={exportCSV}>
                📅 ייצוא Excel
              </button>
              <div className={styles.revenueChip}>💰 סה"כ: ₪{totalRevenue.toLocaleString()}</div>
            </div>
            <div className={styles.filterTabs} style={{ marginBottom: '16px' }}>
              {[['all','הכל'], ['pending','ממתין'], ['confirmed','אושר'], ['preparing','בהכנה'], ['delivered','נשלח'], ['cancelled','בוטל']].map(([val, lbl]) => (
                <button key={val}
                  className={`${styles.filterTab} ${orderFilter === val ? styles.filterActive : ''}`}
                  onClick={() => setOrderFilter(val)}>
                  {lbl}
                  <span className={styles.filterCount}>
                    {val === 'all' ? orders.length : orders.filter(o => (o.status || 'pending') === val).length}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>מזהה</th><th>לקוח</th><th>פריטים</th><th>סכום</th><th>תאריך</th><th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => {
                    const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
                    return (
                      <tr key={o.id}>
                        <td><code className={styles.orderId}>#{String(o.id).slice(-6)}</code></td>
                        <td><strong>{o.customerName || o.name || `משתמש ${o.userId}`}</strong></td>
                        <td>
                          <span className={styles.itemsChip}>{(o.items || []).length} פריטים</span>
                        </td>
                        <td><strong className={styles.price}>₪{o.total || 0}</strong></td>
                        <td className={styles.dateCell}>{o.date ? new Date(o.date).toLocaleDateString('he-IL') : '—'}</td>
                        <td>
                          <select className={styles.statusSelect}
                            value={o.status || 'pending'}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            style={{ background: st.color, color: st.text }}>
                            {Object.entries(STATUS_MAP).map(([k, v]) => (
                              <option key={k} value={k}>{v.icon} {v.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className={styles.content}>
            <div className={styles.toolbar}>
              <input className={styles.search} placeholder="🔍 חיפוש לפי שם או קטגוריה..."
                value={searchProduct} onChange={e => setSearchProduct(e.target.value)} />
              <span className={styles.countChip}>{filteredProducts.length} מוצרים</span>
              {selectedProducts.size > 0 && (
                <button className={styles.deleteManyBtn} onClick={deleteSelected}>
                  🗑️ מחק {selectedProducts.size} נבחרים
                </button>
              )}
              <button className={styles.addBtn} onClick={() => navigate('/add-product')}>➕ הוסף מוצר</button>
            </div>

            {Object.keys(catStats).length > 0 && (
              <div className={styles.catStatsRow}>
                {Object.entries(catStats).map(([cat, count]) => (
                  <div key={cat} className={styles.catStatChip}
                    onClick={() => setSearchProduct(cat)}>
                    <span className={styles.catStatName}>{cat}</span>
                    <span className={styles.catStatCount}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            {editProduct && (
              <div className={styles.editOverlay}>
                <div className={styles.editCard}>
                  <div className={styles.editHeader}>
                    <h3>✏️ עריכת מוצר</h3>
                    <button className={styles.closeBtn} onClick={() => setEditProduct(null)}>✕</button>
                  </div>
                  {editProduct.image && (
                    <img src={editProduct.image} alt="" className={styles.imgPreview}
                      onError={e => e.target.style.display = 'none'} />
                  )}
                  <div className={styles.editGrid}>
                    {[
                      { key: 'name', label: 'שם המוצר' },
                      { key: 'price', label: 'מחיר (₪)', type: 'number' },
                      { key: 'stock', label: 'כמות במלאי', type: 'number' },
                      { key: 'category', label: 'קטגוריה' },
                      { key: 'image', label: 'קישור לתמונה' },
                    ].map(({ key, label, type = 'text' }) => (
                      <div key={key}>
                        <label className={styles.label}>{label}</label>
                        <input type={type} className={styles.input} value={editProduct[key] || ''}
                          onChange={e => setEditProduct(p => ({ ...p, [key]: type === 'number' ? +e.target.value : e.target.value }))} />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1/-1' }}>
                      <label className={styles.label}>תיאור</label>
                      <textarea className={styles.textarea} value={editProduct.description || ''}
                        onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label className={styles.label}>תגיות</label>
                      <div className={styles.tagRow}>
                        {[['isNew','✨ חדש'],['isHot','🔥 חם'],['isSale','🏷️ מבצע']].map(([key, lbl]) => (
                          <label key={key} className={`${styles.tagToggle} ${editProduct[key] ? styles.tagActive : ''}`}>
                            <input type="checkbox" checked={!!editProduct[key]}
                              onChange={e => setEditProduct(p => ({ ...p, [key]: e.target.checked }))}
                              style={{ display: 'none' }} />
                            {lbl}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.editActions}>
                    <button className={styles.cancelBtn} onClick={() => setEditProduct(null)}>ביטול</button>
                    <button className={styles.saveBtn} onClick={saveProduct}>💾 שמור שינויים</button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th><input type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll} /></th>
                    <th>תמונה</th><th>שם</th><th>קטגוריה</th><th>מחיר</th><th>מלאי</th><th>תגיות</th><th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ background: selectedProducts.has(p.id) ? '#fef3e2' : '' }}>
                      <td><input type="checkbox"
                        checked={selectedProducts.has(p.id)}
                        onChange={() => toggleSelect(p.id)} /></td>
                      <td>
                        <img src={p.image} alt={p.name} className={styles.thumb}
                          onError={e => e.target.src = 'https://via.placeholder.com/48'} />
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className={styles.catBadge}>{p.category}</span></td>
                      <td><strong>₪{p.price}</strong></td>
                      <td>
                        <span className={p.stock > 10 ? styles.inStock : p.stock > 0 ? styles.lowStock : styles.outStock}>
                          {p.stock > 10 ? `✅ ${p.stock}` : p.stock > 0 ? `⚠️ ${p.stock}` : '❌ אזל'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {p.isNew  && <span className={styles.tagNew}>✨ חדש</span>}
                          {p.isHot  && <span className={styles.tagHot}>🔥 חם</span>}
                          {p.isSale && <span className={styles.tagSale}>🏷️ מבצע</span>}
                          {!p.isNew && !p.isHot && !p.isSale && <span style={{ color: '#9ca3af', fontSize: '12px' }}>אין</span>}
                        </div>
                      </td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => setEditProduct({ ...p })}>✏️ ערוך</button>
                        <button className={styles.deleteBtn} onClick={() => deleteProduct(p.id)}>🗑️ מחק</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className={styles.content}>
            <div className={styles.toolbar}>
              <input className={styles.search} placeholder="🔍 חיפוש לפי שם או אימייל..."
                value={searchUser} onChange={e => setSearchUser(e.target.value)} />
              <span className={styles.countChip}>{filteredUsers.length} משתמשים</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>משתמש</th><th>אימייל</th><th>טלפון</th><th>תפקיד</th><th>פעולות</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                          <div>
                            <div><strong>{u.firstName} {u.lastName}</strong></div>
                            {u.id === user?.id && <div className={styles.youTag}>אתה</div>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className={u.isAdmin ? styles.adminBadgeTag : styles.userBadgeTag}>
                          {u.isAdmin ? '👑 מנהל' : '👤 משתמש'}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => toggleAdmin(u)}>
                          {u.isAdmin ? '👤 הסר מנהל' : '👑 הפוך למנהל'}
                        </button>
                        {u.id !== user?.id && (
                          <button className={styles.deleteBtn} onClick={() => deleteUser(u.id)}>🗑️ מחק</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DESIGN */}
        {tab === 'design' && (
          <div className={styles.content}>
            <div className={styles.infoBar}>
              💡 שינויים כאן ישפיעו על עמוד הבית. לעריכת כל טקסט באתר — השתמש ב<button className={styles.inlineBtn} onClick={() => { setActive(true); navigate('/home'); }}>עריכה חיה ✏️</button>
            </div>
            <div className={styles.designGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🦸 Hero — עמוד הבית</h3>
                <label className={styles.label}>אמוג'י Hero</label>
                <input className={styles.input} value={settings.heroEmoji}
                  onChange={e => setSettings(s => ({ ...s, heroEmoji: e.target.value }))} />
                <label className={styles.label}>כותרת ראשית</label>
                <input className={styles.input} value={settings.heroTitle}
                  onChange={e => setSettings(s => ({ ...s, heroTitle: e.target.value }))} />
                <label className={styles.label}>תת-כותרת</label>
                <input className={styles.input} value={settings.heroSubtitle}
                  onChange={e => setSettings(s => ({ ...s, heroSubtitle: e.target.value }))} />
                <label className={styles.label}>YouTube Video ID</label>
                <input className={styles.input} value={settings.heroVideoId}
                  onChange={e => setSettings(s => ({ ...s, heroVideoId: e.target.value }))} />
                <p className={styles.hint}>מהקישור youtube.com/watch?v=<strong>ID</strong> — קח רק את ה-ID</p>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🎨 צבעי האתר</h3>
                {[
                  { key: 'primaryColor', label: 'צבע ראשי — כפתורים' },
                  { key: 'secondaryColor', label: 'צבע משני — כותרות' },
                  { key: 'accentColor', label: 'צבע הדגשה — hover' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label className={styles.label}>{label}</label>
                    <div className={styles.colorInputRow}>
                      <input type="color" value={settings[key]}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className={styles.colorPicker} />
                      <input className={styles.input} value={settings[key]}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🗂️ סקשן קטגוריות</h3>
                <label className={styles.label}>כותרת</label>
                <input className={styles.input} value={settings.categoriesTitle}
                  onChange={e => setSettings(s => ({ ...s, categoriesTitle: e.target.value }))} />
                <label className={styles.label}>תת-כותרת</label>
                <input className={styles.input} value={settings.categoriesSubtitle}
                  onChange={e => setSettings(s => ({ ...s, categoriesSubtitle: e.target.value }))} />
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>👁️ תצוגה מקדימה</h3>
                <div style={{
                  background: `linear-gradient(135deg, ${settings.secondaryColor}cc, ${settings.primaryColor}99)`,
                  borderRadius: '16px', padding: '28px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '44px' }}>{settings.heroEmoji}</div>
                  <h2 style={{ color: 'white', fontSize: '20px', margin: '8px 0', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {settings.heroTitle}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 16px', fontSize: '13px' }}>{settings.heroSubtitle}</p>
                  <button style={{
                    background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.primaryColor})`,
                    color: 'white', border: 'none', padding: '8px 24px',
                    borderRadius: '50px', fontWeight: '700', cursor: 'pointer',
                  }}>צפה בתפריט →</button>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {['primaryColor', 'secondaryColor', 'accentColor'].map(k => (
                    <div key={k} style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: settings[k], border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }} title={settings[k]} />
                  ))}
                  <span style={{ fontSize: '12px', color: '#9ca3af', marginRight: '4px' }}>פלטת הצבעים</span>
                </div>
              </div>
            </div>
            <div className={styles.saveBar}>
              <button className={styles.resetBtn} onClick={() => setSettings(savedSettings)}>↺ בטל שינויים</button>
              <button className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
                {saving ? '⏳ שומר...' : '💾 שמור הגדרות'}
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className={styles.content}>
            <div className={styles.designGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🚚 הגדרות משלוח</h3>
                <label className={styles.label}>עלות משלוח (₪)</label>
                <input type="number" className={styles.input} value={settings.deliveryCost}
                  onChange={e => setSettings(s => ({ ...s, deliveryCost: +e.target.value }))} />
                <label className={styles.label}>משלוח חינם מ- (₪)</label>
                <input type="number" className={styles.input} value={settings.freeDeliveryFrom}
                  onChange={e => setSettings(s => ({ ...s, freeDeliveryFrom: +e.target.value }))} />
                <label className={styles.label}>מינימום הזמנה (₪)</label>
                <input type="number" className={styles.input} value={settings.minOrder}
                  onChange={e => setSettings(s => ({ ...s, minOrder: +e.target.value }))} />
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>📞 פרטי קשר ושעות</h3>
                <label className={styles.label}>טלפון</label>
                <input className={styles.input} value={settings.phone}
                  onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
                <label className={styles.label}>כתובת</label>
                <input className={styles.input} value={settings.address}
                  onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} />
                <label className={styles.label}>שעות פעילות</label>
                <input className={styles.input} value={settings.openHours}
                  onChange={e => setSettings(s => ({ ...s, openHours: e.target.value }))} />
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🎟️ קופון הנחה</h3>
                <p className={styles.hint} style={{ marginBottom: '12px' }}>הגדר קוד קופון שלקוחות יוכלו להזין בקופה</p>
                <label className={styles.label}>קוד קופון</label>
                <input className={styles.input} value={settings.couponCode}
                  placeholder="לדוגמה: SAVE10"
                  onChange={e => setSettings(s => ({ ...s, couponCode: e.target.value.toUpperCase() }))} />
                <label className={styles.label}>אחוז הנחה (%)</label>
                <input type="number" className={styles.input} value={settings.couponDiscount} min="1" max="100"
                  onChange={e => setSettings(s => ({ ...s, couponDiscount: +e.target.value }))} />
                {settings.couponCode && (
                  <div className={styles.couponPreview}>
                    🎟️ קוד <strong>{settings.couponCode}</strong> = {settings.couponDiscount}% הנחה
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>📊 סיכום הגדרות</h3>
                <div className={styles.summaryList}>
                  <div className={styles.summaryRow}><span>משלוח</span><strong>₪{settings.deliveryCost}</strong></div>
                  <div className={styles.summaryRow}><span>משלוח חינם מ-</span><strong>₪{settings.freeDeliveryFrom}</strong></div>
                  <div className={styles.summaryRow}><span>מינימום הזמנה</span><strong>₪{settings.minOrder}</strong></div>
                  <div className={styles.summaryRow}><span>טלפון</span><strong>{settings.phone}</strong></div>
                  <div className={styles.summaryRow}><span>שעות</span><strong>{settings.openHours}</strong></div>
                  {settings.couponCode && (
                    <div className={styles.summaryRow}><span>קופון פעיל</span><strong>{settings.couponCode} ({settings.couponDiscount}%)</strong></div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.saveBar}>
              <button className={styles.resetBtn} onClick={() => setSettings(savedSettings)}>↺ בטל שינויים</button>
              <button className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
                {saving ? '⏳ שומר...' : '💾 שמור הגדרות'}
              </button>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div className={styles.content}>
            <div className={styles.toolbar}>
              <span className={styles.countChip}>{reviews.length} ביקורות</span>
              <span className={styles.revenueChip}>
                ⭐ דירוג ממוצע: {reviews.length ? (reviews.reduce((s,r) => s + (r.rating||0), 0) / reviews.length).toFixed(1) : 'אין'}
              </span>
            </div>
            {reviews.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⭐</div>
                <div className={styles.emptyText}>אין ביקורות עדיין</div>
              </div>
            ) : (
              <div className={styles.reviewsGrid}>
                {reviews.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewUser}>
                        <div className={styles.avatar}>{(r.userName || r.name || '?')[0]}</div>
                        <div>
                          <div className={styles.reviewName}>{r.userName || r.name || 'אנונימי'}</div>
                          <div className={styles.reviewDate}>{r.date ? new Date(r.date).toLocaleDateString('he-IL') : ''}</div>
                        </div>
                      </div>
                      <div className={styles.reviewStars}>
                        {'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                      </div>
                    </div>
                    {r.productName && <div className={styles.reviewProduct}>📦 {r.productName}</div>}
                    <p className={styles.reviewText}>{r.comment || r.text || ''}</p>
                    <button className={styles.deleteBtn} style={{ marginTop: '8px' }}
                      onClick={() => deleteReview(r.id)}>🗑️ מחק ביקורת</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
