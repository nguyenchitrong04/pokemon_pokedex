"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCw, Heart, Zap, Send, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PokemonQuizProps {
  fetchPoke: (id: string) => Promise<any>;
}

export default function PokemonQuiz({ fetchPoke }: PokemonQuizProps) {
  const [pokemon, setPokemon] = useState<any>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'answered' | 'gameover'>('playing');
  const [quizType, setQuizType] = useState<'name' | 'type'>('name');
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState({ msg: "", isCorrect: false });

  // 1. Xác định độ khó
  const getDifficulty = (currentStreak: number) => {
    if (currentStreak >= 15) return { label: 'CỰC KHÓ', level: 4, blur: 'blur-sm', color: 'text-purple-500', bg: 'bg-purple-50' };
    if (currentStreak >= 10) return { label: 'KHÓ', level: 3, blur: 'blur-[4px]', color: 'text-orange-500', bg: 'bg-orange-50' };
    if (currentStreak >= 5) return { label: 'TRUNG BÌNH', level: 2, blur: 'blur-0', color: 'text-blue-500', bg: 'bg-blue-50' };
    return { label: 'DỄ', level: 1, blur: 'blur-0', color: 'text-green-500', bg: 'bg-green-50' };
  };

  const diff = getDifficulty(streak);

  // 2. Hàm tải câu hỏi (Fetch tên thật làm đáp án nhiễu)
  const loadQuestion = useCallback(async (currentStreak: number) => {
    setIsLoading(true);
    setGameState('playing');
    setUserInput("");
    setFeedback({ msg: "", isCorrect: false });
    
    const currentDiff = getDifficulty(currentStreak);
    setTimeLeft(currentDiff.level === 4 ? 20 : 15);

    // Ngẫu nhiên chọn loại câu hỏi (Cấp 4 ưu tiên đoán tên)
    const nextType = currentDiff.level === 4 ? 'name' : (Math.random() > 0.6 ? 'type' : 'name');
    setQuizType(nextType);

    try {
      const mainId = Math.floor(Math.random() * 898) + 1;
      const mainPoke = await fetchPoke(mainId.toString());
      setPokemon(mainPoke);

      if (currentDiff.level < 4) {
        let choices: string[] = [];
        if (nextType === 'name') {
          // Tạo 3 hoặc 5 ID ngẫu nhiên khác để lấy tên thật
          const numWrong = currentDiff.level === 3 ? 5 : 3;
          const wrongIds: number[] = [];
          while (wrongIds.length < numWrong) {
            const rid = Math.floor(Math.random() * 898) + 1;
            if (rid !== mainId && !wrongIds.includes(rid)) wrongIds.push(rid);
          }
          const wrongPokes = await Promise.all(wrongIds.map(id => fetchPoke(id.toString())));
          choices = [mainPoke.name, ...wrongPokes.map(p => p.name)];
        } else {
          // Đoán hệ
          const allTypes = ['fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel'];
          const correctType = mainPoke.types[0].type.name;
          const wrongTypes = allTypes
            .filter(t => t !== correctType)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          choices = [correctType, ...wrongTypes];
        }
        setOptions(choices.sort(() => 0.5 - Math.random()));
      }
    } catch (err) {
      console.error("Failed to load Pokemon", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPoke]);

  // 3. Khởi tạo & Timer
  useEffect(() => {
    loadQuestion(0);
  }, [loadQuestion]);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0 || isLoading) {
      if (timeLeft === 0 && gameState === 'playing') handleAnswer("");
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, isLoading]);

  // 4. Xử lý trả lời
  const handleAnswer = (ans: string) => {
    if (gameState !== 'playing') return;

    const correct = (quizType === 'name' ? pokemon.name : pokemon.types[0].type.name).toLowerCase();
    const isCorrect = ans.trim().toLowerCase() === correct;

    if (isCorrect) {
      const points = 10 * diff.level;
      setScore(s => s + points);
      setStreak(st => st + 1);
      setFeedback({ msg: `Chính xác! +${points} điểm`, isCorrect: true });
      setGameState('answered');
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      setFeedback({ msg: `Sai rồi! Đáp án là ${correct.toUpperCase()}`, isCorrect: false });
      if (newLives <= 0) setGameState('gameover');
      else setGameState('answered');
    }
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setStreak(0);
    loadQuestion(0);
  };

  if (gameState === 'gameover') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md mx-auto bg-white dark:bg-slate-900 p-10 rounded-[3rem] text-center shadow-2xl border-4 border-red-500">
        <Trophy size={80} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-4xl font-black mb-2 text-slate-800 dark:text-white">THẤT BẠI</h2>
        <p className="text-xl mb-6 font-bold text-slate-500">Tổng điểm: {score}</p>
        <button onClick={resetGame} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase hover:bg-red-600 transition-colors shadow-lg">
          Chơi lại từ đầu
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[3rem] shadow-2xl border dark:border-slate-800">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className={`px-4 py-1 rounded-full font-black text-xs ${diff.bg} ${diff.color}`}>
          {diff.label} {quizType === 'type' && '• HỆ'}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} fill={i < lives ? "#ef4444" : "none"} className={i < lives ? "text-red-500" : "text-slate-200"} />
            ))}
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-black bg-yellow-50 px-3 py-1 rounded-full text-sm">
            <Zap size={14} fill="currentColor" /> {streak}
          </div>
          <div className="text-xl font-black text-slate-700 dark:text-white">{score}</div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / (diff.level === 4 ? 20 : 15)) * 100}%` }}
          className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-green-500'}`}
        />
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <RefreshCw className="animate-spin text-slate-300" size={40} />
          <p className="font-bold text-slate-400">Đang tìm Pokémon...</p>
        </div>
      ) : pokemon && (
        <div className="space-y-6">
          <div className="relative flex justify-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
            <img 
              src={pokemon.sprites.other['official-artwork'].front_default} 
              alt="pokemon"
              className={`w-48 h-48 z-10 transition-all duration-700 select-none
                ${gameState === 'playing' ? `brightness-0 ${diff.blur}` : 'brightness-100 scale-110'}
              `} 
            />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {quizType === 'name' ? "Đây là Pokémon nào?" : "Pokémon này thuộc hệ gì?"}
            </h3>
          </div>

          {diff.level === 4 ? (
            <div className="flex gap-2">
              <input 
                autoFocus
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnswer(userInput)}
                disabled={gameState !== 'playing'}
                placeholder="Nhập tên chính xác..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl font-bold focus:ring-2 ring-purple-500 outline-none"
              />
              <button onClick={() => handleAnswer(userInput)} className="bg-purple-600 text-white px-6 rounded-2xl hover:bg-purple-700">
                <Send size={20} />
              </button>
            </div>
          ) : (
            <div className={`grid ${diff.level === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              {options.map((opt) => (
                <button 
                  key={opt} 
                  onClick={() => handleAnswer(opt)}
                  disabled={gameState !== 'playing'}
                  className={`p-4 rounded-2xl font-black uppercase transition-all border-b-4 active:border-b-0 active:translate-y-1
                    ${gameState === 'playing' 
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500' 
                      : opt.toLowerCase() === (quizType === 'name' ? pokemon.name : pokemon.types[0].type.name).toLowerCase()
                        ? 'bg-green-500 border-green-700 text-white' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-40'}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {gameState === 'answered' && (
            <button 
              onClick={() => loadQuestion(streak)} 
              className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={20} /> TIẾP TỤC
            </button>
          )}

          <AnimatePresence>
            {feedback.msg && (
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-center font-black text-lg ${feedback.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {feedback.msg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}