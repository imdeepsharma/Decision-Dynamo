
import React, { useState } from 'react';
import { Upload, FileVideo, FileText, AlertCircle, Key, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

interface FileUploadProps {
  onProcess: (media: File, slides?: File) => void;
  isLoading: boolean;
  hasApiKey: boolean;
  onConnectKey: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onProcess, isLoading, hasApiKey, onConnectKey }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 200 * 1024 * 1024) {
        setError("For optimal processing, please keep files under 200MB. Larger files may take longer.");
        return;
      }
      setMediaFile(file);
      setError(null);
    }
  };

  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSlideFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      onConnectKey();
      return;
    }
    if (!mediaFile) {
      setError("Please upload a meeting recording.");
      return;
    }
    onProcess(mediaFile, slideFile || undefined);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <Upload className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Analyze New Meeting</h2>
        <p className="text-slate-500 mt-2">Upload your recording to extract clarity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Key Status */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${hasApiKey ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center gap-3">
            {hasApiKey ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <Key className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <p className={`text-sm font-semibold ${hasApiKey ? 'text-emerald-800' : 'text-amber-800'}`}>
                {hasApiKey ? 'Gemini API Key Connected' : 'API Key Required'}
              </p>
              <p className={`text-xs ${hasApiKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                {hasApiKey ? 'Using your personal API key' : 'Connect a paid key to start analysis'}
              </p>
            </div>
          </div>
          {!hasApiKey && (
            <button
              type="button"
              onClick={onConnectKey}
              className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Connect Key
            </button>
          )}
        </div>

        {/* Media Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Meeting Recording (Video/Audio)</label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors">
            <input 
              type="file" 
              accept="video/*,audio/*"
              onChange={handleMediaChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center space-x-3">
              <FileVideo className="w-6 h-6 text-slate-400" />
              <span className="text-slate-600 font-medium truncate max-w-[200px]">
                {mediaFile ? mediaFile.name : "Drop MP4, MP3, WAV here"}
              </span>
            </div>
          </div>
        </div>

        {/* Slides Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Slides / Context (Optional)</label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors">
            <input 
              type="file" 
              accept="application/pdf,image/*"
              onChange={handleSlideChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-6 h-6 text-slate-400" />
              <span className="text-slate-600 font-medium truncate max-w-[200px]">
                {slideFile ? slideFile.name : "Drop PDF or Images"}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Shield */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
          <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">Zero-Persistence Policy</p>
            <p className="text-[11px] text-slate-500 leading-normal">
              No data is ever saved to a server. Uploaded files remain in your browser's temporary memory. All analysis results are stored in <span className="font-bold text-slate-700">Session Storage</span> and will be purged permanently the moment you close this tab.
            </p>
          </div>
        </div>

        {!hasApiKey && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-[11px] text-slate-500 leading-normal">
              Note: This app requires a Gemini API key from a paid GCP project. 
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 ml-1"
              >
                Learn about billing <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (hasApiKey && !mediaFile)}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all ${
            isLoading 
              ? 'bg-slate-300 cursor-not-allowed' 
              : !hasApiKey 
                ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/30'
                : !mediaFile 
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Summoning Clarity...' : !hasApiKey ? 'Connect API Key' : 'Process Meeting'}
        </button>
      </form>
    </div>
  );
};
