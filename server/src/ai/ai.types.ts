export interface AnalysisInput {
  title: string;
  meetingDate: string; // YYYY-MM-DD
  type: string;
  participants: string[];
  transcript: string;
}

export interface AiProvider {
  name: string;
  analyze(input: AnalysisInput): Promise<string>;
}

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}