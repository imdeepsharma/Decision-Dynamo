
import React from 'react';
import { MeetingRecord } from '../types';
import { Clock, Calendar, ChevronRight, FileVideo, ShieldAlert } from 'lucide-react';

interface MeetingHistoryProps {
  history: MeetingRecord[];
  onSelect: (record: MeetingRecord) => void;
  onBack: () => void;
}

export const MeetingHistory: React.FC<MeetingHistoryProps> = ({ history, onSelect, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto mt-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Session History</h2>
          <p className="text-slate-500 mt-1">Review clarity sheets from your current browser session.</p>
        </div>
        <button 
          onClick={onBack}
          className="text-slate-600 hover:text-indigo-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          ← Back to Upload
        </button>
      </div>

      {/* Persistence Notice */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Important:</span> These results are stored only in your browser's session memory. If you close this tab or window, this history will be <span className="font-bold uppercase tracking-tighter">purged permanently</span>. Download a PDF if you need to keep a copy.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">No Session History</h3>
          <p className="text-slate-500">Analyze a meeting to see results here during this session.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((record) => (
            <div 
              key={record.id}
              onClick={() => onSelect(record)}
              className="group relative bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <FileVideo className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">{record.fileName}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Decisions</div>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                      {record.analysis.decisions.length}
                    </span>
                 </div>
                 <div className="text-right hidden sm:block px-4 border-r border-slate-100 mr-2">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Actions</div>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                      {record.analysis.actions.length}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
