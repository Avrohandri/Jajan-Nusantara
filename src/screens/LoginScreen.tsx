import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import menuBackground from '../assets/menu/background.png';

export function LoginScreen() {
  const { register, login, authError, authLoading, setAuthError } = useGameStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const errorMessage =
    authError === 'USERNAME_TAKEN'
      ? 'Username sudah digunakan, pilih username lain.'
      : authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setAuthError(null);

    if (mode === 'register') {
      if (username.trim().length < 3) {
        setAuthError('Username minimal 3 karakter.');
        return;
      }
      if (password.length < 6) {
        setAuthError('Password minimal 6 karakter.');
        return;
      }
      await register(username.trim(), password);
    } else {
      await login(username.trim(), password);
    }
    // Jika berhasil, store otomatis set isLoggedIn → App.tsx render MainMenu
  };

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setAuthError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-screen">
      {/* Background */}
      <div className="login-bg">
        <img src={menuBackground} alt="" className="login-bg-img" />
        <div className="login-bg-overlay" />
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Logo / title */}
        <div className="login-header">
          <span className="login-logo-emoji">🍡</span>
          <h1 className="login-title">Jajan Nusantara</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-field">
            <label htmlFor="login-username" className="login-label">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder="Masukkan username..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={authLoading}
              autoComplete="off"
              maxLength={20}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder={mode === 'register' ? 'Minimal 6 karakter...' : 'Masukkan password...'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={authLoading}
              autoComplete="new-password"
            />
          </div>

          {/* Error notification */}
          {errorMessage && (
            <div className="login-error" role="alert">
              ⚠️ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={authLoading || !username.trim() || !password}
            id="btn-login-submit"
          >
            {authLoading ? (
              <span className="login-loading-dots">
                <span /><span /><span />
              </span>
            ) : mode === 'login' ? (
              'Masuk'
            ) : (
              'Daftar'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="login-toggle">
          {mode === 'login' ? (
            <>
              <span>Belum punya akun?</span>
              <button
                type="button"
                className="login-toggle-btn"
                onClick={switchMode}
                disabled={authLoading}
              >
                Daftar Sekarang
              </button>
            </>
          ) : (
            <>
              <span>Sudah punya akun?</span>
              <button
                type="button"
                className="login-toggle-btn"
                onClick={switchMode}
                disabled={authLoading}
              >
                Masuk
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
