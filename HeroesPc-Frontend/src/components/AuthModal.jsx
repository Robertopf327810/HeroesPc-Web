import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, LogIn, UserPlus } from 'lucide-react';
import api from '../api/axiosClient';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasValidGoogleId =
    googleClientId && !googleClientId.startsWith('TU_CLIENT_ID');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('/usuarios', {
          nombre,
          apellido,
          correo,
          contraseña,
          rol: 'cliente',
        });
      }

      const { data } = await api.post('/usuarios/login', {
        correo,
        contraseña,
      });

      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'No se pudo iniciar sesión. Verifica tus datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/usuarios/google', {
        credential: credentialResponse.credential,
      });
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al autenticar con Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Respaldo local cuando no hay Client ID de Google Cloud configurado
  const handleLocalGoogleLogin = async () => {
    const emailInput = window.prompt(
      'Ingresa el correo de Google para continuar:',
      'cliente.google@gmail.com'
    );
    if (!emailInput || !emailInput.includes('@')) return;

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/usuarios/google', {
        devEmail: emailInput.trim(),
        devName: emailInput.split('@')[0],
      });
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al iniciar sesión con Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{isRegister ? 'Crear Cuenta HeroesPC' : 'Iniciar Sesión'}</h3>
          <button type="button" className="btn-close-drawer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="compat-box warn" style={{ marginBottom: '14px' }}>
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          {hasValidGoogleId ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('No se pudo conectar con Google OAuth')}
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          ) : (
            <button
              type="button"
              onClick={handleLocalGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
            marginBottom: '14px',
          }}
        >
          — o continúa con tu correo —
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input
                type="text"
                placeholder="Apellido"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            required
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-add-build-cart"
            style={{ marginTop: '4px' }}
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            <span>
              {loading
                ? 'Procesando...'
                : isRegister
                ? 'Registrarme y Entrar'
                : 'Entrar'}
            </span>
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.85rem' }}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ea580c',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </p>
      </div>
    </div>
  );
}