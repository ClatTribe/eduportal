
import {
  BookOpen,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Layers,
  Brain,
  BarChart,
  Mail,
} from 'lucide-react';
import { ResourceTab, Question } from './types';

/**
 * UI & NAVIGATION CONSTANTS
 */


export const RESOURCE_TABS = [
  { id: ResourceTab.IELTS, icon: <BookOpen className="w-5 h-5" />, label: 'IELTS' },
  { id: ResourceTab.FAILURE_PATTERNS, icon: <AlertTriangle className="w-5 h-5" />, label: 'Failure Patterns' },
  { id: ResourceTab.FREE_MOCK, icon: <ClipboardCheck className="w-5 h-5" />, label: 'Free Mock' },
  { id: ResourceTab.SAMPLE_TASKS, icon: <FileText className="w-5 h-5" />, label: 'Sample Tasks' },
  { id: ResourceTab.FLASHCARDS, icon: <Layers className="w-5 h-5" />, label: 'Flashcards' },
  { id: ResourceTab.MIND_JOURNALS, icon: <Brain className="w-5 h-5" />, label: 'Mind Journals', isNew: true },
  { id: ResourceTab.BAND_PREDICTOR, icon: <BarChart className="w-5 h-5" />, label: 'Band Predictor' },
  // { id: ResourceTab.BLOGS, icon: <PenTool className="w-5 h-5" />, label: 'Blogs' },
  { id: ResourceTab.CONTACT, icon: <Mail className="w-5 h-5" />, label: 'Contact Us' },
];

/**
 * READING SECTION
 */
export const READING_PASSAGE = `
Urbanization represents one of the most significant transformations of the global landscape in the 21st century. As cities expand to accommodate a burgeoning population, the natural habitats that once thrived are replaced by concrete jungles. This process has profound implications for biodiversity. While some species, often referred to as "urban exploiters" like pigeons and rodents, thrive in these new environments, many specialized species face local extinction. The fragmentation of habitats prevents the migration of wildlife, leading to isolated populations that are more susceptible to genetic bottlenecks and environmental changes. Furthermore, the "urban heat island" effect alters local climates, forcing flora and fauna to adapt at an unprecedented rate or perish. However, some researchers argue that urban planning incorporating "green corridors" can mitigate these negative impacts, providing a blueprint for sustainable coexistence between human expansion and natural preservation.
`;
export const READING_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "According to the passage, what is a primary cause of local extinction in urban areas?",
    options: ["Increased genetic diversity", "Habitat fragmentation", "A decrease in the rodent population", "Cooler local climates"],
    correct: "Habitat fragmentation"
  },
  {
    id: 2,
    text: "Which term is used to describe species that thrive in city environments?",
    options: ["Specialized species", "Genetic bottlenecks", "Urban exploiters", "Green corridors"],
    correct: "Urban exploiters"
  },
  {
    id: 3,
    text: "What is the proposed solution mentioned for mitigating biodiversity loss?",
    options: ["Building more concrete structures", "Urban heat islands", "Green corridors", "Isolated populations"],
    correct: "Green corridors"
  }
];

/**
 * LISTENING SECTION
 */
export const LISTENING_SCRIPT = `
In this audio, you will listen a conversation between a librarian and a student.

Librarian: Good morning! Uh—welcome to the Central University Library. How can I help you today?

Student: Hi! I’m looking to book a private study room for a group project. We’d need it for tomorrow afternoon.

Librarian: Okay. So, we have three types of rooms—small ones for two people, medium rooms for up to six, and large rooms for bigger groups. Which one were you thinking of?

Student: There are four of us, so a medium room would work well. Is there one available… around 2 PM?

Librarian: Let me just check the system for a moment… okay, yes—Room 4B is free from 2:00 to 4:00 PM. I’ll just need your student ID to confirm the booking.

Student: Sure, here you go. Oh—and does the room have a projector?

Librarian: Room 4B doesn’t have one built in, but you can borrow a portable projector from the front desk using your ID.

Student: That’s great. Thanks so much!
`;

export const LISTENING_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What size room does the student request?",
    options: ["Small", "Medium", "Large", "Extra Large"],
    correct: "Medium"
  },
  {
    id: 2,
    text: "Which room number is assigned to the student?",
    options: ["Room 2A", "Room 4B", "Room 6C", "Room 101"],
    correct: "Room 4B"
  },
  {
    id: 3,
    text: "How can the student obtain a projector?",
    options: ["It is already in the room", "By paying a small fee", "Borrowing one from the front desk", "The library doesn't have any"],
    correct: "Borrowing one from the front desk"
  }
];

/**
 * WRITING & SPEAKING PROMPTS
 */
export const WRITING_PROMPT = "Some people believe that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?";

export const SPEAKING_CUE_CARD = "Describe a skill you learned recently. You should say: what it is, who taught you, and why it is useful.";