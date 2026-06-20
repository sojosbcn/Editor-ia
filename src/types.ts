/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProjectPhase {
  EVALUATION = 1,
  DRAFTING = 2,
  FIRST_REVIEW = 3,
  LAYOUT = 4,
  FINAL_MARKET = 5,
  COMPLETED = 6
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  groundingChunks?: any[];
}

export interface DepartmentReport {
  department: string;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MarketAnalysis {
  historicalData: string;
  trends: string;
  financialProjections: {
    roi: string;
    investmentPlan: string;
    rrp: string;
  };
}

export interface ProjectState {
  id: string;
  title: string;
  concept: string;
  currentPhase: ProjectPhase;
  manuscript: string;
  humanizedManuscript: string;
  originalStory?: string;
  illustrationPrompts: string[];
  marketAnalysis: MarketAnalysis | null;
  departments: DepartmentReport[];
  messages: Message[];
}

export const DEPARTMENTS = {
  PROOFREADING: 'Proofreading & Style Team',
  DESIGN: 'Design & Art Teams',
  KDP: 'Amazon KDP & Platform Strategy Team',
  REWRITING: 'Rewriting Team',
  HUMANIZER: 'AI-Text Analysis Team (Zero-AI Enforcement)',
  SALES: 'Sales & Advertising Teams',
  MARKET: 'Market Analysis Team'
};
