import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function ProgressScreen() {
  const {
    setScreen,
    loadProfile,
    totalSessions,
    totalBestScore,
    totalMerges,
    totalQuizzesCorrect,
    totalQuizzesAnswered,
    unlockedRecipes,
    sessions,
    snacks,
  } = useGameStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile().then(() => setLoading(false));
  }, []);

  const quizAccuracy = totalQuizzesAnswered > 0
    ? Math.round((totalQuizzesCorrect / totalQuizzesAnswered) * 100)
    : 0;

  if (loading) {
    return (
      <div className="screen progress-screen">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="screen progress-screen">
      <h1 className="progress-title">📊 Dasbor Progres</h1>

      <div className="stats-grid">
        <Card title="Total Main">
          <p className="stat-number">{totalSessions}</p>
        </Card>
        <Card title="Skor Terbaik">
          <p className="stat-number">{totalBestScore}</p>
        </Card>
        <Card title="Total Gabungan">
          <p className="stat-number">{totalMerges}</p>
        </Card>
        <Card title="Akurasi Kuis">
          <p className="stat-number">{quizAccuracy}%</p>
          <p className="stat-sub">{totalQuizzesCorrect}/{totalQuizzesAnswered}</p>
        </Card>
      </div>

      {/* Unlocked Recipes */}
      <div className="progress-section">
        <h2>🍡 Resep Terbuka ({unlockedRecipes.length})</h2>
        {unlockedRecipes.length > 0 ? (
          <div className="unlocked-grid">
            {unlockedRecipes.map((name) => {
              const snack = snacks.find(s => s.name === name);
              return (
                <div key={name} className="unlocked-item">
                  <span
                    className="unlocked-circle"
                    style={{ backgroundColor: snack?.color || '#ccc' }}
                  >
                    {snack?.emoji || '?'}
                  </span>
                  <span className="unlocked-name">{name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-text">Belum ada resep yang terbuka. Main dulu!</p>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="progress-section">
        <h2>🕐 Riwayat Permainan</h2>
        {sessions.length > 0 ? (
          <div className="sessions-list">
            {sessions.slice(0, 10).map((session, i) => (
              <div key={session.sessionId || i} className="session-row">
                <div className="session-info">
                  <span className="session-score">Skor: {session.score}</span>
                  <span className="session-merges">{session.merges} merge</span>
                </div>
                <div className="session-meta">
                  <span className="session-quiz">
                    Kuis: {session.quizzesCorrect}/{session.quizzesTriggered}
                  </span>
                  <span className="session-date">
                    {new Date(session.startedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">Belum ada riwayat permainan.</p>
        )}
      </div>

      <Button variant="secondary" fullWidth onClick={() => setScreen('mainMenu')}>
        🏠 Kembali
      </Button>
    </div>
  );
}
