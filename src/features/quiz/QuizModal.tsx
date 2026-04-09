import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EventBus } from '../../game/EventBus';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';

export function QuizModal() {
  const { quizzes, currentQuizIndex, answerQuiz, closeQuiz } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const quiz = quizzes[currentQuizIndex % quizzes.length];
  if (!quiz) return null;

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const isCorrect = index === quiz.correctAnswerIndex;
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
        {quiz.options.map((option, index) => {
          let optionClass = 'quiz-option';
          if (answered) {
            if (index === quiz.correctAnswerIndex) {
              optionClass += ' quiz-correct';
            } else if (index === selectedAnswer) {
              optionClass += ' quiz-wrong';
            }
          } else if (index === selectedAnswer) {
            optionClass += ' quiz-selected';
          }

          return (
            <button
              key={index}
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
          {selectedAnswer === quiz.correctAnswerIndex ? (
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
