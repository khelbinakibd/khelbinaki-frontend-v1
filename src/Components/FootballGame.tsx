import { useState, useEffect } from 'react';
import { Trophy, Target, Zap, RotateCcw } from 'lucide-react';

const FootballGame = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [kicks, setKicks] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 85 });
  const [isKicking, setIsKicking] = useState(false);
  const [goalKeeperPosition, setGoalKeeperPosition] = useState(50);
  const [result, setResult] = useState('');
  const [streak, setStreak] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (!gameOver && !isKicking) {
      const interval = setInterval(() => {
        setGoalKeeperPosition(Math.random() * 70 + 15);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [gameOver, isKicking]);

  const shootBall = (targetX:number) => {
    if (isKicking || gameOver || kicks <= 0 || cooldown) return;
    setIsKicking(true);
    setCooldown(true);
    const targetY = 20 + Math.random() * 15;
    setBallPosition({ x: targetX, y: targetY });

    setTimeout(() => {
      const distance = Math.abs(targetX - goalKeeperPosition);
      const isGoal = distance > 25;

      if (isGoal) {
        setScore((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setResult('⚽ GOAL!');
        if (score + 1 > highScore) setHighScore(score + 1);
      } else {
        setResult('🧤 SAVED!');
        setStreak(0);
      }

      setKicks((prev) => prev - 1);
      if (kicks - 1 <= 0) setGameOver(true);

      setTimeout(() => {
        setBallPosition({ x: 50, y: 85 });
        setIsKicking(false);
        setResult('');
      }, 1500);

      // ❗Cooldown reset after 1.5s
      setTimeout(() => setCooldown(false), 3500);
    }, 600);
  };

  const resetGame = () => {
    setScore(0);
    setKicks(10);
    setGameOver(false);
    setBallPosition({ x: 50, y: 85 });
    setStreak(0);
    setResult('');
    setCooldown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-2 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Penalty Shootout
          </h1>
          <p className="text-sm sm:text-base text-green-200">
            Click on the goal to shoot!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-600 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-green-400" />
              <p className="text-green-200 text-sm font-medium">Score</p>
            </div>
            <p className="text-3xl font-bold text-white">{score}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-yellow-500 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <p className="text-green-200 text-sm font-medium">Best</p>
            </div>
            <p className="text-3xl font-bold text-white">{highScore}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-600 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-green-400" />
              <p className="text-green-200 text-sm font-medium">Kicks</p>
            </div>
            <p className="text-3xl font-bold text-white">{kicks}</p>
          </div>
        </div>

        {/* Streak */}
        {streak > 1 && !gameOver && (
          <div className="text-center mb-4 animate-pulse">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
              🔥 {streak} Goal Streak!
            </span>
          </div>
        )}

        {/* Game Area */}
        <div className="bg-gradient-to-br max-w-lg mx-auto from-green-700/50 to-green-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-green-600 mb-6">
          <div
            className="relative h-64 bg-gradient-to-b from-gray-200 to-gray-100 rounded-xl border-4 border-gray-800 cursor-pointer overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              shootBall(x);
            }}
          >
            {/* Goal Net */}
            <div
              className="absolute inset-2 bg-white/10 rounded"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 16px), repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 16px)',
              }}
            ></div>

            {/* Goalkeeper */}
            <div
              className="absolute bottom-4 transition-all duration-200 ease-out"
              style={{
                left: `${goalKeeperPosition}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="relative">
                <div className="w-12 h-16 bg-gradient-to-b from-orange-500 to-orange-600 rounded-lg shadow-xl border-2 border-orange-700 relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-200 rounded-full border-2 border-orange-700 shadow-lg"></div>
                  <div className="absolute top-2 -left-4 w-10 h-2 bg-orange-600 rounded-full rotate-45 shadow-md"></div>
                  <div className="absolute top-2 -right-4 w-10 h-2 bg-orange-600 rounded-full -rotate-45 shadow-md"></div>
                  <div className="absolute top-0 -left-5 w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600"></div>
                  <div className="absolute top-0 -right-5 w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600"></div>
                </div>
              </div>
            </div>

            {/* Click Text */}
            {!isKicking && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white/50 text-lg font-bold animate-pulse bg-black/20 px-4 py-2 rounded-full">
                  Click to Shoot
                </div>
              </div>
            )}
          </div>

          {/* Ball */}
          <div
            className={`absolute w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-full shadow-2xl border-4 border-gray-800 transition-all ${
              isKicking ? 'duration-500' : 'duration-300'
            }`}
            style={{
              left: `${ballPosition.x}%`,
              bottom: `${ballPosition.y}%`,
              transform: 'translate(-50%, 50%)',
            }}
          ></div>

          {/* Result */}
          {result && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div
                className={`text-5xl font-bold ${
                  result.includes('GOAL') ? 'text-green-400' : 'text-red-400'
                } animate-bounce drop-shadow-2xl`}
              >
                {result}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-green-600 shadow-lg">
          <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2 text-base">
            <Target className="w-5 h-5" />
            How to Play:
          </h3>
          <ul className="text-green-200 text-sm space-y-1">
            <li>• Click anywhere on the goal to shoot the ball</li>
            <li>• Try to avoid the goalkeeper's position</li>
            <li>• Score as many goals as possible in 10 kicks</li>
            <li>• Build a streak for bonus excitement!</li>
          </ul>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-3xl p-8 max-w-md w-full text-center border-4 border-green-600 shadow-2xl">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
              <div className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/20">
                <p className="text-green-200 text-lg mb-2">Final Score</p>
                <p className="text-6xl font-bold text-white mb-4">{score}</p>
                <p className="text-green-200 text-base">out of 10 kicks</p>
                {score === highScore && score > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2 rounded-full font-bold text-base shadow-lg">
                    🏆 New High Score!
                  </div>
                )}
              </div>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-6 h-6" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FootballGame;
