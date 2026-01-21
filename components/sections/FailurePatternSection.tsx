import React, { useState } from "react";
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const FailurePatternSection: React.FC = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const [openCards, setOpenCards] = useState<{ [key: number]: boolean }>({});

  const toggleCard = (index: number) => {
    setOpenCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const modulePatterns = [
    {
      title: "Listening",
      icon: Headphones,
      color: accentColor,
      bg: lightBg,
      patterns: [
        "Losing focus and missing key details",
        "Difficulty with accents and fast speech",
        "Poor spelling or incorrect word forms",
        "Not reading questions in advance"
      ]
    },
    {
      title: "Reading",
      icon: BookOpen,
      color: "#2563EB",
      bg: "#EFF6FF",
      patterns: [
        "Weak skimming and scanning skills",
        "Spending too much time on one passage",
        "Vocabulary gaps and misunderstanding paraphrasing",
        "Incorrect transfer of answers to the answer sheet"
      ]
    },
    {
      title: "Writing",
      icon: PenTool,
      color: "#7C3AED",
      bg: "#F5F3FF",
      patterns: [
        "Not answering the task fully (off-topic responses)",
        "Weak structure and paragraphing",
        "Limited vocabulary and repetitive grammar",
        "Poor task achievement in Task 1 or weak argument development in Task 2"
      ]
    },
    {
      title: "Speaking",
      icon: Mic,
      color: "#059669",
      bg: "#ECFDF5",
      patterns: [
        "Short, memorized, or unnatural answers",
        "Grammatical inaccuracies affecting clarity",
        "Poor pronunciation and fluency",
        "Lack of ideas or hesitation"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div 
        className="p-8 rounded-3xl"
        style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-4xl font-bold mb-4" style={{ color: accentColor }}>
          Common Failure Patterns in IELTS
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed">
          In IELTS, candidates do not technically "fail", but many are unable to reach their required band due to recurring failure patterns. Understanding and avoiding these common mistakes is crucial for success.
        </p>
      </div>

      {/* 2x2 Grid for Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulePatterns.map((module, index) => {
          const Icon = module.icon;
          const isOpen = openCards[index] || false;

          return (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden transition-all"
              style={{ border: `1px solid ${borderColor}` }}
            >
              {/* Header */}
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: module.bg, color: module.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {module.title}
                  </h3>
                </div>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: isOpen ? module.bg : 'transparent' }}
                >
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" style={{ color: module.color }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Dropdown Content */}
              {isOpen && (
                <div className="px-6 pb-6 pt-2 space-y-3">
                  {module.patterns.map((pattern, pIndex) => (
                    <div
                      key={pIndex}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: module.bg }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'white', color: module.color }}
                      >
                        <span className="text-xs font-bold">{pIndex + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {pattern}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Patterns - Full Width */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: `1px solid ${borderColor}` }}
      >
        {/* Header */}
        <button
          onClick={() => toggleCard(999)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#FEF2E8', color: '#EA580C' }}
            >
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Overall Patterns
            </h3>
          </div>
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: openCards[999] ? '#FEF2E8' : 'transparent' }}
          >
            {openCards[999] ? (
              <ChevronUp className="w-5 h-5" style={{ color: '#EA580C' }} />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Dropdown Content */}
        {openCards[999] && (
          <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "Lack of exam strategy",
                "Insufficient timed practice",
                "Over-reliance on memorized templates"
              ].map((pattern, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: '#FEF2E8' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'white', color: '#EA580C' }}
                  >
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    {pattern}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div 
        className="p-8 rounded-3xl text-center"
        style={{ 
          background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccent})` 
        }}
      >
        <h3 className="text-2xl font-bold text-white mb-3">
          Ready to Overcome These Patterns?
        </h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Our comprehensive preparation materials and practice tests are designed to help you identify and eliminate these common failure patterns.
        </p>
        <button 
          className="px-8 py-4 bg-white font-bold rounded-2xl hover:shadow-xl transition-all"
          style={{ color: accentColor }}
        >
          Start Practicing Now
        </button>
      </div>
    </div>
  );
};