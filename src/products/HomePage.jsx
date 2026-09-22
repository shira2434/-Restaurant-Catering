import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { adminAPI } from '../api/api';
import { useSelector } from 'react-redux';
import { useEditMode, PageParagraphs } from '../admin/EditModeContext';

const DEFAULT = {
  heroTitle: "לה קוצ'ינה",
  heroSubtitle: 'קייטרינג חלבי איטלקי • מנות טריות מדי יום',
  heroEmoji: '☕',
  heroTagline: '✨ בחר קטגוריה וגלה את התפריט שלנו',
  heroBtnText: 'צפה בכל התפריט →',
  heroBtn2Text: 'גלה קטגוריות ↓',
  heroVideoId: 'Lcyeu2hUOeY',
  heroBgImage: '',
  primaryColor: '#c8622a',
  secondaryColor: '#3b1a08',
  accentColor: '#e8a87c',
  bgColor: '#fdf6f0',
  categoriesTitle: 'מה תרצה היום?',
  categoriesSubtitle: 'בחר קטגוריה לצפייה במנות',
  featuredLabel: '⭐ הכי פופולרי',
  featuredBadge: 'פופולרי 🔥',
  allCatsLabel: 'כל הקטגוריות',
};

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

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector(st => st.user.currentUser);
  const { active, settings: liveS, editable, panelOpen } = useEditMode() || {};
  const [base, setBase] = useState(DEFAULT);

  useEffect(() => {
    adminAPI.getSettings().then(res => {
      if (res.data && Object.keys(res.data).length > 0)
        setBase(prev => ({ ...prev, ...res.data }));
    }).catch(() => {});
  }, []);

  const s = active ? { ...base, ...liveS } : base;
  const liveCats = (() => { try { return JSON.parse(s.categories || 'null'); } catch { return null; } })();
  const allCats = liveCats || DEFAULT_CATS;
  const getCatImg = (cat) => cat.img || '';
  const getCatName = (cat) => s[`catName_${cat.name}`] || cat.name;
  const featured = allCats.filter(c => c.featured);
  const rest = allCats.filter(c => !c.featured);
  const goTo = (name) => { if (!active) navigate(`/catalog?category=${encodeURIComponent(name)}`); };

  return (
    <div style={{ minHeight: '100vh', background: s.bgColor || '#fdf6f0', paddingTop: active ? '52px' : 0, paddingRight: active && panelOpen ? '340px' : 0, transition: 'padding-right 0.3s' }}>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '80px 24px 60px', textAlign: 'center', overflow: 'hidden', minHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {s.heroBgImage ? (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.heroBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
        ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${s.heroVideoId}?autoplay=1&mute=1&loop=1&playlist=${s.heroVideoId}&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.5)', width: '100%', height: '100%', border: 'none', zIndex: 0, pointerEvents: 'none' }}
            allow="autoplay; encrypted-media; fullscreen" allowFullScreen
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${s.secondaryColor}88 0%, ${s.primaryColor}66 100%)`, zIndex: 1 }} />

        {active && (
          <button {...editable('heroBgImage', 'image')} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            🖼️ שנה רקע
          </button>
        )}

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div {...editable('heroEmoji')} style={{ fontSize: '64px', marginBottom: '16px', display: 'inline-block' }}>{s.heroEmoji}</div>
          <h1 {...editable('heroTitle')} style={{ fontSize: '56px', fontWeight: '800', color: 'white', margin: '0 0 12px', letterSpacing: '-1px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {s.heroTitle}
          </h1>
          <p {...editable('heroSubtitle')} style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', margin: '0 0 8px', fontWeight: '300' }}>
            {s.heroSubtitle}
          </p>
          <p {...editable('heroTagline')} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', margin: '0 0 36px' }}>
            {s.heroTagline}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { if (!active) navigate('/catalog'); }}
              style={{ background: `linear-gradient(135deg, ${s.accentColor}, ${s.primaryColor})`, color: 'white', border: 'none', padding: '14px 36px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 8px 24px ${s.primaryColor}80` }}>
              <span {...editable('heroBtnText')}>{s.heroBtnText}</span>
            </button>
            <button
              onClick={() => { if (!active) document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', padding: '14px 36px', borderRadius: '50px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              <span {...editable('heroBtn2Text')}>{s.heroBtn2Text}</span>
            </button>
          </div>
        </div>
      </div>

      {/* אחרי Hero */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <PageParagraphs page="home" slot="after_hero" />
      </div>

      {/* קטגוריות */}
      <div id="categories" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 {...editable('categoriesTitle')} style={{ fontSize: '36px', fontWeight: '800', color: s.secondaryColor, margin: '0 0 10px' }}>
            {s.categoriesTitle}
          </h2>
          <p {...editable('categoriesSubtitle')} style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>{s.categoriesSubtitle}</p>
          <div style={{ width: '60px', height: '4px', background: `linear-gradient(135deg, ${s.accentColor}, ${s.primaryColor})`, borderRadius: '2px', margin: '16px auto 0' }} />
        </div>

        {/* Featured */}
        <div style={{ marginBottom: '16px' }}>
          <p {...editable('featuredLabel')} style={{ fontSize: '13px', fontWeight: '700', color: s.primaryColor, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>{s.featuredLabel}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {featured.map(cat => (
              <div key={cat.name} onClick={() => goTo(cat.name)}
                style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '240px', cursor: active ? 'default' : 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', transition: 'transform 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.2)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
              >
                <img src={getCatImg(cat)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                {active && (
                  <button {...editable(`catImg_${cat.name}`, 'image')} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5, background: 'rgba(0,0,0,0.65)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                    🖼️ שנה תמונה
                  </button>
                )}
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', left: '20px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{cat.emoji}</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{getCatName(cat)}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{cat.desc}</p>
                </div>
                <div {...editable('featuredBadge')} style={{ position: 'absolute', top: '16px', left: '16px', background: `linear-gradient(135deg, ${s.accentColor}, ${s.primaryColor})`, color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '700' }}>{s.featuredBadge}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest */}
        <div style={{ marginTop: '32px' }}>
          <p {...editable('allCatsLabel')} style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>{s.allCatsLabel}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {rest.map(cat => (
              <div key={cat.name} onClick={() => goTo(cat.name)}
                style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '160px', cursor: active ? 'default' : 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'transform 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(200,98,42,0.25)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
              >
                <img src={getCatImg(cat)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                {active && (
                  <button {...editable(`catImg_${cat.name}`, 'image')} style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 5, background: 'rgba(0,0,0,0.65)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '600' }}>
                    🖼️
                  </button>
                )}
                <div style={{ position: 'absolute', bottom: '14px', right: '14px', left: '14px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>{cat.emoji}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{getCatName(cat)}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* אחרי קטגוריות */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <PageParagraphs page="home" slot="after_categories" />
      </div>

      {/* תחתית */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
        <PageParagraphs page="home" slot="bottom" />
      </div>
    </div>
  );
};

export default HomePage;
