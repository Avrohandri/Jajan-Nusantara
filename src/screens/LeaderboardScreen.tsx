import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLeaderboard } from '../lib/db';
import type { LeaderboardEntry } from '../types';
import backButtonImg from '../assets/universal/back button.png';
import peringkatJudul from '../assets/pedia/peringkat_judul.png';
import { useSfx } from '../hooks/useSfx';

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

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Resolusi timestamp: skor > main > daftar
function resolveTimestamp(entry: LeaderboardEntry): { ts: number; type: 'score' | 'played' | 'joined' } | null {
  if (entry.lastScoreUpdatedAt) return { ts: entry.lastScoreUpdatedAt, type: 'score' };
  if (entry.lastPlayedAt) return { ts: entry.lastPlayedAt, type: 'played' };
  if (entry.accountCreatedAt) return { ts: entry.accountCreatedAt, type: 'joined' };
  return null;
}

export function LeaderboardScreen() {
  const { setScreen, userId, setViewingUserId } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { playButtonClick } = useSfx();

  useEffect(() => {
    getLeaderboard().then(data => { // Ambil top skor dari Firestore
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const handleRowClick = (entry: LeaderboardEntry, isMe: boolean) => {
    playButtonClick();
    if (isMe) {
      setScreen('profile');
    } else {
      setViewingUserId(entry.userId);
      setScreen('viewProfile');
    }
  };

  return (
    <div className="leaderboard-screen leaderboard-screen--pedia">
      {}
      <div className="leaderboard-pedia-bg" aria-hidden />
      <div className="leaderboard-pedia-overlay" />

      {}
      <div className="leaderboard-header leaderboard-header--pedia">
        <button
          type="button"
          className="map-back-minimal"
          onClick={() => { playButtonClick(); setScreen('mainMenu'); }}
          aria-label="Kembali ke menu"
          id="btn-back-leaderboard"
        >
          <img src={backButtonImg} alt="Kembali" className="map-back-icon-img" />
        </button>
        <img src={peringkatJudul} alt="Peringkat" className="leaderboard-judul-img" />
        <p className="leaderboard-subtitle">Total skor terbaik dari semua pulau</p>
      </div>

      {}
      <div className="leaderboard-body leaderboard-body--pedia">
        {loading ? (
          <div className="leaderboard-loading">
            <span className="loading-emoji">⏳</span>
            <p>Memuat rank...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-empty">
            <span className="loading-emoji">🍡</span>
            <p className="leaderboard-empty-sub">Mainkan Jajanan Gabung untuk masuk rank!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {}
            <div className="leaderboard-row leaderboard-row--header">
              <span className="lb-rank">Rank</span>
              <span className="lb-avatar-col" />
              <span className="lb-name">Nama Pengguna</span>
              <span className="lb-score">Skor</span>
            </div>

            {entries.map(entry => {
              const isMe = entry.userId === userId;
              const tsInfo = resolveTimestamp(entry);
              return (
                <div
                  key={entry.userId}
                  className={`leaderboard-row leaderboard-row--clickable${isMe ? ' leaderboard-row--me' : ''}`}
                  onClick={() => handleRowClick(entry, isMe)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat profil ${entry.username}`}
                  onKeyDown={e => e.key === 'Enter' && handleRowClick(entry, isMe)}
                >
                  <span className="lb-rank">
                    {entry.rank <= 3
                      ? MEDAL_EMOJI[entry.rank - 1]
                      : `#${entry.rank}`}
                  </span>
                  <LeaderboardAvatar icon={entry.profileIcon ?? 'Klepon'} />
                  <div className="lb-row-inner">
                    <span className="lb-name">
                      {entry.username}
                      {isMe && <span className="lb-me-badge"> (Kamu)</span>}
                    </span>
                    {tsInfo ? (
                      <span className={`lb-timestamp${tsInfo.type === 'joined' ? ' lb-timestamp--joined' : ''}`}>
                        {tsInfo.type === 'joined' ? '🗓️ Bergabung ' : '📅 '}
                        {formatTimestamp(tsInfo.ts)}
                      </span>
                    ) : (
                      <span className="lb-timestamp lb-timestamp--none">📅 Belum diperbarui</span>
                    )}
                  </div>
                  <span className="lb-score">
                    {entry.totalBestScore.toLocaleString('id-ID')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
