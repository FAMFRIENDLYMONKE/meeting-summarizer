export interface Summary {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  originalText: string;
}

export interface PromptSettings {
  temperature: number;
  maxTokens: number;
  customPrompt: string;
  toneStyle: "professional" | "casual" | "technical";
  outputFormat: "paragraphs" | "bullets" | "numbered";
  language: "english" | "spanish" | "french" | "german";
  summaryLength: "short" | "medium" | "long";
  includeActionItems: boolean;
  includeDatetime: boolean;
  includeParticipants: boolean;
}

export interface FileUploadState {
  file: File | null;
  text: string | null;
  error: string | null;
}
