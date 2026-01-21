
import { Answers, Scores, SectionFeedback } from '../types';
import { READING_QUESTIONS, LISTENING_QUESTIONS } from '../constants';

const CONNECTORS = ["furthermore", "however", "consequently", "moreover", "nonetheless", "therefore", "subsequently", "alternatively", "paradoxically", "in contrast", "nevertheless", "further", "secondly", "initially", "ultimately", "for instance", "specifically"];
const WRITING_KEYWORDS = ["environment", "fuel", "price", "increase", "agree", "disagree", "pollution", "global", "economic", "solution"];
const SPEAKING_KEYWORDS = ["skill", "learned", "recently", "taught", "useful", "important", "ability", "mastered"];

export interface ModuleRoadmap {
  module: string;
  advice: string[];
}

export interface Roadmap {
  milestone: string;
  modules: ModuleRoadmap[];
}

const getCurrentStatusAnalysis = (section: string, band: number): string => {
  const statusMap: Record<string, Record<number, string>> = {
    Reading: {
      8: "Your reading skills are at an elite level. You demonstrate a sharp ability to identify nuanced arguments and maintain extreme focus through dense academic vocabulary without slowing down.",
      6: "You have a solid grasp of main ideas but frequently overlook subtle inferences or specific technical details. Your skimming is effective, but your scanning for precise detail needs refinement.",
      4: "You are successfully identifying basic factual information, but you struggle when the text employs advanced academic paraphrasing or highly complex sentence structures.",
      0: "Your current performance indicates a significant challenge with academic-level English texts. There is a frequent breakdown in comprehension when facing multi-clause sentences."
    },
    Listening: {
      8: "You demonstrate exceptional phonetic processing. You can follow fast-paced discussions effortlessly and filter out 'distractors' where speakers change their mind or clarify details.",
      6: "You follow the general flow of social conversations well but tend to lose track during high-speed academic lectures or when speakers utilize complex tone shifts to convey meaning.",
      4: "You capture familiar keywords and basic instructions but miss critical secondary details such as specific spellings, numerical values, or relationship markers between speakers.",
      0: "You are currently struggling to process spoken English at natural native speeds, leading to significant gaps in your ability to follow even basic narrative arcs."
    },
    Writing: {
      8: "Your writing is highly sophisticated. You utilize a wide range of academic lexical items with precision, and your logical flow is seamlessly cohesive across all paragraphs.",
      6: "You present a clear position, but your vocabulary choice tends to be repetitive. Your sentence structures are mostly simple, with visible effort when attempting complex forms.",
      4: "You address the task requirements partially, but your ideas lack sufficient extension. There is a heavy reliance on simple connectors (and, but) and basic subject-verb-object structures.",
      0: "The response is either significantly under the word count or fails to address the core prompt, showing very limited control over academic sentence formation."
    },
    Speaking: {
      8: "You speak fluently with minimal hesitation. Your use of idiomatic language is natural, your pronunciation is clear, and you can sustain complex arguments with ease.",
      6: "You are willing to speak at length but lack precision when handling abstract topics. Hesitation occurs primarily when you search for high-level vocabulary or idiomatic phrases.",
      4: "You can answer basic personal questions but struggle to sustain a two-minute long turn. Your fluency is hampered by frequent self-correction and a limited grammatical range.",
      0: "Your speech is currently fragmented. Long silences and difficulty communicating even simple personal information suggest a need for significant foundational practice."
    }
  };

  const bands = Object.keys(statusMap[section] || {}).map(Number).sort((a, b) => b - a);
  for (const b of bands) {
    if (band >= b) return statusMap[section][b];
  }
  return "Status assessment currently unavailable.";
};

export const getRoadToBand9 = (scores: Scores): Roadmap => {
  return {
    milestone: scores.overall >= 7 ? "Polishing for Elite Scores (8.5 - 9.0)" : "Strategy & Linguistic Foundation (7.0 - 8.0)",
    modules: [
      {
        module: "Reading",
        advice: [
          "Master 'Negative Fact' questions by practicing targeted scanning for three correct facts to eliminate the fourth.",
          "Build a specialized academic synonym bank focusing on research verbs like 'corroborate', 'refute', and 'postulate'.",
          "Set a strict 15-minute limit per passage during mock tests to create a 15-minute 'buffer' for final review.",
          "Read one peer-reviewed abstract daily from ScienceDaily to normalize dense information processing."
        ]
      },
      {
        module: "Listening",
        advice: [
          "Listen to academic podcasts (e.g., TED Radio Hour) at 1.5x speed to over-train your brain for Section 4 speed.",
          "Note-taking focus: Practice identifying 'signposting' phrases (e.g., 'What is more significant...', 'On the other hand...') to predict transitions.",
          "Drill spelling for 'trap' words common in IELTS: accommodation, government, environment, queue, schedule.",
          "Practice predicting the 'type' of word (noun, number, adjective) required before the audio starts."
        ]
      },
      {
        module: "Writing",
        advice: [
          "Sentence Variety: Ensure every paragraph contains at least one conditional (If...) and one concession (Although...) sentence.",
          "Lexical Precision: Use 'high-power' academic verbs. Replace 'increase' with 'escalate' or 'augment' where contextually appropriate.",
          "Planning: Spend exactly 5 minutes outlining your three main body points and their supporting evidence before writing a single word.",
          "Cohesion: Move beyond 'Firstly/Secondly'. Use advanced markers like 'Implicit in this argument is...', or 'A corollary to this point is...'"
        ]
      },
      {
        module: "Speaking",
        advice: [
          "The PPF Technique: For every Part 1 and Part 3 question, frame your answer using the Past, Present, and Future (e.g., 'I used to... but now... and in the future...').",
          "Eliminate Fillers: Replace 'um' and 'ah' with 'thinking phrases' like 'That’s a multi-faceted question' or 'To put it another way...'.",
          "Part 2 Mastery: Practice speaking for exactly 2 minutes on random objects in your room to build 'extemporaneous' fluency.",
          "Intonation: Focus on 'stressing' the content words in your sentence to sound more natural and persuasive to the examiner."
        ]
      }
    ]
  };
};

export const calculateScores = (answers: Answers): Scores => {
  const rRaw = READING_QUESTIONS.reduce((acc, q) => acc + (answers.reading[q.id] === q.correct ? 1 : 0), 0);
  const rBand = Math.round((rRaw / 3) * 9 * 2) / 2;
  const reading: SectionFeedback = { score: rBand, grade: "", advice: getCurrentStatusAnalysis("Reading", rBand) };

  const lRaw = LISTENING_QUESTIONS.reduce((acc, q) => acc + (answers.listening[q.id] === q.correct ? 1 : 0), 0);
  const lBand = Math.round((lRaw / 3) * 9 * 2) / 2;
  const listening: SectionFeedback = { score: lBand, grade: "", advice: getCurrentStatusAnalysis("Listening", lBand) };

  let wScore = 1.0;
  const wText = answers.writing.trim().toLowerCase();
  const wWords = wText.split(/\s+/).filter(w => w.length > 1);
  const kwMatch = WRITING_KEYWORDS.filter(kw => wText.includes(kw)).length;
  wScore += Math.min(3, (kwMatch / WRITING_KEYWORDS.length) * 5);
  const connMatch = CONNECTORS.filter(c => wText.includes(c)).length;
  wScore += Math.min(3, (connMatch / 4) * 2.5);
  const uniqueWords = new Set(wWords).size;
  if (wWords.length > 0) {
    const lexicalRatio = uniqueWords / wWords.length;
    if (lexicalRatio > 0.6 && wWords.length > 50) wScore += 2.0;
  }
  if (wWords.length > 150) wScore += 1.0;
  if (wWords.length < 50 && wWords.length > 0) wScore -= 2.0;
  const wBand = Math.round(Math.min(9, Math.max(0, wScore)) * 2) / 2;
  const writing: SectionFeedback = { score: wBand, grade: "", advice: getCurrentStatusAnalysis("Writing", wBand) };

  let sScore = answers.speakingSelfGrade || 0.0;
  if (!answers.speakingSelfGrade && answers.speaking) {
    const sText = answers.speaking.trim().toLowerCase();
    const sWords = sText.split(/\s+/).filter(w => w.length > 0);
    if (sWords.length > 60) sScore = 7.0;
    else if (sWords.length > 30) sScore = 5.0;
    else sScore = 2.0;
    const sKwMatch = SPEAKING_KEYWORDS.filter(kw => sText.includes(kw)).length;
    if (sKwMatch >= 3) sScore += 1.0;
    const sUnique = new Set(sWords).size;
    if (sWords.length > 0 && sUnique / sWords.length > 0.7) sScore += 1.0;
  }
  const sBand = Math.round(Math.min(9, Math.max(0, sScore)) * 2) / 2;
  const speaking: SectionFeedback = { score: sBand, grade: "", advice: getCurrentStatusAnalysis("Speaking", sBand) };

  const overall = Math.round(((reading.score + listening.score + writing.score + speaking.score) / 4) * 2) / 2;

  return { reading, listening, writing, speaking, overall };
};
