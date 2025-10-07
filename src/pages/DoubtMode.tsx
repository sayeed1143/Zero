import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AIService } from "@/services/ai";

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'te', label: 'Telugu' },
];

const DoubtMode = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeakingSolution, setIsSpeakingSolution] = useState(false);

  const speakText = async (text: string, lang = 'en') => {
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
      utter.onend = () => setIsSpeakingSolution(false);
      utter.onerror = () => setIsSpeakingSolution(false);
      setIsSpeakingSolution(true);
      synth.speak(utter);
    } catch (e) {
      console.error('TTS error', e);
      toast.error('Failed to play audio');
    }
  };

  useEffect(() => {
    // load any persisted heatmap (localStorage)
    try {
      const raw = localStorage.getItem('doubt_heatmap');
      if (raw) setHeatmap(JSON.parse(raw));
      const rec = localStorage.getItem('doubt_recent');
      if (rec) setRecentRequests(JSON.parse(rec));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('doubt_heatmap', JSON.stringify(heatmap)); } catch {}
  }, [heatmap]);

  useEffect(() => {
    try { localStorage.setItem('doubt_recent', JSON.stringify(recentRequests)); } catch {}
  }, [recentRequests]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setImageFile(f);
  }, []);

  const solvePhoto = useCallback(async () => {
    if (!imageFile) { toast.info('Select an image first'); return; }
    setSolving(true);
    setSolution(null);
    try {
      const base64 = await AIService.fileToBase64(imageFile);
      const prompt = `Provide a clear, step-by-step solution to the problem in the image. If multiple methods exist, show alternatives. Provide answer and brief explanation. Respond in ${LANGUAGES.find(l => l.code === language)?.label || 'English'}.`;
      const content = await AIService.processVision(base64, prompt);
      const clean = content?.trim() || 'No solution returned';
      setSolution(clean);
      // auto-play
      speakText(clean, language);
      // update heatmap using first line or hashed content
      const key = (clean.split('\n')[0] || 'unknown').slice(0, 120);
      setHeatmap(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      setRecentRequests(prev => [{ type: 'photo', text: key, time: Date.now() }, ...prev].slice(0, 50));
      toast.success('Solution ready');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to solve photo');
    } finally {
      setSolving(false);
    }
  }, [imageFile, language]);

  const startListening = useCallback(() => {
    const w: any = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not available in this browser');
      return;
    }
    const r = new SpeechRecognition();
    r.lang = language;
    r.interimResults = false;
    r.onresult = (ev: any) => {
      const text = Array.from(ev.results).map((res: any) => res[0].transcript).join(' ');
      setTranscript(text);
      // send to AI chat
      handleVoiceQuestion(text);
    };
    r.onerror = (err: any) => {
      console.error('Speech error', err);
      toast.error('Speech recognition error');
      setListening(false);
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  }, [language]);

  const stopListening = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      try { r.stop(); } catch {};
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const handleVoiceQuestion = useCallback(async (text: string) => {
    if (!text) return;
    setSolution(null);
    setSolving(true);
    try {
      const system = `You are DoubtBuster AI. Answer concisely and pedagogically. Prefer stepwise explanations and include a 'Deep Dive' link text to Canvas Mode when appropriate.`;
      const res = await AIService.chat([
        { role: 'system', content: system },
        { role: 'user', content: `Student question (speak): ${text}. Answer in ${LANGUAGES.find(l => l.code === language)?.label || 'English'}.` }
      ]);
      const content = res.content || 'No response';
      setSolution(content);
      const key = (text || '').slice(0, 120);
      setHeatmap(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      setRecentRequests(prev => [{ type: 'voice', text: key, time: Date.now() }, ...prev].slice(0, 50));
      toast.success('Answer ready');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to answer');
    } finally {
      setSolving(false);
    }
  }, [language]);

  const exportHeatmap = useCallback(() => {
    const payload = { heatmap, recentRequests };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doubt-heatmap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [heatmap, recentRequests]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center">
            <BrandMark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/workspace"><Button size="sm" variant="ghost">Workspace</Button></Link>
            <span className="text-xs text-muted-foreground">Doubt Mode</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-7xl h-full px-4 grid grid-cols-1 lg:grid-cols-3 gap-4 py-6">
          <aside className="col-span-1 border rounded-xl p-4 bg-card">
            <h3 className="text-sm font-semibold mb-2">Photo-to-Solution</h3>
            <div className="space-y-2">
              <input type="file" accept="image/*" onChange={onFileChange} />
              <div className="flex gap-2 pt-2">
                <Button onClick={solvePhoto} disabled={solving || !imageFile}>Solve Photo</Button>
                <Button variant="outline" onClick={() => { setImageFile(null); setSolution(null); }}>Clear</Button>
              </div>
              <div className="pt-4">
                <label className="text-xs text-muted-foreground">Response language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t mt-4">
              <h4 className="text-sm font-semibold">Doubt Heatmap (teacher)</h4>
              <div className="text-xs text-muted-foreground mt-2">Top asked doubts (local sample)</div>
              <ul className="mt-2 text-sm space-y-1 max-h-40 overflow-auto scrollbar-thin">
                {Object.entries(heatmap).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v]) => (
                  <li key={k} className="flex items-center justify-between">
                    <span className="truncate mr-2">{k}</span>
                    <span className="text-xs text-muted-foreground">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 flex gap-2">
                <Button size="sm" onClick={exportHeatmap}>Export Heatmap</Button>
                <Link to="/canvas"><Button size="sm" variant="ghost">Open Canvas</Button></Link>
              </div>
            </div>
          </aside>

          <section className="col-span-2 border rounded-xl p-4 bg-white min-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Voice Conversation Tutor</div>
              <div>
                {listening ? (
                  <Button size="sm" variant="destructive" onClick={stopListening}>Stop</Button>
                ) : (
                  <Button size="sm" onClick={startListening}>Record Question</Button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <div className="mb-4">
                <div className="text-xs text-muted-foreground">Transcript</div>
                <div className="mt-2 p-3 rounded-md border bg-card min-h-[60px]">{transcript || <span className="text-muted-foreground">No transcript yet</span>}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted-foreground">Solution / Answer</div>
                <div className="mt-2 p-4 rounded-md border bg-gray-50 min-h-[120px] whitespace-pre-wrap">{solving ? 'Thinking...' : (solution || <span className="text-muted-foreground">No solution yet</span>)}</div>
                {solution && (
                  <div className="pt-3 flex gap-2">
                    <Button onClick={() => { navigator.clipboard?.writeText(solution); toast.success('Copied'); }}>Copy</Button>
                    <Link to="/canvas"><Button variant="outline">Open in Canvas</Button></Link>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold">Recent Requests</h4>
                <ul className="mt-2 space-y-2 max-h-40 overflow-auto text-sm">
                  {recentRequests.map((r, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.text}</div>
                        <div className="text-xs text-muted-foreground">{new Date(r.time).toLocaleString()} • {r.type}</div>
                      </div>
                      <div className="ml-2">
                        <Button size="sm" variant="ghost" onClick={() => setSolution(r.text)}>View</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DoubtMode;
