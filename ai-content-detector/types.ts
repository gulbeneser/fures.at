export interface ReasoningItem {
  factor: string;
  score: number;
  explanation: string;
}

export interface AnalysisResult {
  probability: number;
  confidence: number;
  summary: string;
  breakdown: {
    aiGenerated: number;
    mixed: number;
    human: number;
  };
  reasoning: ReasoningItem[];
  marginOfErrorWarning: string | null;
  model_version: string;
}

export enum Tone {
  Automatic = "Automatic",
  AIDetectorProof = "AI Detector Proof",
  ProfessionalAndClear = "Professional and Clear",
  FunnyAndClever = "Funny and Clever",
  CaringAndEmpathic = "Caring and Empathic",
  ConcreteAndHelpful = "Concrete, To The Point And Helpful",
  Other = "Other",
}
