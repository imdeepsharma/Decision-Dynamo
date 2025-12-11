import React from 'react';
import { Zap } from 'lucide-react';

export const ProcessingStatus: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 w-full">
      <div className="relative w-32 h-32 mb-8">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        
        {/* Inner circle with icon */}
        <div className="absolute inset-2 bg-white rounded-full shadow-xl flex items-center justify-center z-10 overflow-hidden">
           {/* Scanning effect */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-200/50 to-transparent w-full h-full animate-scan z-0"></div>
           <Zap className="w-12 h-12 text-indigo-600 relative z-10" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Decision Dynamo is Working...</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        Gemini is listening to voices, reading slides, and transforming chaos into clarity. This usually takes about 30-60 seconds.
      </p>
      
      <div className="flex gap-2 justify-center">
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};