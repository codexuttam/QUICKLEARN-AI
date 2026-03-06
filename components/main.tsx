"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SendHorizontal, Loader2, BookOpen, Youtube, Sparkles, ChevronDown, ChevronUp, Check, X, ShieldAlert, Lock, LogOut, Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import axios, { AxiosError } from "axios";
import { getTeachingPrompt, getCombinedPrompt, TeachingStyle } from '@/components/GeminiResponse/SystemPrompt';
import { Skeleton } from "@/components/ui/skeleton";
import { GeminiResponse, YoutubeVideoResponse, YoutubeVideoItem, YoutubeAnalyticsResponse, YoutubeAnalytics } from "./interfaces/types";
import { Features, Footer } from "./LandingSections";
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion";

export const IntegratedGeminiChat = () => {
  const [inputData, setInputData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [videos, setVideos] = useState<YoutubeVideoItem[]>([]);
  const [teachingStyle, setTeachingStyle] = useState<TeachingStyle>(TeachingStyle.Short);
  const [videoStats, setVideoStats] = useState<Record<string, YoutubeAnalytics['statistics']>>({});
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [animateResponse, setAnimateResponse] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizReady, setQuizReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLoginError, setShowLoginError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Rough check for login status
    const status = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(status);
  }, []);

  interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  }

  const GEMINI_API_URL = `/api/gemini`;
  const YOUTUBE_API_URL = `/api/youtube`;

  const teachingStyleOptions = [
    { value: TeachingStyle.Standard, label: "Standard", description: "Balanced teaching approach" },
    { value: TeachingStyle.Short, label: "Concise", description: "Brief, to-the-point explanations" },
    { value: TeachingStyle.Interactive, label: "Interactive", description: "Engaging, question-based teaching" },
    { value: TeachingStyle.Advanced, label: "Advanced", description: "Deep, technical explanations" },
    { value: TeachingStyle.Storytelling, label: "Storytelling", description: "Narrative-based learning" },
    { value: TeachingStyle.Deepanalysis, label: "Deep Analysis", description: "Comprehensive breakdowns" }
  ];

  const generateQuizPrompt = (topic: string) => {
    return `Generate a short quiz with 3 multiple choice questions about "${topic}". 
    Format each question exactly like this example:
    
    Question: What is the capital of France?
    Options: A) London, B) Paris, C) Berlin, D) Madrid
    Correct Answer: B) Paris
    Explanation: Paris has been the capital of France since the 5th century.
    
    Ensure all questions are directly related to "${topic}" and vary in difficulty. 
    Provide clear explanations for each correct answer.`;
  };

  const parseQuizResponse = (text: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const questionBlocks = text.split('\n\n').filter(block => block.includes('Question:'));

    questionBlocks.forEach(block => {
      const lines = block.split('\n');
      const question = lines[0].replace('Question: ', '').trim();
      const optionsLine = lines.find(line => line.startsWith('Options: '));
      const options = optionsLine ? optionsLine.replace('Options: ', '').split(', ').map(opt => opt.trim()) : [];
      const correctAnswerLine = lines.find(line => line.startsWith('Correct Answer: '));
      const correctAnswer = correctAnswerLine ? correctAnswerLine.replace('Correct Answer: ', '').trim() : '';
      const explanationLine = lines.find(line => line.startsWith('Explanation: '));
      const explanation = explanationLine ? explanationLine.replace('Explanation: ', '').trim() : '';

      if (question && options.length > 0 && correctAnswer) {
        questions.push({ question, options, correctAnswer, explanation });
      }
    });

    return questions.slice(0, 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputData.trim()) return;

    if (!isLoggedIn) {
      setShowLoginError(true);
      return;
    }

    setIsLoading(true);
    setIsFetchingVideos(true);
    setResponse("");
    setVideos([]);
    setVideoStats({});
    setAnimateResponse(false);
    setQuizQuestions([]);
    setShowQuiz(false);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizReady(false);

    try {
      // 1. Fetch AI Explanation & Quiz
      const geminiResponse = await axios.post(GEMINI_API_URL, {
        contents: [{ parts: [{ text: getCombinedPrompt(inputData, teachingStyle) }] }]
      });

      const geminiData = geminiResponse.data as GeminiResponse;
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        try {
          const cleanedJson = responseText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          setResponse(parsed.explanation);
          setQuizQuestions(parsed.quiz);
          setQuizReady(true);
        } catch (e) {
          setResponse(responseText);
        }
        setAnimateResponse(true);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      let errorMessage = "The AI couldn't generate a breakdown. Please check your Gemini API key.";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          errorMessage = error.response.data?.error || "Gemini AI is reaching its request limit. Please try again in 30 seconds.";
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      }

      setResponse(errorMessage);
    }


    try {
      // 2. Fetch YouTube Videos via server proxy to avoid CORS / key exposure / restrictions
      const youtubeResponse = await axios.get(`${YOUTUBE_API_URL}?q=${encodeURIComponent(inputData)}&maxResults=4`);
      const youtubeData = youtubeResponse.data;

      const searchItems = youtubeData?.search?.items ?? youtubeData?.items ?? [];
      setVideos(searchItems);

      if ((youtubeData?.stats?.items ?? []).length > 0) {
        const statsData = youtubeData.stats;
        const statsMap: Record<string, YoutubeAnalytics['statistics']> = {};
        statsData.items.forEach((item: any) => {
          statsMap[item.id] = item.statistics;
        });
        setVideoStats(statsMap);
      }
    } catch (error: any) {
      console.error("YouTube Error:", error?.response ?? error);
      // if proxied endpoint returned a JSON error body from Google, surface a short message to the user
      if (axios.isAxiosError(error)) {
        const errBody = error.response?.data;
        const proxiedMessage = errBody?.error?.message || errBody?.error || JSON.stringify(errBody || {}).slice(0, 300);
        setResponse((prev) => prev || `YouTube API error: ${proxiedMessage}`);
      }
      // We don't block the main response if YouTube fails
    } finally {
      setIsLoading(false);
      setIsFetchingVideos(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const submitQuiz = () => setQuizSubmitted(true);
  const resetQuiz = () => { setUserAnswers({}); setQuizSubmitted(false); };
  const calculateScore = () => quizQuestions.reduce((score, question, index) => score + (userAnswers[index] === question.correctAnswer ? 1 : 0), 0);

  const abbreviateNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative selection:bg-purple-500/30 overflow-x-hidden">
      {/* Dynamic Advanced Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#020617]"></div>
        <div
          className="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full animate-pulse transition-opacity"
          style={{ transitionDuration: '7001ms' }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse transition-opacity"
          style={{ transitionDuration: '10001ms' }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <img
                src="/logo.png"
                alt="QuickLearn Logo"
                className="relative h-9 w-9 rounded-lg object-cover shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-purple-200 to-blue-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              QuickLearn.ai
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition-all hover:scale-105">Features</a>
            <a href="#about" className="text-gray-400 hover:text-white text-sm transition-all hover:scale-105">About</a>
            <div className="h-4 w-px bg-white/10"></div>
            {!isLoggedIn ? (
              <>
                <Link href="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
                <Link href="/signup" className="bg-white text-black text-sm px-5 py-2.5 rounded-full hover:bg-gray-200 transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">Sign Up</Link>
              </>
            ) : (
              <button
                onClick={() => {
                  localStorage.clear();
                  setIsLoggedIn(false);
                  window.location.href = "/";
                }}
                className="text-gray-400 hover:text-white text-sm font-medium transition-all hover:scale-105 flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-full hover:bg-white/10 border border-white/5 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/5 overflow-hidden"
            >
              <div className="flex flex-col px-4 py-6 space-y-4">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-lg font-medium transition-all">Features</a>
                <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-lg font-medium transition-all">About</a>
                <div className="w-full h-px bg-white/10 my-2"></div>
                {!isLoggedIn ? (
                  <div className="flex flex-col space-y-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-lg font-medium transition-colors">Sign In</Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-black text-center text-lg px-5 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">Sign Up</Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      localStorage.clear();
                      setIsLoggedIn(false);
                      setIsMobileMenuOpen(false);
                      window.location.href = "/";
                    }}
                    className="text-white hover:text-red-400 text-lg font-medium transition-all flex items-center justify-center gap-2 bg-white/5 px-4 py-3 rounded-xl hover:bg-white/10 border border-white/5 active:scale-95 text-center mt-2"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Elements above have fixed background, now content */}

      <main className="flex-grow flex flex-col items-center px-4 pb-12 pt-8 relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          <section className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Learn Anything with AI</h2>
            <div className="text-gray-100 max-w-2xl mx-auto h-8 text-lg font-medium opacity-80 mb-2">
              {mounted && (
                <Typewriter
                  options={{
                    strings: [
                      'Get instant explanations powered by AI.',
                      'Explore curated video recommendations.',
                      'Master any subject in minutes.',
                      'Tailored to your learning style.'
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 50,
                    deleteSpeed: 30,
                  }}
                />
              )}
            </div>
          </section>

          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-1"
            >
              <div className="bg-slate-900/60 rounded-[1.4rem] p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-purple-400" /> Choose Your Learning Style
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {teachingStyleOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${teachingStyle === option.value
                            ? 'bg-purple-900/50 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'bg-gray-800/20 border-white/5 hover:border-white/20'
                            }`}
                          onClick={() => setTeachingStyle(option.value)}
                        >
                          <div className="font-semibold text-sm text-white mb-1">{option.label}</div>
                          <div className="text-[10px] text-gray-400 leading-tight">{option.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-slate-950 rounded-xl overflow-hidden border border-white/5">
                      <input
                        type="text"
                        className="flex-1 h-14 sm:h-16 px-4 sm:px-6 py-2 bg-transparent text-white text-base sm:text-lg placeholder-gray-600 outline-none border-0 w-full min-w-0"
                        placeholder="What would you like to learn about?"
                        onChange={(e) => setInputData(e.target.value)}
                        value={inputData}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !inputData.trim()}
                        className="h-14 sm:h-16 px-5 sm:px-8 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-bold shrink-0"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal size={18} />}
                        <span className="hidden sm:inline">{isLoading ? "Thinking..." : "Deep Search"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </section>

          <section className="w-full">
            {isLoading ? (
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-pulse">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-slate-800 rounded-lg"></div>
                    <div className="h-3 w-24 bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-[95%]"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-[98%]"></div>
                </div>
              </div>
            ) : (
              (response || videos.length > 0) && (
                <div className={`relative group ${animateResponse ? 'animate-fade-in' : ''}`}>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50 pointer-events-none"></div>
                  <div className="relative bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 border border-white/10 shadow-2xl">
                    {response && (
                      <>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
                            <img src="/logo.png" alt="AI Agent" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">AI Master Breakdown</h3>
                            <p className="text-sm text-gray-500 font-medium">Personalized Intelligence</p>
                          </div>
                        </div>

                        <div className="text-gray-300 leading-relaxed space-y-5 font-light text-lg">
                          {response.split("\n\n").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>

                        {quizReady && (
                          <div className="mt-12 pt-8 border-t border-white/5">
                            <button
                              onClick={() => setShowQuiz(!showQuiz)}
                              className="flex items-center justify-between w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                  <BookOpen size={16} className="text-purple-400" />
                                </div>
                                <span className="text-white font-semibold">Test Your Mastery</span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-400">
                                <span className="text-xs">{quizQuestions.length} AI-GEN Questions</span>
                                {showQuiz ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </button>

                            {showQuiz && (
                              <div className="mt-6 space-y-6">
                                {quizQuestions.map((question, qIndex) => (
                                  <div key={qIndex} className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                                    <h5 className="text-white font-bold mb-4 text-lg">{question.question}</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {question.options.map((option, oIndex) => {
                                        const isSelected = userAnswers[qIndex] === option;
                                        const isCorrect = option === question.correctAnswer;
                                        const showResult = quizSubmitted;

                                        return (
                                          <div
                                            key={oIndex}
                                            onClick={() => !quizSubmitted && handleAnswerSelect(qIndex, option)}
                                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${!showResult
                                              ? isSelected
                                                ? 'bg-purple-500/10 border-purple-500 text-white'
                                                : 'bg-white/5 border-transparent hover:border-white/10 text-gray-400'
                                              : isCorrect
                                                ? 'bg-green-500/10 border-green-500 text-green-400 font-bold'
                                                : isSelected
                                                  ? 'bg-red-500/10 border-red-500 text-red-400'
                                                  : 'bg-white/5 border-transparent opacity-50'
                                              }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              {showResult && (isCorrect ? <Check size={16} /> : isSelected ? <X size={16} /> : null)}
                                              {option}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {quizSubmitted && question.explanation && (
                                      <div className="mt-4 p-4 bg-white/5 rounded-xl text-sm text-gray-400 leading-relaxed border-l-4 border-purple-500">
                                        {question.explanation}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl">
                                  {!quizSubmitted ? (
                                    <button
                                      onClick={submitQuiz}
                                      disabled={Object.keys(userAnswers).length < quizQuestions.length}
                                      className="bg-white text-black font-bold px-8 py-3 rounded-xl disabled:opacity-20 transition-all hover:scale-105"
                                    >
                                      Finalize Results
                                    </button>
                                  ) : (
                                    <>
                                      <div className="text-white">
                                        Mastery Level: <span className="text-purple-400 font-bold">{calculateScore()} / {quizQuestions.length}</span>
                                      </div>
                                      <button onClick={resetQuiz} className="text-gray-400 hover:text-white transition-colors underline decoration-purple-500 underline-offset-4">Try Re-Mastering</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {videos.length > 0 && (
                      <div className="mt-12 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <Youtube className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Visual Deep Dives</h3>
                            <p className="text-sm text-gray-500 font-medium">Curated Cinematic Learning</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {videos.map((video) => (
                            <a
                              key={video.id.videoId}
                              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition-all border border-white/5 hover:border-white/10 hover:-translate-y-1"
                            >
                              <div className="relative aspect-video">
                                <img
                                  src={((video.snippet.thumbnails as Record<string, { url?: string }>)?.high?.url ?? (video.snippet.thumbnails as Record<string, { url?: string }>)?.default?.url) || ''}
                                  alt={video.snippet.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                  <h4 className="text-white font-bold text-sm line-clamp-2 leading-snug">{video.snippet.title}</h4>
                                </div>
                              </div>
                              <div className="p-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <div className="flex items-center gap-4">
                                  {videoStats[video.id.videoId] && (
                                    <>
                                      <span className="flex items-center gap-1.5"><X className="w-3 h-3 rotate-45" /> {abbreviateNumber(parseInt(videoStats[video.id.videoId].viewCount))}</span>
                                      <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> {abbreviateNumber(parseInt(videoStats[video.id.videoId].likeCount))}</span>
                                    </>
                                  )}
                                </div>
                                <span className="bg-white/5 px-2 py-1 rounded">
                                  {mounted && new Date(video.snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </section>
        </div>
      </main>

      <Features />
      <Footer />

      <AnimatePresence>
        {showLoginError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginError(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {/* Background gradient for the box */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[60px] rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[60px] rounded-full"></div>

              <div className="relative text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Access Restricted</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Join the QuickLearn community to unlock deep AI analysis and curated learning paths.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all underline decoration-purple-500 underline-offset-4"
                  >
                    Take Me to Sign In
                  </Link>
                  <button
                    onClick={() => setShowLoginError(false)}
                    className="w-full text-gray-500 hover:text-white text-sm py-2 transition-colors"
                  >
                    I'll Explore Features First
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};