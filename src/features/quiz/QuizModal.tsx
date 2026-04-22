import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EventBus } from '../../game/EventBus';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';

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
  // Fallback to all quizzes if none match region (safeguard)
  const validQuizzes = regionalQuizzes.length > 0 ? regionalQuizzes : quizzes;
  const quiz = validQuizzes[currentQuizIndex % validQuizzes.length];

  // Shuffle options once per quiz (stable while user is answering).
  // Returns { shuffledOptions, shuffledCorrectIndex }
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
    const isCorrect = index === shuffledCorrectIndex;
    answerQuiz(isCorrect);
  };

  const handleClose = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    closeQuiz();
    EventBus.emit('resume-game');
  };

  return (
    <Modal isOpen={true} title="🧠 Kuis Kuliner!">
      <p className="quiz-question">{quiz.question}</p>

      <div className="quiz-options">
        {shuffledOptions.map((option, index) => {
          let optionClass = 'quiz-option';
          if (answered) {
            if (index === shuffledCorrectIndex) {
              optionClass += ' quiz-correct';
            } else if (index === selectedAnswer) {
              optionClass += ' quiz-wrong';
            }
          } else if (index === selectedAnswer) {
            optionClass += ' quiz-selected';
          }

          return (
            <button
              key={option}
              className={optionClass}
              onClick={() => handleAnswer(index)}
              disabled={answered}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="quiz-result">
          {selectedAnswer === shuffledCorrectIndex ? (
            <p className="quiz-result-correct">✅ Benar! +50 poin</p>
          ) : (
            <p className="quiz-result-wrong">❌ Kurang tepat!</p>
          )}
          <p className="quiz-explanation">{quiz.explanation}</p>
          <Button variant="primary" fullWidth onClick={handleClose}>
            Lanjut Bermain ▶️
          </Button>
        </div>
      )}
    </Modal>
  );
}
