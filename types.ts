/** * ENUMS 
 */
export enum ResourceTab {
  IELTS = 'IELTS',
  FAILURE_PATTERNS = 'Failure Patterns',
  FREE_MOCK = 'Free Mock',
  SAMPLE_TASKS = 'Sample Tasks',
  FLASHCARDS = 'Flashcards',
  MIND_JOURNALS = 'Mind Journals',
  BAND_PREDICTOR = 'Band Predictor',
  // BLOGS = 'Blogs',
  CONTACT = 'Contact Us',
}

export enum Section {
  HOME = 'HOME',
  READING = 'READING',
  LISTENING = 'LISTENING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  RESULTS = 'RESULTS'
}

/** * INTERFACES 
 */

// College & Admissions (from types.ts 1)
export interface CollegeInfo {
  name: string;
  location: string;
  rank: number;
  description: string;
  stats: {
    seats: number;
    medianPackage: string;
    cutOff: string;
  };
}

export interface ExamForm {
  name: string;
  startDate: string;
  endDate: string;
  examDate: string;
  link: string;
  status: 'Open' | 'Closed' | 'Coming Soon';
}

// Exam & Grading (from types.ts 2)
export interface Answers {
  reading: Record<number, string>;
  listening: Record<number, string>;
  writing: string;
  speaking: string;
  speakingSelfGrade?: number;
}

export interface SectionFeedback {
  score: number;
  grade: string;
  advice: string;
}

export interface Scores {
  reading: SectionFeedback;
  listening: SectionFeedback;
  writing: SectionFeedback;
  speaking: SectionFeedback;
  overall: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correct: string;
}

/** * CONSTANTS 
 */
export const SECTION_DURATIONS: Record<Section, number> = {
  [Section.HOME]: 0,
  [Section.LISTENING]: 180, // 3 minutes
  [Section.READING]: 170, // 2 minutes 50 seconds
  [Section.WRITING]: 300, // 5 minutes
  [Section.SPEAKING]: 120, // 2 minutes
  [Section.RESULTS]: 0
};