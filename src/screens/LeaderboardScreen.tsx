import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLeaderboard } from '../lib/db';
import type { LeaderboardEntry } from '../types';
import backButtonImg from '../assets/universal/back button.png';
import peringkatJudul from '../assets/pedia/peringkat_judul.png';

const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

import { getProfileIconData } from '../utils/profileIcons';

function LeaderboardAvatar({ icon, size = 38 }: { icon: string; size?: number }) {
  const data = getProfileIconData(icon);
  return (
    <div
      className={`lb-avatar ${data.bgClass}`}
      style={{ width: size, height: size } as React.CSSProperties}
    >
      <img src={data.imagePath} alt={data.name} className="lb-avatar-img" />
    </div>
  );
}

export function LeaderboardScreen() {
  const { setScreen, userId } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="leaderboard-screen leaderboard-screen--pedia">
      {/* Pedia background */}
      <div className="leaderboard-pedia-bg" aria-hidden />
      <div className="leaderboard-pedia-overlay" />

      {/* Header */}
      <div className="leaderboard-header leaderboard-header--pedia">
        <button
          type="button"
          className="map-back-minimal"
          onClick={() => setScreen('mainMenu')}
          aria-label="Kembali ke menu"
          id="btn-back-leaderboard"
        >
          <img src={backButtonImg} alt="Back" className="map-back-icon-img" />
        </button>
        <img src={peringkatJudul} alt="Peringkat" className="leaderboard-judul-img" />
        <p className="leaderboard-subtitle">Total skor terbaik dari semua pulau</p>
      </div>

      {/* Table */}
      <div className="leaderboard-body leaderboard-body--pedia">
        {loading ? (
          <div className="leaderboard-loading">
            <span className="loading-emoji">⏳</span>
            <p>Memuat peringkat...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-empty">
            <span className="loading-emoji">🍡</span>
            <p>Belum ada data peringkat.</p>
            <p className="leaderboard-empty-sub">Mainkan Drop &amp; Merge untuk masuk leaderboard!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {/* Column headers */}
            <div className="leaderboard-row leaderboard-row--header">
              <span className="lb-rank">Rank</span>
              <span className="lb-avatar-col" />
              <span className="lb-name">Username</span>
              <span className="lb-score">Skor</span>
            </div>

            {entries.map(entry => {
              const isMe = entry.userId === userId;
              return (
                <div
                  key={entry.userId}
                  className={`leaderboard-row${isMe ? ' leaderboard-row--me' : ''}`}
                >
                  <span className="lb-rank">
                    {entry.rank <= 3
                      ? MEDAL_EMOJI[entry.rank - 1]
                      : `#${entry.rank}`}
                  </span>
                  <LeaderboardAvatar icon={entry.profileIcon ?? 'Klepon'} />
                  <span className="lb-name">
                    {entry.username}
                    {isMe && <span className="lb-me-badge"> (Kamu)</span>}
                  </span>
                  <span className="lb-score">
                    {entry.totalBestScore.toLocaleString('id-ID')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="leaderboard-legend">
        <p className="leaderboard-legend-text">
          ⬆️ Total skor = skor terbaik Jogja + Bali + Aceh + Maluku
        </p>
      </div>
    </div>
  );
}
