import React, { useState } from 'react';
import { Upload, FileVideo, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onProcess: (media: File, slides?: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onProcess, isLoading }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic client-side check for demonstration. Real apps handle larger chunks.
      // Gemini 2.5 Flash can handle large context, but browser memory for base64 is the limit.
      if (file.size > 50 * 1024 * 1024) {
        setError("For this browser-based demo, please use files under 50MB to avoid crashing the tab. (Gemini supports up to 2GB via File API in production).");
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
        <h2 className="text-2xl font-bold text-slate-800">Upload Meeting</h2>
        <p className="text-slate-500 mt-2">Upload your recording to extract clarity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <span className="text-slate-600 font-medium truncate">
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
              <span className="text-slate-600 font-medium truncate">
                {slideFile ? slideFile.name : "Drop PDF or Images"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !mediaFile}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all ${
            isLoading || !mediaFile 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Summoning Clarity...' : 'Process Meeting'}
        </button>
      </form>
    </div>
  );
};
