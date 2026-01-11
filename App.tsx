
import React, { useState, useRef, useEffect } from 'react';
import { Zap, RefreshCw, History, ArrowLeft, Shield, Lock } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ClaritySheet } from './components/ClaritySheet';
import { MeetingHistory } from './components/MeetingHistory';
import { analyzeMeeting } from './services/geminiService';
import { AppState, MeetingAnalysis, MeetingRecord } from './types';
import { parseTimestampToSeconds } from './utils';

// Declare custom window functions for AI Studio environment
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const STORAGE_KEY = 'decision_dynamo_session_history';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<MeetingAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<MeetingRecord[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Load session history and check API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();

    // Use sessionStorage instead of localStorage for ephemeral persistence
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let parsedHistory: MeetingRecord[] = JSON.parse(saved);
        setHistory(parsedHistory);
      } catch (e) {
        console.error("Failed to parse history", e);
        setHistory([]);
      }
    }
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Failed to open key selection", e);
      }
    }
  };

  const saveToHistory = (file: File, analysis: MeetingAnalysis) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString() + Math.random().toString(36).substring(2);

    const newRecord: MeetingRecord = {
      id,
      fileName: file.name,
      date: new Date().toISOString(),
      analysis
    };
    
    setHistory(prevHistory => {
      const updatedHistory = [newRecord, ...prevHistory];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const handleProcess = async (media: File, slides?: File) => {
    try {
      setAppState(AppState.PROCESSING);
      setMediaFile(media);
      setVideoUrl(URL.createObjectURL(media));
      
      const result = await analyzeMeeting(media, slides);
      setAnalysisData(result);
      
      // Save to ephemeral session history
      saveToHistory(media, result);
      
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      
      if (err.message === "API_KEY_INVALID") {
        setHasApiKey(false);
        setErrorMsg("Your Gemini API key appears to be invalid or from a non-paid project. Please reconnect a valid key.");
        setAppState(AppState.UPLOAD);
      } else {
        setErrorMsg(err.message || "Failed to analyze the meeting.");
        setAppState(AppState.ERROR);
      }
    }
  };

  const handleSeek = (timestamp: string) => {
    if (videoRef.current) {
      const seconds = parseTimestampToSeconds(timestamp);
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleSelectHistory = (record: MeetingRecord) => {
    setAnalysisData(record.analysis);
    setMediaFile(null); 
    setVideoUrl(null); 
    setAppState(AppState.RESULTS);
  };

  const reset = () => {
    setAppState(AppState.UPLOAD);
    setMediaFile(null);
    setAnalysisData(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10 print:bg-white print:pb-0">
      {/* Navbar */}
      <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setAppState(AppState.UPLOAD)}
          >
            <div className="bg-indigo-700 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-indigo-100" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Decision Dynamo</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold text-indigo-100">
              <Lock className="w-3 h-3 text-emerald-400" />
              SESSION ONLY MODE
            </div>
            {hasApiKey && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-800/50 rounded-full border border-indigo-700/50 text-[10px] font-bold text-indigo-200">
                <Shield className="w-3 h-3 text-emerald-400" />
                API SECURED
              </div>
            )}
            {appState === AppState.RESULTS && (
              <button 
                onClick={reset}
                className="text-indigo-200 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> New Meeting
              </button>
            )}
            <button 
              onClick={() => setAppState(AppState.HISTORY)}
              className="text-indigo-200 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <History className="w-4 h-4" /> Session History
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 print:mt-0 print:px-0 print:max-w-none">
        
        {appState === AppState.UPLOAD && (
          <div className="animate-fade-in-up relative">
            <div className="text-center mb-10 max-w-2xl mx-auto pt-8">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Transform chaos into <span className="text-indigo-600">clarity</span>.
              </h2>
              <p className="text-lg text-slate-600">
                Upload your meeting and get instant decisions. 
                <span className="block mt-2 font-medium text-slate-500 italic">
                  Privacy Note: Your recording and clarity sheets are stored only in this session. Closing the tab purges all data permanently.
                </span>
              </p>
            </div>
            
            {errorMsg && (
              <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                <Zap className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            <FileUpload 
              onProcess={handleProcess} 
              isLoading={false} 
              hasApiKey={hasApiKey}
              onConnectKey={handleConnectKey}
            />
            
            <div className="mt-12 text-center flex flex-col items-center gap-4">
              <button 
                onClick={() => setAppState(AppState.HISTORY)}
                className="text-slate-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-2 transition-colors border-b border-transparent hover:border-indigo-200 pb-0.5"
              >
                <History className="w-4 h-4" /> View Session History ({history.length})
              </button>
              <p className="text-sm text-slate-400">Analysis Engine: Gemini 3 Pro • Privacy Level: Zero-Persistence</p>
            </div>
          </div>
        )}

        {appState === AppState.HISTORY && (
          <MeetingHistory 
            history={history} 
            onSelect={handleSelectHistory} 
            onBack={() => setAppState(AppState.UPLOAD)}
          />
        )}

        {appState === AppState.PROCESSING && (
          <ProcessingStatus />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <div className="text-red-500 font-bold text-xl mb-2">Analysis Failed</div>
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <button 
              onClick={reset}
              className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {appState === AppState.RESULTS && analysisData && (
          <div className={`grid grid-cols-1 ${videoUrl ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8 h-auto min-h-[calc(100vh-8rem)]`}>
            {/* Left Column: Video Player */}
            {videoUrl && (
              <div className="lg:col-span-5 flex flex-col gap-4 video-section print:hidden">
                <div className="bg-black rounded-xl overflow-hidden shadow-lg sticky top-24">
                   <video 
                     ref={videoRef}
                     src={videoUrl} 
                     controls 
                     className="w-full aspect-video"
                   />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Recording Info</h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">In-Memory Only</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p><span className="font-medium text-slate-900">Filename:</span> {mediaFile?.name}</p>
                    <p><span className="font-medium text-slate-900">Size:</span> {(mediaFile?.size ? mediaFile.size / 1024 / 1024 : 0).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Right Column: Clarity Sheet */}
            <div className={`${videoUrl ? 'lg:col-span-7' : 'max-w-4xl mx-auto w-full'} h-full`}>
               {!videoUrl && (
                 <button 
                   onClick={() => setAppState(AppState.HISTORY)}
                   className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-medium print:hidden"
                 >
                   <ArrowLeft className="w-4 h-4" /> Back to Session History
                 </button>
               )}
              <ClaritySheet data={analysisData} onSeek={handleSeek} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
