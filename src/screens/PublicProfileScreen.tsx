import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { UserProfile, IslandProgress } from '../types';
import backButtonImg from '../assets/universal/back button.png';
import { useSfx } from '../hooks/useSfx';
import { getProfileIconData } from '../utils/profileIcons';
import { getPublicProfile } from '../lib/db';

const ISLAND_LABELS: Record<string, string> = {
  jogja:  '🏝️ Jogja',
  bali:   '🌺 Bali',
  aceh:   '🕌 Aceh',
  maluku: '🐚 Maluku',
};

const REGION_ORDER: (keyof IslandProgress)[] = ['jogja', 'bali', 'aceh', 'maluku'];

function PublicProfileAvatar({ icon, size = 90 }: { icon: string; size?: number }) {
  const data = getProfileIconData(icon);
  return (
    <div
      className={`profile-avatar ${data.bgClass}`}
      style={{ width: size, height: size } as React.CSSProperties}
    >
      <img src={data.imagePath} alt={data.name} className="profile-avatar-img" />
    </div>
  );
}

export function PublicProfileScreen() {
  const { setScreen, viewingUserId } = useGameStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { playButtonClick } = useSfx();

  useEffect(() => {
    if (!viewingUserId) {
      setScreen('leaderboard');
      return;
    }
    getPublicProfile(viewingUserId).then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, [viewingUserId]);

  const handleBack = () => {
    playButtonClick();
    setScreen('leaderboard');
  };

  if (loading) {
    return (
      <div className="profile-screen" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="leaderboard-pedia-bg" />
        <div className="leaderboard-pedia-overlay" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-primary)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
            <p style={{ fontWeight: 700 }}>Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-screen" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="leaderboard-pedia-bg" />
        <div className="leaderboard-pedia-overlay" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="profile-header">
            <button
              type="button"
              className="map-back-minimal"
              onClick={handleBack}
              aria-label="Kembali"
              id="btn-back-pubprofile"
            >
              <img src={backButtonImg} alt="Back" className="map-back-icon-img" />
            </button>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-light)' }}>
            <div style={{ fontSize: 36 }}>😕</div>
            <p style={{ fontWeight: 700, marginTop: 8 }}>Profil tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  const quizAccuracy = (profile.totalQuizzesAnswered ?? 0) > 0
    ? Math.round(((profile.totalQuizzesCorrect ?? 0) / profile.totalQuizzesAnswered) * 100)
    : 0;

  const completedIslands = REGION_ORDER.filter(r => profile.islandProgress?.[r]).length;

  return (
    <div className="profile-screen" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="leaderboard-pedia-bg" />
      <div className="leaderboard-pedia-overlay" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="profile-header">
          <button
            type="button"
            className="map-back-minimal"
            onClick={handleBack}
            aria-label="Kembali ke Leaderboard"
            id="btn-back-pubprofile"
          >
            <img src={backButtonImg} alt="Back" className="map-back-icon-img" />
          </button>
          <h1 className="profile-title">{profile.username}</h1>
        </div>



        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            <PublicProfileAvatar icon={profile.profileIcon ?? 'Klepon'} size={90} />
            {/* No edit button for public profile */}
          </div>

          {/* Island progress */}
          <div className="profile-islands">
            {REGION_ORDER.map(r => (
              <div key={r} className={`profile-island-chip ${profile.islandProgress?.[r] ? 'done' : 'locked'}`}>
                <span className="pchip-label">{ISLAND_LABELS[r]}</span>
                <span className="pchip-status">{profile.islandProgress?.[r] ? '✅' : '🔒'}</span>
                <span className="pchip-score">
                  {(profile.regionBestScores?.[r] ?? 0) > 0
                    ? (profile.regionBestScores[r]).toLocaleString('id-ID')
                    : '–'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="profile-stats">
          <div className="pstat-card pstat-total-score">
            <div className="pstat-icon">🏆</div>
            <div className="pstat-value">{(profile.totalBestScore ?? 0).toLocaleString('id-ID')}</div>
            <div className="pstat-label">Total Skor</div>
          </div>
          <div className="pstat-card">
            <div className="pstat-icon">🏝️</div>
            <div className="pstat-value">{completedIslands}/4</div>
            <div className="pstat-label">Pulau Selesai</div>
          </div>
          <div className="pstat-card">
            <div className="pstat-icon">🎮</div>
            <div className="pstat-value">{profile.totalSessions ?? 0}</div>
            <div className="pstat-label">Total Main</div>
          </div>
          <div className="pstat-card">
            <div className="pstat-icon">⚡</div>
            <div className="pstat-value">{profile.totalMerges ?? 0}</div>
            <div className="pstat-label">Total Gabungan</div>
          </div>
          <div className="pstat-card">
            <div className="pstat-icon">🧠</div>
            <div className="pstat-value">{quizAccuracy}%</div>
            <div className="pstat-label">Akurasi Kuis</div>
          </div>
          <div className="pstat-card">
            <div className="pstat-icon">📖</div>
            <div className="pstat-value">{(profile.unlockedRecipes ?? []).length}</div>
            <div className="pstat-label">Resep Terbuka</div>
          </div>
        </div>

        {/* Last played info */}
        {profile.lastPlayedAt ? (
          <div className="pubprofile-lastplayed">
            <span className="pubprofile-lastplayed-icon">🕐</span>
            <span>
              Terakhir main:{' '}
              <strong>
                {new Date(profile.lastPlayedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
            </span>
          </div>
        ) : null}

        {/* Sync info jika belum pernah login ulang */}
        {(profile.totalSessions === 0 && profile.totalBestScore > 0) && (
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#8b6914', marginTop: '8px', padding: '0 16px', opacity: 0.8, fontStyle: 'italic' }}>
            *Data pulau & kuis akan tampil setelah pemain masuk kembali
          </div>
        )}
      </div>
    </div>
  );
}
