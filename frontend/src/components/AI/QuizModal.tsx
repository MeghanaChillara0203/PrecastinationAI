import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { QuizQuestion, UserProfile, CharacterType } from '../../types';
import { CharacterIllustration } from '../Illustrations';

interface QuizModalProps {
  isOpen: boolean;
  questions: QuizQuestion[];
  onComplete: (passed: boolean) => void;
  onRequestHelp: () => void;
  loading: boolean;
  character: CharacterType;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, questions, onComplete, onRequestHelp, loading, character }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
      setAnswers([]);
      setShowResults(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center flex flex-col items-center">
          <CharacterIllustration character={character} mood="Thinking" className="w-40 h-40" />
          <h3 className="text-xl font-bold text-white mt-4">Checking your work...</h3>
          <p className="text-gray-400">I'm preparing a quick check for us.</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.correctIndex === answers[i]) correct++;
    });
    return correct;
  };
  
  const score = calculateScore();
  const passed = score / questions.length >= 0.8; // Pass if 80% correct

  const handleAcceptFate = () => {
    onComplete(false);
  };

  const handleHelpMe = () => {
    onComplete(false); 
    onRequestHelp();
  };

  const handleSuccess = () => {
    onComplete(true);
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-gray-700 max-w-md w-full rounded-2xl p-8 text-center shadow-2xl animate-slide-up">
          <div className="mx-auto w-48 h-48 flex items-center justify-center mb-2">
            <CharacterIllustration character={character} mood={passed ? 'Success' : 'Failure'} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{passed ? 'Great job!' : 'Not quite there'}</h2>
          <p className="text-gray-400 mb-8">
            You scored {score} out of {questions.length}. 
            {passed ? ' Awesome work staying focused!' : ' It looks like we missed a few things.'}
          </p>

          <div className="flex flex-col gap-3">
            {passed ? (
              <button
                onClick={handleSuccess}
                className="w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
              >
                Complete Task
              </button>
            ) : (
              <>
                <button
                  onClick={handleHelpMe}
                  className="w-full py-3 rounded-xl font-bold text-white bg-secondary hover:bg-pink-600 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  Help Me Finish This <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAcceptFate}
                  className="w-full py-3 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all"
                >
                  Try again later
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-gray-700 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Verification Quiz</h3>
          <span className="text-sm text-gray-400">Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl text-white font-medium mb-6 leading-relaxed">{q.question}</h2>
          
          <div className="space-y-3">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="w-full text-left p-4 rounded-xl border border-gray-700 hover:border-primary hover:bg-gray-800/50 transition-all text-gray-300 hover:text-white group"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600 group-hover:border-primary mr-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 px-6 py-4">
          <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};