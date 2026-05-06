import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EventBus } from '../../game/EventBus';

/** Fisher-Yates shuffle — returns new array */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizModal() {
  const { quizzes, currentQuizIndex, answerQuiz, closeQuiz, activeRegion } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  // Filter quizzes by region
  const regionalQuizzes = quizzes.filter(q => q.region === activeRegion);
  const validQuizzes = regionalQuizzes.length > 0 ? regionalQuizzes : quizzes;
  const quiz = validQuizzes[currentQuizIndex % validQuizzes.length];

  const { shuffledOptions, shuffledCorrectIndex } = useMemo(() => {
    if (!quiz) return { shuffledOptions: [], shuffledCorrectIndex: 0 };
    const correctAnswer = quiz.options[quiz.correctAnswerIndex];
    const shuffled = shuffleArray(quiz.options);
    const newCorrectIndex = shuffled.indexOf(correctAnswer);
    return { shuffledOptions: shuffled, shuffledCorrectIndex: newCorrectIndex };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  if (!quiz) return null;

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    answerQuiz(index === shuffledCorrectIndex);
  };

  const handleClose = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    closeQuiz();
    EventBus.emit('resume-game');
  };

  const isCorrect = answered && selectedAnswer === shuffledCorrectIndex;

  // Answer letter labels
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz-overlay">
      <div className="quiz-card">

        {/* Header */}
        <div className="quiz-card-header">
          <div className="quiz-header-deco" aria-hidden="true">🍜</div>
          <div className="quiz-header-center">
            <span className="quiz-badge">KUIS KULINER</span>
            <span className="quiz-header-sub">Uji pengetahuanmu! 🧠</span>
          </div>
          <div className="quiz-header-deco" aria-hidden="true">🍡</div>
        </div>

        {/* Divider wave */}
        <div className="quiz-wave-divider" aria-hidden="true">
          <svg viewBox="0 0 360 18" preserveAspectRatio="none">
            <path d="M0,10 C60,18 120,2 180,10 C240,18 300,2 360,10 L360,18 L0,18 Z" fill="#FFF7ED"/>
          </svg>
        </div>

        {/* Question */}
        <div className="quiz-body">
          <p className="quiz-question-new">{quiz.question}</p>

          {/* Options */}
          <div className="quiz-options-new">
            {shuffledOptions.map((option, index) => {
              let cls = 'quiz-option-new';
              if (answered) {
                if (index === shuffledCorrectIndex) cls += ' quiz-opt-correct';
                else if (index === selectedAnswer) cls += ' quiz-opt-wrong';
                else cls += ' quiz-opt-dimmed';
              } else if (index === selectedAnswer) {
                cls += ' quiz-opt-selected';
              }

              return (
                <button
                  key={option}
                  className={cls}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                >
                  <span className="quiz-opt-letter">{letters[index]}</span>
                  <span className="quiz-opt-text">{option}</span>
                  {answered && index === shuffledCorrectIndex && (
                    <span className="quiz-opt-icon">✓</span>
                  )}
                  {answered && index === selectedAnswer && index !== shuffledCorrectIndex && (
                    <span className="quiz-opt-icon">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result feedback */}
          {answered && (
            <div className={`quiz-feedback ${isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'}`}>
              <div className="quiz-feedback-top">
                <span className="quiz-feedback-emoji">{isCorrect ? '🎉' : '❌'}</span>
                <p className="quiz-feedback-title">
                  {isCorrect ? `Benar! +50 poin` : 'Salah!'}
                </p>
              </div>
              {!isCorrect && (
                <p className="quiz-correct-answer-hint">
                  ✅ Jawaban benar: <strong>{shuffledOptions[shuffledCorrectIndex]}</strong>
                </p>
              )}
              <p className="quiz-explanation-new">{quiz.explanation}</p>
              <button className="quiz-continue-btn" onClick={handleClose}>
                <span>Lanjut Bermain</span>
                <span className="quiz-continue-arrow">▶</span>
              </button>
            </div>
          )}
        </div>

        {/* Decorative dots */}
        <div className="quiz-dots" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="quiz-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
