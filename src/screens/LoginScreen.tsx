import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import menuBackground from '../assets/menu/background.png';
import { useGlobalPreload } from '../hooks/useGlobalPreload';
import { useSfx } from '../hooks/useSfx';

export function LoginScreen() {
  const { register, login, authError, authLoading, setAuthError } = useGameStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const { playButtonClick } = useSfx();

  // Preload semua aset game di background saat halaman login tampil
  const { progress, done } = useGlobalPreload();

  const errorMessage =
    authError === 'USERNAME_TAKEN'
      ? 'Nama pengguna sudah digunakan, pilih nama lain.'
      : authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    if (!username.trim()) return;
    setAuthError(null);

    if (mode === 'register') {
      if (username.trim().length < 3) {
        setAuthError('Nama pengguna minimal 3 karakter.');
        return;
      }
      await register(username.trim());
    } else {
      await login(username.trim());
    }
    // Jika berhasil, store otomatis set isLoggedIn → App.tsx render MainMenu
  };

  const switchMode = () => {
    playButtonClick();
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setAuthError(null);
    setUsername('');
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
              Nama Pengguna
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder="Masukkan namamu..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={authLoading}
              autoComplete="off"
              maxLength={20}
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
            disabled={authLoading || !username.trim()}
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

        {/* Asset preload progress bar */}
        <div className="login-preload">
          <div className="login-preload-bar-wrap">
            <div
              className="login-preload-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="login-preload-label">
            {done
              ? '✅ Game siap dimainkan!'
              : `⏳ Memuat aset game… ${progress}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
