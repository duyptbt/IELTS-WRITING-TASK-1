import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  BookOpen, 
  TrendingUp, 
  PenTool,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  MessageSquare,
  Award,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Data ---

const borderlineData = [
  { month: 'April', customers: 7.5 },
  { month: 'May', customers: 8.5 },
  { month: 'June', customers: 9.5 },
  { month: 'July', customers: 8.5 },
  { month: 'Aug', customers: 17.5 },
  { month: 'Sept', customers: 15.5 },
  { month: 'Oct', customers: 19.5 }, // Extended to match the visual peak in the graph
];

const councilData = [
  { year: 'Year 1', amount: 21000, members: 7500 },
  { year: 'Year 2', amount: 23500, members: 6000 },
  { year: 'Year 3', amount: 40000, members: 11000 },
  { year: 'Year 4', amount: 35000, members: 13500 },
];

const exercise1Options = [
  "decreased slightly", "downward trend", "fell again", "fluctuations", 
  "increased slightly", "number", "peaked", "rose sharply", 
  "steady trend", "upward trend"
];

const exercise1Questions = [
  { 
    id: 1, 
    text: "The graph shows the", 
    suffix: "of customers visiting a bookshop over a six-month period.", 
    answer: "number",
    explanation: "The Y-axis measures the quantity of customers, so 'number' is the correct term for countable nouns."
  },
  { 
    id: 2, 
    text: "Customer numbers", 
    suffix: "in May.", 
    answer: "increased slightly",
    explanation: "From April to May, the line goes from 7.5 to 8.5, which is a small, steady increase."
  },
  { 
    id: 3, 
    text: "Customer numbers", 
    suffix: "the following month.", 
    answer: "increased slightly",
    explanation: "From May to June, the line goes from 8.5 to 9.5, another small step up."
  },
  { 
    id: 4, 
    text: "Customer numbers", 
    suffix: "in July.", 
    answer: "decreased slightly",
    explanation: "In July, the numbers dip back down to 8.5, a small decrease."
  },
  { 
    id: 5, 
    text: "Customer numbers", 
    suffix: "in August.", 
    answer: "rose sharply",
    explanation: "In August, there is a dramatic jump from 8.5 to 17.5. 'Rose sharply' describes this steep angle."
  },
  { 
    id: 6, 
    text: "Customer numbers", 
    suffix: "in September.", 
    answer: "fell again",
    explanation: "In September, the numbers drop from the peak of 17.5 down to 15.5."
  },
  { 
    id: 7, 
    text: "There were", 
    suffix: "in customer numbers between April and September.", 
    answer: "fluctuations",
    explanation: "The line goes up, then down, then up again, which is described as 'fluctuations'."
  },
  { 
    id: 8, 
    text: "The graph shows an", 
    suffix: "generally.", 
    answer: "upward trend",
    explanation: "Despite the dips, the final point is much higher than the starting point, indicating an overall 'upward trend'."
  },
];

const exercise2Options = [
  "about", "gives", "rise", "another", "decrease", "fall", "fluctuated", 
  "increase", "information", "peak", "reached", "sharp", "slight"
];

const exercise2Questions = [
  { 
    id: 1, 
    original: "The graph shows the number of customers visiting a bookshop over a six-month period.",
    bold: "shows",
    prefix: "The graph",
    blanks: ["gives", "information", "about"],
    suffix: "the number of customers visiting a bookshop over a six-month period.",
    explanation: "'Gives information about' is a formal synonym for 'shows' commonly used in IELTS Task 1 introductions to vary vocabulary."
  },
  { 
    id: 2, 
    original: "Customer numbers increased slightly in May.",
    bold: "increased slightly",
    prefix: "There was a",
    blanks: ["slight", "increase"],
    suffix: "in customer numbers in May.",
    explanation: "This rephrases a verb + adverb ('increased slightly') into an adjective + noun ('slight increase')."
  },
  { 
    id: 3, 
    original: "Customer numbers decreased slightly the following month.",
    bold: "decreased slightly",
    prefix: "There was a",
    blanks: ["slight", "decrease"],
    suffix: "in customer numbers the following month.",
    explanation: "Similar to the previous example, the verb + adverb pair is converted to an adjective + noun pair."
  },
  { 
    id: 4, 
    original: "Customer numbers rose sharply in July.",
    bold: "rose sharply",
    prefix: "There was a",
    blanks: ["sharp", "rise"],
    suffix: "in customer numbers in July.",
    explanation: "'Rose' (verb) + 'sharply' (adverb) becomes 'sharp' (adjective) + 'rise' (noun) to describe a steep upward movement."
  },
  { 
    id: 5, 
    original: "Customer numbers fell again in August.",
    bold: "fell again",
    prefix: "There was",
    blanks: ["another", "fall"],
    suffix: "in customer numbers in August.",
    explanation: "The word 'again' implies a repeated event, which is captured by using 'another' with the noun 'fall'."
  },
  { 
    id: 6, 
    original: "Customer numbers peaked in September.",
    bold: "peaked",
    prefix: "Customer numbers",
    blanks: ["reached"],
    mid: "a",
    blanks2: ["peak"],
    suffix: "in September.",
    explanation: "The verb 'peaked' can be expanded into the phrase 'reached a peak' (verb + noun) for variety."
  },
  { 
    id: 7, 
    original: "There were fluctuations in customer numbers during the six-month period.",
    bold: "fluctuations",
    prefix: "Customer numbers",
    blanks: ["fluctuated"],
    suffix: "during the six-month period.",
    explanation: "Here, the noun 'fluctuations' is converted back into its verb form 'fluctuated' to describe the trend."
  }
];

const exercise4Questions = [
  { id: 1, text: "The graph shows how much money a city council received from book clubs in the city.", answer: false },
  { id: 2, text: "The graph also shows how many book club members there were in the city.", answer: true },
  { id: 3, text: "The graph covers a period of time that began and ended in the past.", answer: true },
  { id: 4, text: "Over the four-year period, there was a steady rise in the amount of money that was given.", answer: false },
  { id: 5, text: "Over the same period, the number of book club members fluctuated.", answer: true },
  { id: 6, text: "Generally, there was a downward trend in the number of book club members.", answer: false },
];

// --- Components ---

const CouncilGraph = () => (
  <div className="glass-card rounded-[2rem] p-8 h-[450px] flex flex-col">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="font-serif text-2xl font-bold tracking-tight">Council Donations</h3>
        <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mt-1">Annual Funding vs. Membership</p>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-zinc-900 rounded-full"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Amount Given (£)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-0 border-b-2 border-dashed border-zinc-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Number of Members</span>
        </div>
      </div>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={councilData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
            dy={10}
          />
          <YAxis 
            yAxisId="left" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
            tickFormatter={(val) => `£${val/1000}k`} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
          />
          <Tooltip 
            cursor={{ stroke: '#f4f4f5', strokeWidth: 2 }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="amount" 
            stroke="#18181b" 
            strokeWidth={4} 
            dot={{ r: 6, fill: '#18181b', strokeWidth: 3, stroke: '#fff' }}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="members" 
            stroke="#d4d4d8" 
            strokeWidth={3} 
            strokeDasharray="2 4"
            dot={{ r: 5, fill: '#d4d4d8', strokeWidth: 2, stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ProgressBar = ({ current, total }: { current: number, total: number }) => (
  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mb-12">
    <motion.div 
      className="bg-zinc-900 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    />
  </div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const [ex1Answers, setEx1Answers] = useState<Record<number, string>>({});
  const [ex2Answers, setEx2Answers] = useState<Record<string, string>>({});
  const [ex4Answers, setEx4Answers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showEx2Results, setShowEx2Results] = useState(false);
  const [showEx4Results, setShowEx4Results] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleEx1Change = (id: number, val: string) => {
    setEx1Answers(prev => ({ ...prev, [id]: val }));
  };

  const handleEx2Change = (qId: number, bIdx: number, val: string) => {
    setEx2Answers(prev => ({ ...prev, [`${qId}-${bIdx}`]: val }));
  };

  const handleEx4Change = (id: number, val: string) => {
    setEx4Answers(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight">IELTS Masterclass</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-0.5">Academic Writing Task 1</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
              <span className={step === 1 ? "text-zinc-900" : ""}>01. Trends</span>
              <span className={step === 2 ? "text-zinc-900" : ""}>02. Rephrasing</span>
              <span className={step === 3 ? "text-zinc-900" : ""}>03. Comparison</span>
            </div>
            <button 
              onClick={() => {
                setEx1Answers({});
                setEx4Answers({});
                setShowResults(false);
                setShowEx2Results(false);
                setShowEx4Results(false);
                setIsFinished(false);
                setStep(1);
              }}
              className="p-2.5 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900"
              title="Reset Practice"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <ProgressBar current={step} total={3} />

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <div key="exercises" className="space-y-12">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="space-y-16"
                >
                  <div className="grid lg:grid-cols-[1fr_450px] gap-16 items-start">
                    <div className="space-y-16">
                      <section className="space-y-10">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Module 01
                          </div>
                          <h2 className="text-5xl font-serif font-bold tracking-tight leading-[1.1]">
                            Describing <span className="italic font-normal">Trends</span>
                          </h2>
                          <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
                            Master the vocabulary of change. Observe the fluctuations of Borderline Bookshop and identify the patterns.
                          </p>
                        </div>
                        
                        <div className="glass-card rounded-[2rem] p-8">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Lexical Resource</h3>
                          <div className="flex flex-wrap gap-3">
                            {exercise1Options.map(opt => (
                              <span key={opt} className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 tracking-tight">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section className="glass-card rounded-[3rem] p-12">
                        <div className="grid gap-x-16 gap-y-12">
                          {exercise1Questions.map(q => (
                            <div key={q.id} className="space-y-4">
                              <div className="flex items-start gap-4 text-xl">
                                <span className="text-zinc-200 font-serif italic text-3xl leading-none mt-1">{q.id.toString().padStart(2, '0')}</span>
                                <div className="flex-1 leading-relaxed">
                                  <span className="text-zinc-400">{q.text}</span>
                                  <input 
                                    type="text"
                                    placeholder="..."
                                    value={ex1Answers[q.id] || ""}
                                    onChange={(e) => handleEx1Change(q.id, e.target.value)}
                                    disabled={showResults}
                                    className={`
                                      mx-2 px-4 py-1 rounded-xl border-b-2 font-bold transition-all outline-none w-48 text-center
                                      ${showResults 
                                        ? (ex1Answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                                        : 'bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:bg-white'
                                      }
                                    `}
                                  />
                                  <span className="text-zinc-400">{q.suffix}</span>
                                </div>
                              </div>
                              {showResults && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="ml-12 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100"
                                >
                                  <p className="text-xs text-zinc-500 leading-relaxed">
                                    <span className="font-bold text-zinc-900 uppercase tracking-widest text-[9px] mr-2">Logic:</span> {q.explanation}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-12 flex justify-center">
                          {!showResults ? (
                            <button 
                              onClick={() => setShowResults(true)}
                              className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
                            >
                              Verify Observations
                            </button>
                          ) : (
                            <button 
                              onClick={() => setStep(2)}
                              className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-zinc-200 active:scale-95"
                            >
                              Next Module <ChevronRight size={20} />
                            </button>
                          )}
                        </div>
                      </section>
                    </div>

                    <aside className="sticky top-32">
                      <div className="glass-card rounded-[2rem] p-8 h-[450px]">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="font-serif text-2xl font-bold tracking-tight">Borderline Bookshop</h3>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer Numbers (x100)</span>
                        </div>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={borderlineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
                                domain={[0, 20]} 
                              />
                              <Tooltip 
                                cursor={{ stroke: '#f4f4f5', strokeWidth: 2 }}
                                contentStyle={{ 
                                  borderRadius: '16px', 
                                  border: 'none', 
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                  padding: '12px'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="customers" 
                                stroke="#18181b" 
                                strokeWidth={4} 
                                dot={{ r: 6, fill: '#18181b', strokeWidth: 3, stroke: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="space-y-16"
                >
                  <div className="grid lg:grid-cols-[1fr_450px] gap-16 items-start">
                    <div className="space-y-16">
                      <section className="space-y-10">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Module 02
                          </div>
                          <h2 className="text-5xl font-serif font-bold tracking-tight leading-[1.1]">
                            Syntactic <span className="italic font-normal">Variation</span>
                          </h2>
                          <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
                            Learn to rephrase trends using different grammatical structures. Convert verbs to nouns with precision.
                          </p>
                        </div>

                        <div className="glass-card rounded-[2rem] p-8">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Vocabulary Box</h3>
                          <div className="flex flex-wrap gap-3">
                            {exercise2Options.map(opt => (
                              <span key={opt} className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 tracking-tight">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section className="glass-card rounded-[3rem] p-12 space-y-12">
                        {exercise2Questions.map(q => (
                          <div key={q.id} className="space-y-6 pb-12 border-b border-zinc-50 last:border-0 last:pb-0">
                            <div className="flex items-start gap-4">
                              <span className="text-zinc-200 font-serif italic text-3xl leading-none">{q.id.toString().padStart(2, '0')}</span>
                              <div className="space-y-4 flex-1">
                                <p className="text-zinc-400 text-lg italic">
                                  {q.original.split(q.bold).map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                      {part}
                                      {i < arr.length - 1 && <span className="font-bold text-zinc-900 not-italic">{q.bold}</span>}
                                    </React.Fragment>
                                  ))}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-4 text-xl">
                                  <span className="text-zinc-900 font-medium">{q.prefix}</span>
                                  {q.blanks.map((ans, bIdx) => (
                                    <input 
                                      type="text"
                                      placeholder="..."
                                      key={`b1-${bIdx}`}
                                      value={ex2Answers[`${q.id}-${bIdx}`] || ""}
                                      onChange={(e) => handleEx2Change(q.id, bIdx, e.target.value)}
                                      disabled={showEx2Results}
                                      className={`
                                        px-4 py-1 rounded-xl border-b-2 font-bold transition-all outline-none w-40 text-center
                                        ${showEx2Results 
                                          ? (ex2Answers[`${q.id}-${bIdx}`]?.toLowerCase().trim() === ans.toLowerCase().trim() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                                          : 'bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:bg-white'
                                        }
                                      `}
                                    />
                                  ))}
                                  {q.mid && <span className="text-zinc-900 font-medium">{q.mid}</span>}
                                  {q.blanks2 && q.blanks2.map((ans, bIdx) => (
                                    <input 
                                      type="text"
                                      placeholder="..."
                                      key={`b2-${bIdx}`}
                                      value={ex2Answers[`${q.id}-${bIdx + q.blanks.length}`] || ""}
                                      onChange={(e) => handleEx2Change(q.id, bIdx + q.blanks.length, e.target.value)}
                                      disabled={showEx2Results}
                                      className={`
                                        px-4 py-1 rounded-xl border-b-2 font-bold transition-all outline-none w-40 text-center
                                        ${showEx2Results 
                                          ? (ex2Answers[`${q.id}-${bIdx + q.blanks.length}`]?.toLowerCase().trim() === ans.toLowerCase().trim() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                                          : 'bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:bg-white'
                                        }
                                      `}
                                    />
                                  ))}
                                  <span className="text-zinc-400">{q.suffix}</span>
                                </div>
                              </div>
                            </div>
                            {showEx2Results && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="ml-12 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100"
                              >
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                  <span className="font-bold text-zinc-900 uppercase tracking-widest text-[9px] mr-2">Structure:</span> {q.explanation}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-between items-center pt-12">
                          <button 
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors"
                          >
                            <ChevronLeft size={16} /> Previous Module
                          </button>
                          {!showEx2Results ? (
                            <button 
                              onClick={() => setShowEx2Results(true)}
                              className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
                            >
                              Verify Rephrasing
                            </button>
                          ) : (
                            <button 
                              onClick={() => setStep(3)}
                              className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-zinc-200 active:scale-95"
                            >
                              Final Module <ChevronRight size={20} />
                            </button>
                          )}
                        </div>
                      </section>
                    </div>
                    <aside className="sticky top-32">
                      <CouncilGraph />
                    </aside>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="space-y-16"
                >
                  <div className="grid lg:grid-cols-[1fr_450px] gap-16 items-start">
                    <div className="space-y-16">
                      <section className="space-y-10">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Module 03
                          </div>
                          <h2 className="text-5xl font-serif font-bold tracking-tight leading-[1.1]">
                            Comparative <span className="italic font-normal">Analysis</span>
                          </h2>
                          <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
                            Synthesize multiple data points. Identify the correlation between funding and engagement.
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Data Verification</h3>
                          <div className="space-y-4">
                            {exercise4Questions.map(q => (
                              <div key={q.id} className={`p-6 glass-card rounded-3xl flex items-center justify-between gap-6 transition-all ${showEx4Results ? (ex4Answers[q.id]?.toLowerCase().trim() === q.answer.toString() ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100') : ''}`}>
                                <div className="flex items-start gap-4">
                                  <span className="text-zinc-300 font-serif italic text-xl mt-1">{q.id}</span>
                                  <p className="text-lg font-medium text-zinc-700 leading-snug">{q.text}</p>
                                </div>
                                <div className="shrink-0">
                                  <input 
                                    type="text"
                                    placeholder="T / F"
                                    value={ex4Answers[q.id] || ""}
                                    onChange={(e) => handleEx4Change(q.id, e.target.value)}
                                    disabled={showEx4Results}
                                    className={`
                                      px-4 py-2 rounded-xl border-b-2 font-bold transition-all outline-none w-24 text-center uppercase
                                      ${showEx4Results 
                                        ? (ex4Answers[q.id]?.toLowerCase().trim() === q.answer.toString() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                                        : 'bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:bg-white'
                                      }
                                    `}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {!showEx4Results ? (
                            <button 
                              onClick={() => setShowEx4Results(true)}
                              disabled={Object.keys(ex4Answers).length < exercise4Questions.length}
                              className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50"
                            >
                              Verify Analysis
                            </button>
                          ) : (
                            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-start gap-4">
                              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                <Lightbulb size={16} className="text-amber-600" />
                              </div>
                              <p className="text-xs text-amber-900/70 leading-relaxed">
                                <strong className="text-amber-900 font-bold uppercase tracking-widest text-[9px] block mb-1">Expert Insight</strong>
                                The correlation between funding peaks and membership growth is the key feature. Year 3 shows a massive spike in both metrics.
                              </p>
                            </div>
                          )}
                        </div>
                      </section>

                      <div className="flex justify-between items-center pt-12 border-t border-zinc-100">
                        <button 
                          onClick={() => setStep(2)}
                          className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors"
                        >
                          <ChevronLeft size={16} /> Previous Module
                        </button>
                        <button 
                          onClick={() => setIsFinished(true)}
                          className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-zinc-200 active:scale-95"
                        >
                          Complete Practice <CheckCircle2 size={20} />
                        </button>
                      </div>
                    </div>

                    <aside className="sticky top-32">
                      <CouncilGraph />
                    </aside>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-20 p-20 glass-card rounded-[4rem] text-center space-y-10 max-w-3xl mx-auto"
            >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl font-serif font-bold tracking-tight">Mastery Achieved.</h2>
                <p className="text-zinc-500 text-xl leading-relaxed max-w-md mx-auto">
                  You have successfully navigated the complexities of graph analysis. Your descriptive precision has improved.
                </p>
              </div>
              <button 
                onClick={() => {
                  setEx1Answers({});
                  setEx4Answers({});
                  setShowResults(false);
                  setShowEx2Results(false);
                  setShowEx4Results(false);
                  setIsFinished(false);
                  setStep(1);
                }}
                className="px-12 py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all inline-flex items-center gap-3 shadow-2xl shadow-zinc-200 active:scale-95"
              >
                <RefreshCcw size={20} /> Restart Training
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-20 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="font-serif font-bold tracking-tight block">IELTS Masterclass</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Academic Excellence</span>
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              Interactive Data
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
              Expert Logic
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
              Lexical Precision
            </div>
          </div>

          <div className="flex items-center gap-6 text-zinc-300">
            <button className="hover:text-zinc-900 transition-colors"><BookOpen size={18} /></button>
            <button className="hover:text-zinc-900 transition-colors"><Award size={18} /></button>
            <button className="hover:text-zinc-900 transition-colors"><HelpCircle size={18} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
