export interface Decision {
  topic: string;
  decision: string;
  owner: string;
  timestamp: string;
  slideRef?: string;
}

export interface ActionItem {
  task: string;
  owner: string;
  due: string;
  confidence: number;
  timestamp: string;
}

export interface Risk {
  risk: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface OpenQuestion {
  question: string;
  timestamp: string;
}

export interface MeetingAnalysis {
  summary: string;
  keyChanges: string[];
  decisions: Decision[];
  actions: ActionItem[];
  risks: Risk[];
  openQuestions: OpenQuestion[];
}

export interface MeetingRecord {
  id: string;
  fileName: string;
  date: string;
  analysis: MeetingAnalysis;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY'
}