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
  MessageSquare
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
  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-[400px] flex flex-col">
    <h3 className="text-center font-serif italic text-lg mb-6">Council donations to book clubs</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={councilData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `£${val/1000}k`} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="top" height={36}/>
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="amount" 
          name="Amount Given (£)"
          stroke="#18181b" 
          strokeWidth={3} 
          dot={{ r: 4, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="members" 
          name="Club Members"
          stroke="#71717a" 
          strokeDasharray="5 5"
          strokeWidth={2} 
          dot={{ r: 4, fill: '#71717a', strokeWidth: 2, stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
    <div className="mt-4 p-4 bg-zinc-50 rounded-xl text-xs text-zinc-500 flex gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-zinc-900"></div>
        <span>Amount Given (£)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-zinc-500 border-t border-dashed"></div>
        <span>Number of Members</span>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ current, total }: { current: number, total: number }) => (
  <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden mb-8">
    <motion.div 
      className="bg-zinc-900 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
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
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">IELTS Writing Task 1</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Graph Description Practice</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
              title="Reset App"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <ProgressBar current={step} total={3} />

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <div key="exercises" className="space-y-12">
              {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-600">
                    Exercise 1
                  </div>
                  <h2 className="text-3xl font-light tracking-tight leading-tight">
                    Describing Trends: <span className="font-medium italic">Borderline Bookshop</span>
                  </h2>
                  <p className="text-zinc-600 leading-relaxed">
                    Look at the graph and complete the sentences with words and phrases from the box. 
                    Pay attention to the direction and intensity of the changes.
                  </p>
                  
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Vocabulary Box</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise1Options.map(opt => (
                        <span key={opt} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-[400px]">
                  <h3 className="text-center font-serif italic text-lg mb-6">Borderline bookshop: Customer numbers (x100)</h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={borderlineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} domain={[0, 20]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="customers" 
                        stroke="#18181b" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                  {exercise1Questions.map(q => (
                    <div key={q.id} className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg">
                      <span className="text-zinc-400 font-mono text-sm">{q.id}.</span>
                      <span>{q.text}</span>
                      <input 
                        type="text"
                        placeholder="..."
                        value={ex1Answers[q.id] || ""}
                        onChange={(e) => handleEx1Change(q.id, e.target.value)}
                        disabled={showResults}
                        className={`
                          px-3 py-1 rounded-lg border-b-2 font-medium transition-all outline-none w-40
                          ${showResults 
                            ? (ex1Answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                            : 'bg-zinc-50 border-zinc-300 focus:border-zinc-900'
                          }
                        `}
                      />
                      <span className="text-zinc-600">{q.suffix}</span>
                      {showResults && (
                        <div className="ml-auto">
                          {ex1Answers[q.id] === q.answer ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                        </div>
                      )}
                      {showResults && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="w-full mt-2 p-3 bg-zinc-50 border-l-2 border-zinc-900 rounded-r-lg"
                        >
                          <p className="text-sm text-zinc-600 leading-relaxed">
                            <strong className="text-zinc-900">Explanation:</strong> {q.explanation}
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
                      className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                    >
                      Check Answers
                    </button>
                  ) : (
                    <button 
                      onClick={() => setStep(2)}
                      className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                      Next Exercise <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <section className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-600">
                    Exercise 2
                  </div>
                  <h2 className="text-3xl font-light tracking-tight leading-tight">
                    Rephrasing Trends: <span className="font-medium italic">Noun vs. Verb Phrases</span>
                  </h2>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
                    <p className="text-sm text-zinc-700 leading-relaxed italic">
                      "The graph below shows how much money a city council gave to book clubs over a four-year period. 
                      Summarise the information by selecting and reporting the main features, and make comparisons where relevant. 
                      You should write at least 150 words."
                    </p>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">
                    Complete the second sentence in each pair, replacing the words and phrases in bold with words from the box. 
                    You will need to use some words more than once.
                  </p>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Vocabulary Box</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise2Options.map(opt => (
                        <span key={opt} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <CouncilGraph />
              </section>

              <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
                {exercise2Questions.map(q => (
                  <div key={q.id} className="space-y-3 pb-6 border-b border-zinc-100 last:border-0">
                    <div className="text-base text-zinc-400 flex gap-2">
                      <span className="font-mono">{q.id}.</span>
                      <p>
                        {q.original.split(q.bold).map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && <span className="font-bold text-zinc-900">{q.bold}</span>}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg">
                      <span className="text-zinc-900">{q.prefix}</span>
                      {q.blanks.map((ans, bIdx) => (
                      <input 
                        type="text"
                        placeholder="..."
                        key={`b1-${bIdx}`}
                        value={ex2Answers[`${q.id}-${bIdx}`] || ""}
                        onChange={(e) => handleEx2Change(q.id, bIdx, e.target.value)}
                        disabled={showEx2Results}
                        className={`
                          px-3 py-1 rounded-lg border-b-2 font-medium transition-all outline-none w-32
                          ${showEx2Results 
                            ? (ex2Answers[`${q.id}-${bIdx}`]?.toLowerCase().trim() === ans.toLowerCase().trim() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                            : 'bg-zinc-50 border-zinc-300 focus:border-zinc-900'
                          }
                        `}
                      />
                      ))}
                      {q.mid && <span className="text-zinc-900">{q.mid}</span>}
                      {q.blanks2 && q.blanks2.map((ans, bIdx) => (
                        <input 
                          type="text"
                          placeholder="..."
                          key={`b2-${bIdx}`}
                          value={ex2Answers[`${q.id}-${bIdx + q.blanks.length}`] || ""}
                          onChange={(e) => handleEx2Change(q.id, bIdx + q.blanks.length, e.target.value)}
                          disabled={showEx2Results}
                          className={`
                            px-3 py-1 rounded-lg border-b-2 font-medium transition-all outline-none w-32
                            ${showEx2Results 
                              ? (ex2Answers[`${q.id}-${bIdx + q.blanks.length}`]?.toLowerCase().trim() === ans.toLowerCase().trim() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                              : 'bg-zinc-50 border-zinc-300 focus:border-zinc-900'
                            }
                          `}
                        />
                      ))}
                      <span className="text-zinc-600">{q.suffix}</span>
                    </div>
                    {showEx2Results && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-zinc-50 border-l-4 border-zinc-900 rounded-r-xl"
                      >
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          <strong className="text-zinc-900">Explanation:</strong> {q.explanation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center pt-8">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-zinc-500 font-semibold hover:text-zinc-900 transition-colors"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  {!showEx2Results ? (
                    <button 
                      onClick={() => setShowEx2Results(true)}
                      className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                    >
                      Check Answers
                    </button>
                  ) : (
                    <button 
                      onClick={() => setStep(3)}
                      className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                      Next Exercise <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <section className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-600">
                    EXERCISE 3
                  </div>
                  <h2 className="text-3xl font-light tracking-tight leading-tight">
                    Comparing Data: <span className="font-medium italic">Council Donations</span>
                  </h2>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
                    <p className="text-sm text-zinc-700 leading-relaxed italic">
                      "The graph below shows how much money a city council gave to book clubs over a four-year period. 
                      Summarise the information by selecting and reporting the main features, and make comparisons where relevant. 
                      You should write at least 150 words."
                    </p>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">
                    This graph shows two different metrics over a four-year period. 
                    Analyze the relationship between the amount of money given and the number of members.
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">True or False?</h3>
                    <div className="space-y-3">
                      {exercise4Questions.map(q => (
                        <div key={q.id} className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all ${showEx4Results ? (ex4Answers[q.id]?.toLowerCase().trim() === q.answer.toString() ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200') : 'bg-white border-zinc-200'}`}>
                          <div className="flex items-center gap-3">
                            {showEx4Results && (
                              <div className="shrink-0">
                                {ex4Answers[q.id]?.toLowerCase().trim() === q.answer.toString() ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-500" />}
                              </div>
                            )}
                            <p className="text-lg font-medium text-zinc-700">{q.text}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <input 
                              type="text"
                              placeholder="True or False?"
                              value={ex4Answers[q.id] || ""}
                              onChange={(e) => handleEx4Change(q.id, e.target.value)}
                              disabled={showEx4Results}
                              className={`
                                px-4 py-2 rounded-xl border-b-2 font-medium transition-all outline-none w-40
                                ${showEx4Results 
                                  ? (ex4Answers[q.id]?.toLowerCase().trim() === q.answer.toString() ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                                  : 'bg-zinc-50 border-zinc-300 focus:border-zinc-900'
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
                        className="w-full py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all disabled:opacity-50"
                      >
                        Check True/False Answers
                      </button>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                        <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <strong>Tip:</strong> Pay close attention to the dotted line vs. the solid line. The solid line represents money given by the council, while the dotted line shows the members.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <CouncilGraph />
              </section>

              <div className="flex justify-between items-center pt-8 border-t border-zinc-200">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-zinc-500 font-semibold hover:text-zinc-900 transition-colors"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  onClick={() => setIsFinished(true)}
                  className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2"
                >
                  Finish Practice <CheckCircle2 size={18} />
                </button>
              </div>
            </motion.div>
          )}
            </div>
          ) : (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-12 p-12 bg-white border border-zinc-200 rounded-[3rem] shadow-xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-4xl font-light tracking-tight">Practice Complete!</h2>
              <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
                You've successfully completed all the graph description exercises. 
                You're now better prepared for IELTS Writing Task 1!
              </p>
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
                className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all inline-flex items-center gap-2"
              >
                <RefreshCcw size={18} /> Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-200 text-center space-y-4">
        <p className="text-sm text-zinc-400 font-medium uppercase tracking-widest">
          IELTS Academic Writing Task 1 Training
        </p>
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Interactive Graphs
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            AI Sample Answers
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
            Vocabulary Practice
          </div>
        </div>
      </footer>
    </div>
  );
}
