import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { IslandProgress } from '../types';
import backButtonImg from '../assets/universal/back button.png';

import { PROFILE_ICONS, getProfileIconData } from '../utils/profileIcons';

const ISLAND_LABELS: Record<string, string> = {
  jogja:  '🏝️ Jogja',
  bali:   '🌺 Bali',
  aceh:   '🕌 Aceh',
  maluku: '🐚 Maluku',
};

const REGION_ORDER: (keyof IslandProgress)[] = ['jogja', 'bali', 'aceh', 'maluku'];

function ProfileIconAvatar({ icon, size = 64 }: { icon: string; size?: number }) {
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

export function ProfileScreen() {
  const {
    setScreen,
    username,
    profileIcon,
    setProfileIcon,
    islandProgress,
    regionBestScores,
    totalBestScore,
    totalSessions,
    totalMerges,
    totalQuizzesCorrect,
    totalQuizzesAnswered,
    unlockedRecipes,
  } = useGameStore();

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const quizAccuracy = totalQuizzesAnswered > 0
    ? Math.round((totalQuizzesCorrect / totalQuizzesAnswered) * 100)
    : 0;

  const completedIslands = REGION_ORDER.filter(r => islandProgress[r]).length;

  const handlePickIcon = async (name: string) => {
    setSaving(true);
    await setProfileIcon(name);
    setSaving(false);
    setShowIconPicker(false);
  };

  return (
    <div className="profile-screen" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="leaderboard-pedia-bg"></div>
      <div className="leaderboard-pedia-overlay"></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
      <div className="profile-header">
        <button
          type="button"
          className="map-back-minimal"
          onClick={() => setScreen('mainMenu')}
          aria-label="Kembali"
          id="btn-back-profile"
        >
          <img src={backButtonImg} alt="Back" className="map-back-icon-img" />
        </button>
        <h1 className="profile-title">{username}</h1>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        {/* Avatar + change button */}
        <div className="profile-avatar-wrap">
          <ProfileIconAvatar icon={profileIcon} size={90} />
          <button
            className="profile-change-icon-btn"
            onClick={() => setShowIconPicker(true)}
            id="btn-change-icon"
          >
            ✏️ Ganti Ikon
          </button>
        </div>


        {/* Island progress row */}
        <div className="profile-islands">
          {REGION_ORDER.map(r => (
            <div key={r} className={`profile-island-chip ${islandProgress[r] ? 'done' : 'locked'}`}>
              <span className="pchip-label">{ISLAND_LABELS[r]}</span>
              <span className="pchip-status">{islandProgress[r] ? '✅' : '🔒'}</span>
              <span className="pchip-score">{regionBestScores[r] > 0 ? regionBestScores[r].toLocaleString('id-ID') : '–'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="profile-stats">
        <div className="pstat-card pstat-total-score">
          <div className="pstat-icon">🏆</div>
          <div className="pstat-value">{totalBestScore.toLocaleString('id-ID')}</div>
          <div className="pstat-label">Total Skor</div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon">🏝️</div>
          <div className="pstat-value">{completedIslands}/4</div>
          <div className="pstat-label">Pulau Selesai</div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon">🎮</div>
          <div className="pstat-value">{totalSessions}</div>
          <div className="pstat-label">Total Main</div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon">⚡</div>
          <div className="pstat-value">{totalMerges}</div>
          <div className="pstat-label">Total Gabungan</div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon">🧠</div>
          <div className="pstat-value">{quizAccuracy}%</div>
          <div className="pstat-label">Akurasi Kuis</div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon">📖</div>
          <div className="pstat-value">{unlockedRecipes.length}</div>
          <div className="pstat-label">Resep Terbuka</div>
        </div>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <div className="profile-picker-overlay" onClick={() => setShowIconPicker(false)}>
          <div className="profile-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="picker-header">
              <h2 className="picker-title">Pilih Ikon Kulinermu</h2>
              <button className="picker-close-btn" onClick={() => setShowIconPicker(false)}>✕</button>
            </div>
            <div className="picker-grid">
              {PROFILE_ICONS.map(ic => (
                <button
                  key={ic.name}
                  className={`picker-item ${profileIcon === ic.name ? 'picker-item--selected' : ''}`}
                  onClick={() => handlePickIcon(ic.name)}
                  disabled={saving}
                  title={ic.name}
                >
                  <div className={`picker-emoji-bg ${ic.bgClass}`}>
                    <img src={ic.imagePath} alt={ic.name} className="picker-emoji-img" />
                  </div>
                  <span className="picker-name">{ic.name}</span>
                </button>
              ))}
            </div>
            {saving && <p className="picker-saving">Menyimpan...</p>}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
