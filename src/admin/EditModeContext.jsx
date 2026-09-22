import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../api/api';

const Ctx = createContext(null);
export const useEditMode = () => useContext(Ctx);

const PAGES = [
  { path: '/home',     label: '🏠 דף הבית' },
  { path: '/catalog',  label: '🍽️ תפריט' },
  { path: '/cart',     label: '🛒 עגלה' },
  { path: '/profile',  label: '👤 פרופיל' },
  { path: '/orders',   label: '📦 הזמנות' },
  { path: '/wishlist', label: '❤️ מועדפים' },
];

const PANEL_SECTIONS = [
  {
    id: 'hero', label: '🦸 Hero', fields: [
      { key: 'heroEmoji',    label: 'אמוג׳י',          type: 'text' },
      { key: 'heroTitle',    label: 'כותרת ראשית',      type: 'text' },
      { key: 'heroSubtitle', label: 'תת-כותרת',         type: 'text' },
      { key: 'heroTagline',  label: 'טקסט קטן',         type: 'text' },
      { key: 'heroBtnText',  label: 'כפתור ראשי',       type: 'text' },
      { key: 'heroBtn2Text', label: 'כפתור משני',       type: 'text' },
      { key: 'heroVideoId',  label: 'YouTube Video ID', type: 'text' },
      { key: 'heroBgImage',  label: 'תמונת רקע Hero',   type: 'image' },
    ]
  },
  {
    id: 'categories', label: '🗂️ קטגוריות', fields: [
      { key: 'categoriesTitle',    label: 'כותרת סקשן',        type: 'text' },
      { key: 'categoriesSubtitle', label: 'תת-כותרת',          type: 'text' },
      { key: 'featuredLabel',      label: 'תווית פופולרי',     type: 'text' },
      { key: 'featuredBadge',      label: 'Badge קטגוריות',    type: 'text' },
      { key: 'allCatsLabel',       label: 'תווית שאר קטגוריות',type: 'text' },
    ]
  },
  {
    id: 'catManager', label: '🗂️ ניהול קטגוריות', fields: []
  },
  {
    id: 'catImages', label: '🖼️ קטגוריות', fields: [
      { key: 'catName_פיצות',             label: '🍕 פיצות — שם',             type: 'text' },
      { key: 'catImg_פיצות',              label: '🍕 פיצות — תמונה',            type: 'image' },
      { key: 'catName_פסטות',             label: '🍝 פסטות — שם',             type: 'text' },
      { key: 'catImg_פסטות',              label: '🍝 פסטות — תמונה',            type: 'image' },
      { key: 'catName_סושי',              label: '🍣 סושי — שם',              type: 'text' },
      { key: 'catImg_סושי',               label: '🍣 סושי — תמונה',             type: 'image' },
      { key: 'catName_דגים',              label: '🐟 דגים — שם',              type: 'text' },
      { key: 'catImg_דגים',               label: '🐟 דגים — תמונה',             type: 'image' },
      { key: 'catName_מנות גבינות',       label: '🧀 מנות גבינות — שם',       type: 'text' },
      { key: 'catImg_מנות גבינות',        label: '🧀 מנות גבינות — תמונה',       type: 'image' },
      { key: "catName_בוקר ובראנץ'",      label: "🥞 בוקר ובראנץ' — שם",      type: 'text' },
      { key: "catImg_בוקר ובראנץ'",       label: "🥞 בוקר ובראנץ' — תמונה",      type: 'image' },
      { key: 'catName_סלטים',             label: '🥗 סלטים — שם',             type: 'text' },
      { key: 'catImg_סלטים',              label: '🥗 סלטים — תמונה',            type: 'image' },
      { key: 'catName_מרקים',             label: '🍲 מרקים — שם',             type: 'text' },
      { key: 'catImg_מרקים',              label: '🍲 מרקים — תמונה',            type: 'image' },
      { key: 'catName_כריכים ולחמים',     label: '🥙 כריכים ולחמים — שם',     type: 'text' },
      { key: 'catImg_כריכים ולחמים',      label: '🥙 כריכים ולחמים — תמונה',     type: 'image' },
      { key: 'catName_קינוחים',           label: '🍰 קינוחים — שם',           type: 'text' },
      { key: 'catImg_קינוחים',            label: '🍰 קינוחים — תמונה',           type: 'image' },
      { key: 'catName_בר יין וקוקטיילים', label: '🍷 בר יין וקוקטיילים — שם', type: 'text' },
      { key: 'catImg_בר יין וקוקטיילים', label: '🍷 בר יין וקוקטיילים — תמונה', type: 'image' },
      { key: 'catName_שתייה',             label: '☕ שתייה — שם',             type: 'text' },
      { key: 'catImg_שתייה',              label: '☕ שתייה — תמונה',            type: 'image' },
    ]
  },
  {
    id: 'colors', label: '🎨 צבעים', fields: [
      { key: 'primaryColor',   label: 'צבע ראשי',     type: 'color' },
      { key: 'secondaryColor', label: 'צבע משני',     type: 'color' },
      { key: 'accentColor',    label: 'צבע הדגשה',    type: 'color' },
      { key: 'bgColor',        label: 'רקע האתר',     type: 'color' },
      { key: 'navbarColor',    label: 'Navbar צבע 1', type: 'color' },
      { key: 'navbarColor2',   label: 'Navbar צבע 2', type: 'color' },
    ]
  },
  {
    id: 'navbar', label: '🧭 Navbar', fields: [
      { key: 'navbarBrand',    label: 'שם האתר',        type: 'text' },
      { key: 'navbarGreeting', label: 'טקסט ברכה',      type: 'text' },
      { key: 'logoutText',     label: 'כפתור התנתקות',  type: 'text' },
      { key: 'cartLabel',      label: 'תווית סל קניות', type: 'text' },
      { key: 'wishlistLabel',  label: 'תווית מועדפים',  type: 'text' },
    ]
  },
  {
    id: 'catalog', label: '🍽️ תפריט', fields: [
      { key: 'catalogTitle',       label: 'כותרת עמוד תפריט',    type: 'text' },
      { key: 'catalogSubtitle',    label: 'תת-כותרת תפריט',      type: 'text' },
      { key: 'catalogBtnBack',     label: 'כפתור חזרה',          type: 'text' },
      { key: 'catalogBgFrom',      label: 'רקע כותרת - צבע 1',   type: 'color' },
      { key: 'catalogBgTo',        label: 'רקע כותרת - צבע 2',   type: 'color' },
      { key: 'catalogBtnDetails',  label: 'כפתור צפה בפרטים',    type: 'text' },
      { key: 'catalogBtnAddCart',  label: 'כפתור הוסף לסל',      type: 'text' },
      { key: 'catalogBtnAdded',    label: 'כפתור נוסף לסל',      type: 'text' },
      { key: 'catalogBadgeNew',    label: 'Badge חדש',            type: 'text' },
      { key: 'catalogBadgeHot',    label: 'Badge פופולרי',        type: 'text' },
      { key: 'catalogEmptyText',   label: 'טקסט אין מנות',       type: 'text' },
      { key: 'catalogSearchLabel', label: 'placeholder חיפוש',   type: 'text' },
    ]
  },
  {
    id: 'cart', label: '🛒 עגלה', fields: [
      { key: 'cartTitle',        label: 'כותרת עגלה',          type: 'text' },
      { key: 'cartEmptyTitle',   label: 'כותרת עגלה ריקה',     type: 'text' },
      { key: 'cartEmptyText',    label: 'טקסט עגלה ריקה',      type: 'text' },
      { key: 'cartSummaryTitle', label: 'כותרת סיכום',         type: 'text' },
      { key: 'cartCheckoutBtn',  label: 'כפתור תשלום',         type: 'text' },
      { key: 'cartContinueBtn',  label: 'כפתור המשך קניה',     type: 'text' },
      { key: 'cartRemoveBtn',    label: 'כפתור הסר פריט',      type: 'text' },
    ]
  },
  {
    id: 'checkout', label: '💳 תשלום', fields: [
      { key: 'checkoutTitle',        label: 'כותרת עמוד תשלום',      type: 'text' },
      { key: 'checkoutStep1',        label: 'שלב 1 — שם',            type: 'text' },
      { key: 'checkoutStep2',        label: 'שלב 2 — שם',            type: 'text' },
      { key: 'checkoutStep3',        label: 'שלב 3 — שם',            type: 'text' },
      { key: 'checkoutBtnNext',      label: 'כפתור המשך',            type: 'text' },
      { key: 'checkoutBtnBack',      label: 'כפתור חזור',            type: 'text' },
      { key: 'checkoutBtnPlace',     label: 'כפתור בצע הזמנה',       type: 'text' },
      { key: 'checkoutFreeShipping', label: 'סף משלוח חינם (₪)',     type: 'text' },
      { key: 'checkoutShippingCost', label: 'עלות משלוח (₪)',        type: 'text' },
      { key: 'checkoutFreeLabel',    label: 'טקסט משלוח חינם',       type: 'text' },
      { key: 'checkoutSuccessTitle', label: 'כותרת הצלחה',           type: 'text' },
      { key: 'checkoutSuccessBtn',   label: 'כפתור חזור לחנות',      type: 'text' },
    ]
  },
  {
    id: 'wishlist', label: '❤️ מועדפים', fields: [
      { key: 'wishlistTitle',      label: 'כותרת מועדפים',        type: 'text' },
      { key: 'wishlistEmptyTitle', label: 'כותרת ריק',            type: 'text' },
      { key: 'wishlistEmptyText',  label: 'טקסט ריק',             type: 'text' },
      { key: 'wishlistShopBtn',    label: 'כפתור לחנות',          type: 'text' },
      { key: 'wishlistAddCart',    label: 'כפתור הוסף לסל',       type: 'text' },
    ]
  },
  {
    id: 'orders', label: '📦 הזמנות', fields: [
      { key: 'ordersTitle',      label: 'כותרת הזמנות',      type: 'text' },
      { key: 'ordersEmptyTitle', label: 'כותרת אין הזמנות',  type: 'text' },
      { key: 'ordersEmptyText',  label: 'טקסט אין הזמנות',   type: 'text' },
      { key: 'ordersShopBtn',    label: 'כפתור לחנות',       type: 'text' },
    ]
  },
  {
    id: 'profile', label: '👤 פרופיל', fields: [
      { key: 'profileEditTitle', label: 'כותרת עריכת פרטים', type: 'text' },
      { key: 'profileSaveBtn',   label: 'כפתור שמירה',       type: 'text' },
      { key: 'profileBgFrom',    label: 'רקע כרטיס - צבע 1', type: 'color' },
      { key: 'profileBgTo',      label: 'רקע כרטיס - צבע 2', type: 'color' },
    ]
  },
  {
    id: 'buildbox', label: '🎁 מארז', fields: [
      { key: 'buildboxTitle',     label: 'כותרת',               type: 'text' },
      { key: 'buildboxSubtitle',  label: 'תת-כותרת',            type: 'text' },
      { key: 'buildboxMin',       label: 'מינימום מנות',         type: 'text' },
      { key: 'buildboxMax',       label: 'מקסימום מנות',         type: 'text' },
      { key: 'buildboxDiscount',  label: 'אחוז הנחה',            type: 'text' },
      { key: 'buildboxBtn',       label: 'כפתור הוסף מארז',      type: 'text' },
      { key: 'buildboxNameLabel', label: 'תווית שם מארז',        type: 'text' },
      { key: 'buildboxEmptyText', label: 'טקסט רשימה ריקה',      type: 'text' },
    ]
  },
  {
    id: 'review', label: '⭐ ביקורות', fields: [
      { key: 'reviewTitle',        label: 'כותרת הוסף ביקורת',   type: 'text' },
      { key: 'reviewRatingLabel',  label: 'תווית דירוג',          type: 'text' },
      { key: 'reviewCommentLabel', label: 'תווית טקסט',           type: 'text' },
      { key: 'reviewPlaceholder',  label: 'Placeholder טקסט',     type: 'text' },
      { key: 'reviewSubmitBtn',    label: 'כפתור שלח',            type: 'text' },
      { key: 'reviewCancelBtn',    label: 'כפתור ביטול',          type: 'text' },
      { key: 'reviewSectionTitle', label: 'כותרת סקשן ביקורות',   type: 'text' },
      { key: 'reviewEmptyText',    label: 'טקסט אין ביקורות',     type: 'text' },
    ]
  },
  {
    id: 'addproduct', label: '➕ הוסף מוצר', fields: [
      { key: 'addProductTitle',    label: 'כותרת',                type: 'text' },
      { key: 'addProductSubtitle', label: 'תת-כותרת',             type: 'text' },
      { key: 'addProductBtn',      label: 'כפתור הוסף',           type: 'text' },
      { key: 'addProductCancel',   label: 'כפתור ביטול',          type: 'text' },
    ]
  },
  {
    id: 'paragraphs', label: '📝 פסקאות', fields: []
  },
  {
    id: 'notfound', label: '🔍 404', fields: [
      { key: 'notFoundEmoji', label: 'אמוגי',         type: 'text' },
      { key: 'notFoundTitle', label: 'כותרת',         type: 'text' },
      { key: 'notFoundText',  label: 'טקסט',          type: 'text' },
      { key: 'notFoundBtn',   label: 'כפתור חזור',    type: 'text' },
    ]
  },
  {
    id: 'general', label: '📄 כללי', fields: [
      { key: 'siteName',       label: 'שם האתר',    type: 'text' },
      { key: 'siteTagline',    label: 'סלוגן',      type: 'text' },
      { key: 'contactPhone',   label: 'טלפון',      type: 'text' },
      { key: 'contactEmail',   label: 'אימייל',     type: 'text' },
      { key: 'contactAddress', label: 'כתובת',      type: 'text' },
      { key: 'openingHours',   label: 'שעות פתיחה', type: 'text' },
    ]
  },
];

export function EditModeProvider({ children }) {
  const [active, setActive] = useState(false);
  const [settings, setSettings] = useState({});
  const [popup, setPopup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [highlight, setHighlight] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSection, setPanelSection] = useState('hero');

  useEffect(() => {
    adminAPI.getSettings().then(r => setSettings(r.data || {})).catch(() => {});
  }, []);

  const save = useCallback(async (key, val) => {
    if (settings[key] === val) { setPopup(null); return; }
    setHistory(h => [...h, { key, val: settings[key] }]);
    setSettings(s => ({ ...s, [key]: val }));
    setPopup(null);
    setSaving(true);
    try { await adminAPI.updateSettings({ [key]: val }); } catch {}
    setSaving(false);
  }, [settings]);

  const undo = useCallback(() => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setSettings(s => ({ ...s, [last.key]: last.val }));
    setHistory(h => h.slice(0, -1));
    adminAPI.updateSettings({ [last.key]: last.val }).catch(() => {});
  }, [history]);

  const resetAll = useCallback(async () => {
    if (!window.confirm('לאפס את כל השינויים?')) return;
    const res = await adminAPI.getSettings();
    setSettings(res.data || {});
    setHistory([]);
  }, []);

  const editable = useCallback((key, type = 'text') => {
    if (!active) return {};
    return {
      'data-editable': key,
      onClick: (e) => {
        e.stopPropagation();
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setPopup({ key, value: settings[key] ?? '', type, rect });
      },
      style: highlight ? { cursor: 'pointer' } : {},
      onMouseEnter: highlight ? e => { e.currentTarget.style.outline = '2px dashed #c8622a'; e.currentTarget.style.outlineOffset = '3px'; e.currentTarget.style.borderRadius = '4px'; } : undefined,
      onMouseLeave: highlight ? e => { e.currentTarget.style.outline = ''; e.currentTarget.style.outlineOffset = ''; } : undefined,
      title: '✏️ לחץ לעריכה',
    };
  }, [active, settings, highlight]);

  return (
    <Ctx.Provider value={{ active, setActive, settings, editable, save, undo, resetAll, saving, history, highlight, setHighlight, panelOpen, setPanelOpen, setPanelSection }}>
      {children}
      {active && <EditToolbar saving={saving} history={history} undo={undo} resetAll={resetAll} setActive={setActive} highlight={highlight} setHighlight={setHighlight} panelOpen={panelOpen} setPanelOpen={setPanelOpen} />}
      {active && <EditPanel open={panelOpen} section={panelSection} setSection={setPanelSection} settings={settings} onSave={save} saving={saving} />}
      {popup && <EditPopup popup={popup} onSave={save} onClose={() => setPopup(null)} saving={saving} />}
      {active && <style>{`[data-editable]:hover { outline: 2px dashed #c8622a !important; outline-offset: 3px !important; border-radius: 4px !important; }`}</style>}
    </Ctx.Provider>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function EditToolbar({ saving, history, undo, resetAll, setActive, highlight, setHighlight, panelOpen, setPanelOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pagesOpen, setPagesOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: 'linear-gradient(90deg,#0f172a,#1e1208,#0f172a)', borderBottom: '2px solid #c8622a44', padding: '0 16px', height: '52px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.6)', direction: 'rtl' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
        <span style={{ color: 'white', fontWeight: '800', fontSize: '13px' }}>עריכה חיה</span>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

      <button onClick={() => setPanelOpen(o => !o)} style={{ background: panelOpen ? 'linear-gradient(135deg,#c8622a,#e8a87c)' : 'rgba(255,255,255,0.1)', border: `1px solid ${panelOpen ? '#c8622a' : 'rgba(255,255,255,0.2)'}`, color: 'white', padding: '5px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
        ⚙️ פאנל עריכה {panelOpen ? '◀' : '▶'}
      </button>

      <div style={{ position: 'relative' }}>
        <button onClick={() => setPagesOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '5px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
          🗺️ ניווט ▾
        </button>
        {pagesOpen && (
          <div style={{ position: 'absolute', top: '36px', right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', minWidth: '180px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 100 }}>
            {PAGES.map(p => (
              <button key={p.path} onClick={() => { navigate(p.path); setPagesOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'right', background: location.pathname === p.path ? 'rgba(200,98,42,0.2)' : 'transparent', border: 'none', color: location.pathname === p.path ? '#e8a87c' : 'rgba(255,255,255,0.8)', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: location.pathname === p.path ? '700' : '500' }}>{p.label}</button>
            ))}
          </div>
        )}
      </div>

      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{PAGES.find(p => p.path === location.pathname)?.label || location.pathname}</span>

      <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {saving && <span style={{ color: '#fcd34d', fontSize: '12px', fontWeight: '600' }}>⏳ שומר...</span>}

<button onClick={undo} disabled={!history.length} style={{ background: history.length ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: history.length ? 'white' : 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '8px', cursor: history.length ? 'pointer' : 'default', fontSize: '12px', fontWeight: '600' }}>
          ↶ בטל {history.length > 0 && `(${history.length})`}
        </button>

        <button onClick={resetAll} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>↺ אפס</button>

        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>⚙️ ניהול</button>

        <button onClick={() => setActive(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '5px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>✕ סגור</button>
      </div>
    </div>
  );
}

// ── Side Panel ────────────────────────────────────────────────────────────────
function EditPanel({ open, section, setSection, settings, onSave, saving }) {
  const [localVals, setLocalVals] = useState({});
  const [saved, setSaved] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => { setLocalVals({}); setSaved({}); setSearch(''); }, [section]);

  const getValue = (key) => key in localVals ? localVals[key] : (settings[key] ?? '');
  const handleChange = (key, val) => setLocalVals(p => ({ ...p, [key]: val }));

  const handleSave = async (key) => {
    await onSave(key, localVals[key] ?? settings[key] ?? '');
    setSaved(p => ({ ...p, [key]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [key]: false })), 1500);
  };

  const handleSaveAll = async () => {
    for (const [key, val] of Object.entries(localVals)) await onSave(key, val);
    setLocalVals({});
  };

  const currentSection = PANEL_SECTIONS.find(s => s.id === section);
  const visibleFields = search
    ? currentSection?.fields.filter(f => f.label.includes(search) || f.key.includes(search))
    : currentSection?.fields;
  const hasChanges = Object.keys(localVals).length > 0;

  if (!open) return null;

  const inp = { padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s' };

  return (
    <div style={{ position: 'fixed', top: '52px', right: 0, bottom: 0, width: '480px', background: '#0d1117', borderLeft: '1px solid rgba(200,98,42,0.25)', zIndex: 99998, display: 'flex', boxShadow: '-12px 0 48px rgba(0,0,0,0.5)', direction: 'rtl' }}>

      {/* Sidebar tabs */}
      <div style={{ width: '140px', flexShrink: 0, background: '#161b22', borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px 6px', gap: '2px' }}>
        {PANEL_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: '10px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: section === s.id ? '700' : '500',
            border: 'none', cursor: 'pointer', textAlign: 'right', lineHeight: '1.4',
            background: section === s.id ? 'linear-gradient(135deg,#c8622a,#e8a87c)' : 'transparent',
            color: section === s.id ? 'white' : 'rgba(255,255,255,0.55)',
            transition: 'all 0.15s',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>{PANEL_SECTIONS.find(s => s.id === section)?.label}</span>
          {section !== 'paragraphs' && section !== 'catManager' && (
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 חיפוש..."
              style={{ flex: 1, padding: '7px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
          )}
        </div>

        {/* Fields */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {section === 'paragraphs' && <ParagraphsEditor settings={settings} onSave={onSave} />}
          {section === 'catManager' && <CatManager settings={settings} onSave={onSave} />}
          {section !== 'paragraphs' && section !== 'catManager' && visibleFields?.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>אין תוצאות</p>
          )}
          {visibleFields?.map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                {field.label}
              </label>
              {field.type === 'color' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" value={getValue(field.key) || '#c8622a'} onChange={e => handleChange(field.key, e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '2px', background: 'none', flexShrink: 0 }} />
                  <input value={getValue(field.key)} onChange={e => handleChange(field.key, e.target.value)}
                    style={{ ...inp, flex: 1, width: 'auto' }} />
                  <SaveBtn onClick={() => handleSave(field.key)} saved={saved[field.key]} />
                </div>
              )}
              {field.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={getValue(field.key)} onChange={e => handleChange(field.key, e.target.value)} placeholder="https://..."
                      style={{ ...inp, flex: 1, width: 'auto' }} />
                    <SaveBtn onClick={() => handleSave(field.key)} saved={saved[field.key]} />
                  </div>
                  {getValue(field.key) && (
                    <img src={getValue(field.key)} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }} onError={e => e.target.style.display = 'none'} />
                  )}
                </div>
              )}
              {field.type === 'text' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={getValue(field.key)} onChange={e => handleChange(field.key, e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave(field.key)}
                    style={{ ...inp, flex: 1, width: 'auto' }} />
                  <SaveBtn onClick={() => handleSave(field.key)} saved={saved[field.key]} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save all bar */}
        {hasChanges && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#161b22' }}>
            <button onClick={handleSaveAll} disabled={saving} style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#c8622a,#e8a87c)', color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,98,42,0.4)' }}>
              {saving ? '⏳ שומר...' : `💾 שמור הכל — ${Object.keys(localVals).length} שינויים`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PageParagraphs({ page, slot }) {
  const { settings } = useEditMode() || {};
  try {
    const paras = JSON.parse(settings?.paragraphs || '[]').filter(p => p.page === page && (p.slot || 'bottom') === slot);
    if (!paras.length) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '32px 0' }}>
        {paras.map((p, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '28px 32px', boxShadow: '0 4px 16px rgba(200,98,42,0.08)', border: '2px solid #f0e0cc' }}>
            {p.title && <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#3b1a08', margin: '0 0 10px' }}>{p.title}</h2>}
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>{p.text}</p>
          </div>
        ))}
      </div>
    );
  } catch { return null; }
}

const PAGE_OPTIONS = [
  { value: 'home',     label: '🏠 דף הבית',  slots: [{ value: 'after_hero', label: 'אחרי ה-Hero' }, { value: 'after_categories', label: 'אחרי הקטגוריות' }, { value: 'bottom', label: 'תחתית העמוד' }] },
  { value: 'catalog',  label: '🍽️ תפריט',   slots: [{ value: 'top', label: 'מעל המוצרים' }, { value: 'bottom', label: 'תחתית העמוד' }] },
  { value: 'cart',     label: '🛒 עגלה',     slots: [{ value: 'top', label: 'ראש העמוד' }, { value: 'bottom', label: 'תחתית העמוד' }] },
  { value: 'orders',   label: '📦 הזמנות',   slots: [{ value: 'top', label: 'ראש העמוד' }, { value: 'bottom', label: 'תחתית העמוד' }] },
  { value: 'profile',  label: '👤 פרופיל',   slots: [{ value: 'top', label: 'ראש העמוד' }, { value: 'bottom', label: 'תחתית העמוד' }] },
  { value: 'wishlist', label: '❤️ מועדפים',  slots: [{ value: 'top', label: 'ראש העמוד' }, { value: 'bottom', label: 'תחתית העמוד' }] },
];

function ParagraphsEditor({ settings, onSave }) {
  const parseParagraphs = () => { try { return JSON.parse(settings.paragraphs || '[]'); } catch { return []; } };
  const [paragraphs, setParagraphs] = useState(parseParagraphs);
  const [editing, setEditing] = useState(null);

  useEffect(() => { setParagraphs(parseParagraphs()); }, [settings.paragraphs]);

  const persist = async (updated) => {
    setParagraphs(updated);
    await onSave('paragraphs', JSON.stringify(updated));
  };

  const handleSave = async () => {
    if (!editing) return;
    const { _new, idx, ...data } = editing;
    const updated = _new ? [...paragraphs, data] : paragraphs.map((p, i) => i === idx ? data : p);
    await persist(updated);
    setEditing(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('למחוק פסקאה זו?')) return;
    await persist(paragraphs.filter((_, i) => i !== idx));
  };

  const inputStyle = { width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
  const currentPageSlots = PAGE_OPTIONS.find(o => o.value === editing?.page)?.slots || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button onClick={() => setEditing({ _new: true, title: '', text: '', page: 'home', slot: 'bottom' })}
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(200,98,42,0.5)', background: 'rgba(200,98,42,0.08)', color: '#e8a87c', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
        ➕ הוסף פסקאה
      </button>

      {editing && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(200,98,42,0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>עמוד</label>
          <select value={editing.page} onChange={e => setEditing(p => ({ ...p, page: e.target.value, slot: PAGE_OPTIONS.find(o => o.value === e.target.value)?.slots[0]?.value || 'bottom' }))}
            style={{ ...inputStyle, background: '#1e293b' }}>
            {PAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>מיקום בעמוד</label>
          <select value={editing.slot || 'bottom'} onChange={e => setEditing(p => ({ ...p, slot: e.target.value }))}
            style={{ ...inputStyle, background: '#1e293b' }}>
            {currentPageSlots.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>כותרת</label>
          <input value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} style={inputStyle} placeholder="כותרת הפסקאה..." />
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>טקסט</label>
          <textarea value={editing.text} onChange={e => setEditing(p => ({ ...p, text: e.target.value }))} rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} placeholder="תוכן הפסקאה..." />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '12px' }}>ביטול</button>
            <button onClick={handleSave} style={{ flex: 2, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#c8622a,#e8a87c)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>💾 שמור</button>
          </div>
        </div>
      )}

      {paragraphs.length === 0 && !editing && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>אין פסקאות עדיין</p>
      )}

      {paragraphs.map((p, i) => {
        const pageLabel = PAGE_OPTIONS.find(o => o.value === p.page)?.label || p.page;
        const slotLabel = PAGE_OPTIONS.find(o => o.value === p.page)?.slots.find(s => s.value === p.slot)?.label || p.slot || 'תחתית';
        return (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: '#e8a87c', fontWeight: '700', background: 'rgba(200,98,42,0.15)', padding: '2px 8px', borderRadius: '50px' }}>{pageLabel}</span>
                  <span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: '700', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '50px' }}>{slotLabel}</span>
                </div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '13px', margin: '0 0 4px' }}>{p.title || <em style={{ color: 'rgba(255,255,255,0.3)' }}>ללא כותרת</em>}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, lineHeight: '1.5', maxHeight: '36px', overflow: 'hidden' }}>{p.text}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginRight: '8px' }}>
                <button onClick={() => setEditing({ idx: i, ...p })} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                <button onClick={() => handleDelete(i)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DEFAULT_CATS = [
  { name: 'פיצות',             img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80', desc: 'פיצות איטלקיות אותנטיות', emoji: '🍕', featured: true },
  { name: 'פסטות',             img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80', desc: 'פסטות איטלקיות קלאסיות', emoji: '🍝', featured: true },
  { name: 'סושי',              img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', desc: 'סושי טרי ומגוון', emoji: '🍣', featured: true },
  { name: 'דגים',              img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', desc: 'דגים טריים ומנות ים', emoji: '🐟' },
  { name: 'מנות גבינות',       img: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&q=80', desc: 'גבינות מובחרות ומנות חלביות', emoji: '🧀' },
  { name: "בוקר ובראנץ'",      img: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80', desc: 'ארוחות בוקר עשירות', emoji: '🥞' },
  { name: 'סלטים',             img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', desc: 'סלטים טריים ומרעננים', emoji: '🥗' },
  { name: 'מרקים',             img: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&q=80', desc: 'מרקים חמים וטעימים', emoji: '🍲' },
  { name: 'כריכים ולחמים',     img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80', desc: 'כריכים ביתיים ולחמים טריים', emoji: '🥙' },
  { name: 'קינוחים',           img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80', desc: 'קינוחים מפנקים ומתוקים', emoji: '🍰' },
  { name: 'בר יין וקוקטיילים', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80', desc: 'יינות מובחרים וקוקטיילים', emoji: '🍷' },
  { name: 'שתייה',             img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', desc: 'משקאות קרים וחמים', emoji: '☕' },
];

function CatManager({ settings, onSave }) {
  const parseCats = () => {
    try { return JSON.parse(settings.categories || 'null') || DEFAULT_CATS; }
    catch { return DEFAULT_CATS; }
  };
  const [cats, setCats] = useState(parseCats);
  const [editing, setEditing] = useState(null); // null | { idx, ...cat } | { _new, ...cat }
  const [saving, setSaving] = useState(false);

  useEffect(() => { setCats(parseCats()); }, [settings.categories]);

  const persist = async (updated) => {
    setSaving(true);
    setCats(updated);
    await onSave('categories', JSON.stringify(updated));
    setSaving(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    const { _new, idx, ...data } = editing;
    const updated = _new ? [...cats, data] : cats.map((c, i) => i === idx ? data : c);
    await persist(updated);
    setEditing(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('למחוק קטגוריה זו?')) return;
    await persist(cats.filter((_, i) => i !== idx));
  };

  const move = async (idx, dir) => {
    const updated = [...cats];
    const swap = idx + dir;
    if (swap < 0 || swap >= updated.length) return;
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]];
    await persist(updated);
  };

  const toggleFeatured = async (idx) => {
    const updated = cats.map((c, i) => i === idx ? { ...c, featured: !c.featured } : c);
    await persist(updated);
  };

  const inp = { width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ background: 'rgba(200,98,42,0.1)', border: '1px solid rgba(200,98,42,0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#e8a87c', lineHeight: '1.6' }}>
        💡 שנה שם, תמונה, אמוג'י וסדר קטגוריות. קטגוריות מסומנות כבולטות מופיעות גדולות בראש.
      </div>

      <button onClick={() => setEditing({ _new: true, name: '', img: '', desc: '', emoji: '🍽️', featured: false })}
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(200,98,42,0.5)', background: 'rgba(200,98,42,0.08)', color: '#e8a87c', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
        ➕ הוסף קטגוריה
      </button>

      {editing && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(200,98,42,0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>שם קטגוריה</label>
              <input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="פיצות..." />
            </div>
            <div style={{ width: '64px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>אמוג'י</label>
              <input value={editing.emoji} onChange={e => setEditing(p => ({ ...p, emoji: e.target.value }))} style={{ ...inp, textAlign: 'center', fontSize: '20px' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>תמונה (URL)</label>
            <input value={editing.img} onChange={e => setEditing(p => ({ ...p, img: e.target.value }))} style={inp} placeholder="https://..." />
            {editing.img && <img src={editing.img} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '6px' }} onError={e => e.target.style.display='none'} />}
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>תיאור קצר</label>
            <input value={editing.desc} onChange={e => setEditing(p => ({ ...p, desc: e.target.value }))} style={inp} placeholder="תיאור קצר..." />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!editing.featured} onChange={e => setEditing(p => ({ ...p, featured: e.target.checked }))}
              style={{ width: '16px', height: '16px', accentColor: '#c8622a' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>⭐ מוצג בולט (גדול בראש)</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '12px' }}>ביטול</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#c8622a,#e8a87c)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
              {saving ? '⏳...' : '💾 שמור'}
            </button>
          </div>
        </div>
      )}

      {cats.map((cat, idx) => (
        <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}>
            {cat.img && <img src={cat.img} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
            {!cat.img && <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{cat.emoji}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{cat.emoji} {cat.name}</span>
                {cat.featured && <span style={{ fontSize: '10px', background: 'rgba(200,98,42,0.3)', color: '#e8a87c', padding: '1px 6px', borderRadius: '50px', fontWeight: '700' }}>⭐ בולט</span>}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: idx === 0 ? 'rgba(255,255,255,0.2)' : 'white', width: '26px', height: '26px', borderRadius: '6px', cursor: idx === 0 ? 'default' : 'pointer', fontSize: '12px' }}>↑</button>
              <button onClick={() => move(idx, 1)} disabled={idx === cats.length - 1} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: idx === cats.length - 1 ? 'rgba(255,255,255,0.2)' : 'white', width: '26px', height: '26px', borderRadius: '6px', cursor: idx === cats.length - 1 ? 'default' : 'pointer', fontSize: '12px' }}>↓</button>
              <button onClick={() => toggleFeatured(idx)} style={{ background: cat.featured ? 'rgba(200,98,42,0.3)' : 'rgba(255,255,255,0.06)', border: 'none', color: cat.featured ? '#e8a87c' : 'rgba(255,255,255,0.5)', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>⭐</button>
              <button onClick={() => setEditing({ idx, ...cat })} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
              <button onClick={() => handleDelete(idx)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', background: saved ? '#16a34a' : 'linear-gradient(135deg,#c8622a,#e8a87c)', color: 'white', flexShrink: 0, transition: 'background 0.2s' }}>
      {saved ? '✓' : '💾'}
    </button>
  );
}

// ── Popup ─────────────────────────────────────────────────────────────────────
function EditPopup({ popup, onSave, onClose, saving }) {
  const [val, setVal] = useState(popup.value ?? '');
  const changed = val !== (popup.value ?? '');

  const LABEL_MAP = {
    heroTitle: 'כותרת ראשית', heroSubtitle: 'תת-כותרת', heroEmoji: 'אמוג׳י Hero',
    heroBtnText: 'כפתור ראשי', heroBtn2Text: 'כפתור משני', heroTagline: 'טקסט קטן',
    categoriesTitle: 'כותרת קטגוריות', categoriesSubtitle: 'תת-כותרת קטגוריות',
    primaryColor: 'צבע ראשי', secondaryColor: 'צבע משני', accentColor: 'צבע הדגשה',
  };
  const label = LABEL_MAP[popup.key] || popup.key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99997, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 99998, background: 'white', borderRadius: '24px', padding: '28px',
        boxShadow: '0 32px 100px rgba(0,0,0,0.4)', width: '420px', maxWidth: 'calc(100vw - 32px)',
        border: '2px solid #e8a87c55', direction: 'rtl',
        animation: 'popupIn 0.2s cubic-bezier(0.34,1.56,0.64,1)'
      }} onClick={e => e.stopPropagation()}>

        <style>{`@keyframes popupIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.9); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>✏️ {label}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>לחץ שמור או Enter לאישור</div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>

        {/* Input */}
        {popup.type === 'color' ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f9fafb', borderRadius: '14px', padding: '12px' }}>
            <input type="color" value={val} onChange={e => setVal(e.target.value)}
              style={{ width: '56px', height: '56px', border: 'none', borderRadius: '12px', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <input value={val} onChange={e => setVal(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: val, marginTop: '8px', border: '1px solid #e5e7eb' }} />
            </div>
          </div>
        ) : popup.type === 'image' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input value={val} onChange={e => setVal(e.target.value)} placeholder="https://images.unsplash.com/..."
              style={{ width: '100%', padding: '13px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', direction: 'ltr' }} />
            {val
              ? <img src={val} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb' }} onError={e => { e.target.style.display='none'; }} />
              : <div style={{ width: '100%', height: '100px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>תצוגה מקדימה תופיע כאן</div>
            }
          </div>
        ) : (
          <textarea value={val} onChange={e => setVal(e.target.value)}
            rows={val.length > 80 ? 5 : 3} autoFocus onFocus={e => e.target.select()}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && popup.type !== 'textarea') { e.preventDefault(); onSave(popup.key, val); } }}
            style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', direction: 'rtl', lineHeight: '1.7', transition: 'border-color 0.2s' }}
            onFocusCapture={e => e.target.style.borderColor = '#c8622a'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', background: '#f3f4f6', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151' }}>ביטול</button>
          <button onClick={() => onSave(popup.key, val)} disabled={saving || !changed}
            style={{ flex: 2, padding: '13px', background: changed ? 'linear-gradient(135deg,#e8a87c,#c8622a)' : '#e5e7eb', border: 'none', borderRadius: '12px', cursor: changed ? 'pointer' : 'default', color: changed ? 'white' : '#9ca3af', fontWeight: '700', fontSize: '15px', transition: 'all 0.2s', boxShadow: changed ? '0 4px 16px rgba(200,98,42,0.35)' : 'none' }}>
            {saving ? '⏳ שומר...' : '💾 שמור'}
          </button>
        </div>
      </div>
    </>
  );
}
