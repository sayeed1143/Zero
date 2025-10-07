import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BrandMark from "@/components/BrandMark";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AIService } from "@/services/ai";
import type { QuizResponse, QuizQuestion } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";

const PracticeMode = () => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [timeLimit, setTimeLimit] = useState(1200); // seconds for full test default 20min
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<string>('en');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isListeningAnswer, setIsListeningAnswer] = useState(false);

  const speakText = async (text: string, lang = 'en', onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.info('Voice not supported in this browser');
      return;
    }
    try {
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      const candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      utter.voice = candidates[0] || voices[0] || null;
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.volume = 0.95;
      utter.onend = () => { setIsSpeakingQuestion(false); if (onEnd) onEnd(); };
      utter.onerror = () => { setIsSpeakingQuestion(false); if (onEnd) onEnd(); };
      setIsSpeakingQuestion(true);
      synth.speak(utter);
    } catch (e) {
      console.error('TTS error', e);
      toast.error('Failed to play audio');
    }
  };

  const speakQuestion = useCallback((index = currentIndex) => {
    const q = questions[index];
    if (!q) return;
    const text = `${q.question}. Options: ${q.options.map((o, i) => String.fromCharCode(65+i) + '. ' + o).join('. ')}.`;
    speakText(text, voiceLanguage);
  }, [questions, currentIndex, voiceLanguage]);

  useEffect(() => {
    if (running && questions.length > 0) speakQuestion(currentIndex);
  }, [running, currentIndex, questions, speakQuestion]);

  const parseSpokenChoice = (text: string): number | null => {
    if (!text) return null;
    const t = text.toLowerCase();
    // Try to match A/B/C/D
    const letter = t.match(/\b([abcd])\b/);
    if (letter) {
      const ch = letter[1];
      return ch.charCodeAt(0) - 97;
    }
    const num = t.match(/\b(\d+)\b/);
    if (num) {
      const n = parseInt(num[1], 10);
      if (n >=1 && n <= 26) return n-1; // 1 => index 0
    }
    if (/one|first|a\b/.test(t)) return 0;
    if (/two|second|b\b/.test(t)) return 1;
    if (/three|third|c\b/.test(t)) return 2;
    if (/four|fourth|d\b/.test(t)) return 3;
    return null;
  };

  const startAnswerListening = useCallback(() => {
    const w: any = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not available in this browser');
      return;
    }
    const r = new SpeechRecognition();
    r.lang = voiceLanguage;
    r.interimResults = false;
    r.onresult = (ev: any) => {
      const text = Array.from(ev.results).map((res: any) => res[0].transcript).join(' ');
      const idx = parseSpokenChoice(text);
      if (idx === null) {
        toast.info('Could not parse answer. Try saying A, B, C or D');
      } else {
        submitAnswer(idx);
      }
    };
    r.onerror = (err: any) => {
      console.error('Speech error', err);
      toast.error('Speech recognition error');
      setIsListeningAnswer(false);
    };
    r.onend = () => setIsListeningAnswer(false);
    recognitionRef.current = r;
    r.start();
    setIsListeningAnswer(true);
  }, [voiceLanguage, submitAnswer]);

  const stopAnswerListening = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      try { r.stop(); } catch {};
      recognitionRef.current = null;
    }
    setIsListeningAnswer(false);
  }, []);

  const startTest = useCallback(async () => {
    setRunning(false);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    try {
      const res: QuizResponse = await AIService.generateQuiz('Create a high-quality practice test focused on competitive exam style problems.', numQuestions, difficulty, DEFAULT_FEATURE_MODELS.quiz);
      setQuestions(res.questions || []);
      setRunning(true);
      setTimeLeft(timeLimit);
      toast.success('Test started');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to start test');
    }
  }, [numQuestions, difficulty, timeLimit]);

  useEffect(() => {
    if (!running || timeLeft === null) return;
    if (timeLeft <= 0) {
      setRunning(false);
      toast.info('Time is up');
      return;
    }
    const t = setInterval(() => setTimeLeft(v => (v !== null ? v - 1 : v)), 1000);
    return () => clearInterval(t);
  }, [running, timeLeft]);

  const submitAnswer = useCallback((choiceIndex: number) => {
    if (!running) return;
    setAnswers(prev => [...prev, choiceIndex]);
    // move to next
    setCurrentIndex(i => Math.min(i + 1, Math.max(questions.length - 1, 0)));
    if (currentIndex >= questions.length - 1) {
      setRunning(false);
      setShowSolutions(true);
      toast.success('Test completed');
    }
  }, [running, questions.length, currentIndex]);

  const score = useMemo(() => {
    if (questions.length === 0) return 0;
    let s = 0;
    for (let i = 0; i < Math.min(answers.length, questions.length); i++) {
      if (questions[i].correctAnswer === answers[i]) s++;
    }
    return s;
  }, [answers, questions]);

  const generateWeaknessQuiz = useCallback(async () => {
    // build content from incorrect questions
    const incorrect = questions
      .map((q, i) => ({ q, i }))
      .filter((x, i) => answers[i] !== undefined && answers[i] !== x.q.correctAnswer)
      .map(x => `${x.q.question} | Correct: ${x.q.options[x.q.correctAnswer]}`)
      .join('\n');

    if (!incorrect) {
      toast.info('No incorrect answers to target. Try a full test first.');
      return;
    }

    try {
      const res: QuizResponse = await AIService.generateQuiz(`Create a 5-question focused mini-quiz to strengthen the following weak areas:\n\n${incorrect}`, 5, 'easy', DEFAULT_FEATURE_MODELS.quiz);
      // replace questions with mini-quiz and start
      setQuestions(res.questions || []);
      setAnswers([]);
      setCurrentIndex(0);
      setRunning(true);
      setTimeLeft(300);
      setShowSolutions(false);
      toast.success('Weakness mini-quiz generated');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to generate mini-quiz');
    }
  }, [answers, questions]);

  const exportResults = useCallback(() => {
    const payload = { questions, answers, score, total: questions.length };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [questions, answers, score]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center">
            <BrandMark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/workspace">
              <Button size="sm" variant="ghost" className="mr-1">Workspace</Button>
            </Link>
            <span className="text-xs text-muted-foreground">Practice Mode</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-7xl h-full px-4 grid grid-cols-1 lg:grid-cols-3 gap-4 py-6">
          <aside className="col-span-1 border rounded-xl p-4 bg-card">
            <h3 className="text-sm font-semibold mb-2">Infinite Adaptive Tests</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input type="number" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value || 10))} />
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground">Total Time (seconds)</label>
                <Input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value || 1200))} />
              </div>

              <div className="flex gap-2">
                <Button onClick={startTest} className="flex-1">Start Test</Button>
                <Button variant="outline" onClick={() => { setRunning(false); setTimeLeft(null); }}>Stop</Button>
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold">Weakness Focus Engine</h4>
                <p className="text-xs text-muted-foreground">Generate a mini-quiz focused on incorrect areas after a test.</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={generateWeaknessQuiz}>Generate Mini-Quiz</Button>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold">Export</h4>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={exportResults}>Export Results</Button>
                </div>
              </div>
            </div>
          </aside>

          <section className="col-span-2 border rounded-xl p-4 bg-white min-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Time & Stress Simulator</div>
              <div className="text-xs text-muted-foreground">{running ? `Time left: ${timeLeft}s` : 'Idle'}</div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {questions.length === 0 && (
                <div className="text-center text-muted-foreground py-20">No active test. Click Start Test to begin an adaptive mock.</div>
              )}

              {questions.length > 0 && (
                <div>
                  <div className="mb-4">
                    <div className="text-sm font-medium">Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}</div>
                    <div className="mt-2 text-base">{questions[currentIndex]?.question}</div>
                  </div>

                  <div className="grid gap-2">
                    {questions[currentIndex]?.options.map((opt, i) => (
                      <button key={i} className="text-left rounded-md border px-3 py-2 hover:bg-muted/10" onClick={() => submitAnswer(i)}>
                        <div className="text-sm">{String.fromCharCode(65+i)}. {opt}</div>
                      </button>
                    ))}
                  </div>

                  {showSolutions && (
                    <div className="mt-4 rounded-md border p-3 bg-card">
                      <div className="text-sm font-semibold">Solutions</div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Score: {score} / {questions.length}
                      </div>
                      <div className="mt-3 space-y-3">
                        {questions.map((q, idx) => (
                          <div key={idx} className="rounded-md p-2 border">
                            <div className="font-medium">{idx+1}. {q.question}</div>
                            <div className="text-sm mt-1">Correct: {q.options[q.correctAnswer]}</div>
                            {q.explanation && <div className="text-xs text-muted-foreground mt-1">{q.explanation}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
};

export default PracticeMode;
