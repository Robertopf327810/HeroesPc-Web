import { useState } from 'react';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Registro de nuevo cliente en POST /api/usuarios
        const res = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            email,
            password,
            telefono,
            direccion,
            rol: 'cliente',
          }),
        });
        const result = await res.json();

        if (!res.ok || result.success === false) {
          throw new Error(result.message || 'No se pudo registrar el usuario');
        }

        const nuevoUsuario = result.data || result;
        onLoginSuccess(nuevoUsuario);
        onClose();
      } else {
        // Inicio de sesión consultando GET /api/usuarios
        const res = await fetch(`${API_URL}/usuarios`);
        const usuarios = await res.json();

        const encontrado = Array.isArray(usuarios)
          ? usuarios.find(
              (u) =>
                u.email?.toLowerCase() === email.trim().toLowerCase() &&
                u.password === password
            )
          : null;

        if (!encontrado) {
          throw new Error('Correo o contraseña incorrectos');
        }

        onLoginSuccess(encontrado);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h3>{isRegister ? 'Crear Cuenta en HEROES PC' : 'Iniciar Sesión'}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Nombre completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Roberto Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Correo electrónico *</label>
            <input
              type="email"
              required
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contraseña *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  placeholder="443 123 4567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Dirección de envío</label>
                <input
                  type="text"
                  placeholder="Calle, número, colonia, ciudad"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading
              ? 'Procesando...'
              : isRegister
              ? 'Registrarme'
              : 'Entrar a mi cuenta'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
              >
                Inicia sesión
              </button>
            </p>
          ) : (
            <p>
              ¿Eres nuevo en HeroesPC?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
              >
                Crea una cuenta
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}