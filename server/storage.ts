import { randomUUID } from "crypto";

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface Survey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  createdAt: Date;
}

export interface SurveyQuestion {
  id: string;
  type: "text" | "multiple-choice" | "rating" | "yes-no";
  question: string;
  options?: string[];
}

export interface SurveyResponse {
  id: string;
  answers: Record<string, string | number>;
  submittedAt: Date;
}

export interface ClipboardItem {
  id: string;
  code: string;
  content: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface SharedText {
  id: string;
  content: string;
  views: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface SharedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  downloads: number;
  maxDownloads?: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface ShortUrl {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
}

export interface IStorage {
  // Polls
  createPoll(question: string, options: string[]): Poll;
  getPoll(id: string): Poll | undefined;
  votePoll(id: string, optionIndex: number): Poll | undefined;
  
  // Surveys
  createSurvey(title: string, questions: SurveyQuestion[]): Survey;
  getSurvey(id: string): Survey | undefined;
  submitSurveyResponse(surveyId: string, answers: Record<string, string | number>): boolean;
  
  // Clipboard
  saveClipboard(content: string): ClipboardItem;
  getClipboard(code: string): ClipboardItem | undefined;
  
  // Shared Text
  shareText(content: string, expirationHours: number): SharedText;
  getSharedText(id: string): SharedText | undefined;
  
  // Shared Files
  shareFile(filename: string, originalName: string, size: number, expirationHours: number): SharedFile;
  getSharedFile(id: string): SharedFile | undefined;
  incrementFileDownload(id: string): boolean;
  
  // URL Shortener
  shortenUrl(originalUrl: string, customAlias?: string): ShortUrl;
  getShortUrl(shortCode: string): ShortUrl | undefined;
  incrementUrlClick(shortCode: string): boolean;
}

function generateCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class MemStorage implements IStorage {
  private polls: Map<string, Poll> = new Map();
  private surveys: Map<string, Survey> = new Map();
  private clipboards: Map<string, ClipboardItem> = new Map();
  private sharedTexts: Map<string, SharedText> = new Map();
  private sharedFiles: Map<string, SharedFile> = new Map();
  private shortUrls: Map<string, ShortUrl> = new Map();

  // Polls
  createPoll(question: string, options: string[]): Poll {
    const poll: Poll = {
      id: randomUUID(),
      question,
      options,
      votes: options.map(() => 0),
      createdAt: new Date(),
    };
    this.polls.set(poll.id, poll);
    return poll;
  }

  getPoll(id: string): Poll | undefined {
    return this.polls.get(id);
  }

  votePoll(id: string, optionIndex: number): Poll | undefined {
    const poll = this.polls.get(id);
    if (poll && optionIndex >= 0 && optionIndex < poll.options.length) {
      poll.votes[optionIndex]++;
      return poll;
    }
    return undefined;
  }

  // Surveys
  createSurvey(title: string, questions: SurveyQuestion[]): Survey {
    const survey: Survey = {
      id: randomUUID(),
      title,
      questions,
      responses: [],
      createdAt: new Date(),
    };
    this.surveys.set(survey.id, survey);
    return survey;
  }

  getSurvey(id: string): Survey | undefined {
    return this.surveys.get(id);
  }

  submitSurveyResponse(surveyId: string, answers: Record<string, string | number>): boolean {
    const survey = this.surveys.get(surveyId);
    if (survey) {
      survey.responses.push({
        id: randomUUID(),
        answers,
        submittedAt: new Date(),
      });
      return true;
    }
    return false;
  }

  // Clipboard
  saveClipboard(content: string): ClipboardItem {
    const code = generateCode();
    const item: ClipboardItem = {
      id: randomUUID(),
      code,
      content,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    this.clipboards.set(code, item);
    return item;
  }

  getClipboard(code: string): ClipboardItem | undefined {
    const item = this.clipboards.get(code);
    if (item && item.expiresAt > new Date()) {
      return item;
    }
    return undefined;
  }

  // Shared Text
  shareText(content: string, expirationHours: number = 24): SharedText {
    const text: SharedText = {
      id: randomUUID(),
      content,
      views: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
    };
    this.sharedTexts.set(text.id, text);
    return text;
  }

  getSharedText(id: string): SharedText | undefined {
    const text = this.sharedTexts.get(id);
    if (text && text.expiresAt > new Date()) {
      text.views++;
      return text;
    }
    return undefined;
  }

  // Shared Files
  shareFile(filename: string, originalName: string, size: number, expirationHours: number = 24): SharedFile {
    const file: SharedFile = {
      id: randomUUID(),
      filename,
      originalName,
      size,
      downloads: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
    };
    this.sharedFiles.set(file.id, file);
    return file;
  }

  getSharedFile(id: string): SharedFile | undefined {
    const file = this.sharedFiles.get(id);
    if (file && file.expiresAt > new Date()) {
      return file;
    }
    return undefined;
  }

  incrementFileDownload(id: string): boolean {
    const file = this.sharedFiles.get(id);
    if (file) {
      file.downloads++;
      return true;
    }
    return false;
  }

  // URL Shortener
  shortenUrl(originalUrl: string, customAlias?: string): ShortUrl {
    const shortCode = customAlias || generateCode(6);
    const url: ShortUrl = {
      id: randomUUID(),
      shortCode,
      originalUrl,
      clicks: 0,
      createdAt: new Date(),
    };
    this.shortUrls.set(shortCode, url);
    return url;
  }

  getShortUrl(shortCode: string): ShortUrl | undefined {
    return this.shortUrls.get(shortCode);
  }

  incrementUrlClick(shortCode: string): boolean {
    const url = this.shortUrls.get(shortCode);
    if (url) {
      url.clicks++;
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
