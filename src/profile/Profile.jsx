import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { usersAPI } from '../api/api';
import { updateUser, addToast } from '../store/store';
import { useEditMode, PageParagraphs } from '../admin/EditModeContext';

const PRIMARY = '#c8622a';

const validationSchema = Yup.object({
  firstName: Yup.string().min(2, 'לפחות 2 תווים').required('שדה חובה'),
  lastName: Yup.string().min(2, 'לפחות 2 תווים').required('שדה חובה'),
  email: Yup.string().email('אימייל לא תקין').required('שדה חובה'),
  phone: Yup.string().matches(/^05[0-9]-?[0-9]{7}$/, 'טלפון לא תקין').required('שדה חובה'),
  address: Yup.string().min(5, 'לפחות 5 תווים').required('שדה חובה'),
});

const inputStyle = {
  width: '100%', padding: '13px 16px', border: '2px solid #e8d5c4',
  borderRadius: '12px', fontSize: '15px', outline: 'none',
  boxSizing: 'border-box', background: 'white', color: '#1f2937',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#6b3a1f', marginBottom: '6px',
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const { active, settings: liveS, panelOpen, editable } = useEditMode() || {};
  const s = liveS || {};
  const ed = editable || (() => ({}));

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await usersAPI.updateUser(user.id, values);
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        dispatch(updateUser(updatedUser));
        dispatch(addToast({ type: 'success', message: 'הפרטים עודכנו בהצלחה! ✅' }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: 'שגיאה בעדכון הפרטים' }));
    }
    setSubmitting(false);
  };

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f0', padding: '40px 24px', paddingTop: active ? '92px' : '40px', paddingRight: active && panelOpen ? '480px' : '24px', transition: 'padding-right 0.3s' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* כרטיס פרופיל עליון */}
        <div style={{
          background: `linear-gradient(135deg, ${s.profileBgFrom || '#3b1a08'} 0%, ${s.profileBgTo || '#c8622a'} 100%)`,
          borderRadius: '24px', padding: '40px', marginBottom: '28px',
          boxShadow: '0 15px 35px rgba(139,58,26,0.25)',
          display: 'flex', alignItems: 'center', gap: '24px',
        }}>
          {/* אווטאר */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: 'white', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: '0 0 4px' }}>
              {user.firstName} {user.lastName}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 10px' }}>
              {user.email}
            </p>
            <span style={{
              background: user.isAdmin ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.15)',
              border: `1px solid ${user.isAdmin ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.3)'}`,
              color: user.isAdmin ? '#fbbf24' : 'white',
              padding: '4px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '600',
            }}>
              {user.isAdmin ? '👑 מנהל מערכת' : '👤 משתמש'}
            </span>
          </div>
        </div>

        <PageParagraphs page="profile" slot="top" />

        {/* טופס עריכה */}
        <div style={{
          background: 'white', borderRadius: '24px', padding: '36px',
          boxShadow: '0 4px 20px rgba(200,98,42,0.1)', border: '2px solid #f0e0cc',
        }}>
          <h2 {...ed('profileEditTitle')} style={{ fontSize: '20px', fontWeight: '800', color: '#3b1a08', margin: '0 0 28px' }}>
            {s.profileEditTitle || 'עריכת פרטים'}
          </h2>

          <Formik
            initialValues={{
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
              address: user.address || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form style={{ display: 'grid', gap: '20px' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>שם פרטי</label>
                    <Field name="firstName" style={inputStyle} />
                    <ErrorMessage name="firstName" component="div" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>שם משפחה</label>
                    <Field name="lastName" style={inputStyle} />
                    <ErrorMessage name="lastName" component="div" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>אימייל</label>
                  <Field type="email" name="email" style={inputStyle} />
                  <ErrorMessage name="email" component="div" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>טלפון</label>
                    <Field name="phone" placeholder="050-1234567" style={inputStyle} />
                    <ErrorMessage name="phone" component="div" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>כתובת</label>
                    <Field name="address" style={inputStyle} />
                    <ErrorMessage name="address" component="div" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%', marginTop: '8px',
                    background: isSubmitting ? '#e5e7eb' : 'linear-gradient(135deg, #e8a87c, #c8622a)',
                    color: isSubmitting ? '#9ca3af' : 'white',
                    padding: '14px', borderRadius: '12px', border: 'none',
                    fontSize: '16px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(200,98,42,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSubmitting ? 'שומר...' : <span {...ed('profileSaveBtn')}>{s.profileSaveBtn || 'שמור שינויים'}</span>}
                </button>
              </Form>
            )}
          </Formik>
        </div>
        <PageParagraphs page="profile" slot="bottom" />
      </div>
    </div>
  );
};

export default Profile;
