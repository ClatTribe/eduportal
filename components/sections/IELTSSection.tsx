import React from 'react';
import { FileText } from 'lucide-react'; // Added missing import

export const IELTSSection: React.FC = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const listeningScores = [
    { answers: '39–40', band: 9.0 },
    { answers: '37–38', band: 8.5 },
    { answers: '35–36', band: 8.0 },
    { answers: '32–34', band: 7.5 },
    { answers: '30–31', band: 7.0 },
    { answers: '26–29', band: 6.5 },
    { answers: '23–25', band: 6.0 },
    { answers: '18–22', band: 5.5 },
    { answers: '16–17', band: 5.0 },
    { answers: '13–15', band: 4.5 },
    { answers: '10–12', band: 4.0 },
  ];

  const readingScores = [
    { answers: '39–40', band: 9.0 },
    { answers: '37–38', band: 8.5 },
    { answers: '35–36', band: 8.0 },
    { answers: '33–34', band: 7.5 },
    { answers: '30–32', band: 7.0 },
    { answers: '27–29', band: 6.5 },
    { answers: '23–26', band: 6.0 },
    { answers: '19–22', band: 5.5 },
    { answers: '15–18', band: 5.0 },
    { answers: '13–14', band: 4.5 },
    { answers: '10–12', band: 4.0 },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div 
        className="p-8 rounded-3xl"
        style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-4xl font-bold mb-4" style={{ color: accentColor }}>
          What is IELTS?
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          The International English Language Testing System (IELTS) is a globally recognized exam designed to measure a person's ability to communicate in English. It is widely used for study abroad admissions, immigration, and employment purposes, especially in English-speaking countries such as the UK, Canada, Australia, New Zealand, and the USA.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl" style={{ border: `1px solid ${borderColor}` }}>
            <p className="text-3xl font-bold mb-1" style={{ color: accentColor }}>11,000+</p>
            <p className="text-gray-600 text-sm">Institutions Worldwide</p>
          </div>
          <div className="p-4 bg-white rounded-2xl" style={{ border: `1px solid ${borderColor}` }}>
            <p className="text-3xl font-bold mb-1" style={{ color: accentColor }}>140+</p>
            <p className="text-gray-600 text-sm">Countries Accept IELTS</p>
          </div>
          <div className="p-4 bg-white rounded-2xl" style={{ border: `1px solid ${borderColor}` }}>
            <p className="text-3xl font-bold mb-1" style={{ color: accentColor }}>6.0–7.5</p>
            <p className="text-gray-600 text-sm">Required Band Score</p>
          </div>
        </div>
      </div>

      {/* Types & Modes */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Types & Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: lightBg, color: accentColor }}
            >
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: accentColor }}>
              IELTS Academic
            </h3>
            <p className="text-gray-600">
              Designed for students planning to pursue higher studies abroad at universities and colleges.
            </p>
          </div>
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: lightBg, color: accentColor }}
            >
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: accentColor }}>
              IELTS General Training
            </h3>
            <p className="text-gray-600">
              Suitable for those seeking work experience, training programs, or immigration purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Exam Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: accentColor }}>Listening</h3>
            <p className="text-gray-600 text-sm mb-2">40 Questions</p>
            <p className="text-2xl font-bold text-gray-800">30 min</p>
          </div>
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: accentColor }}>Reading</h3>
            <p className="text-gray-600 text-sm mb-2">40 Questions</p>
            <p className="text-2xl font-bold text-gray-800">60 min</p>
          </div>
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: accentColor }}>Writing</h3>
            <p className="text-gray-600 text-sm mb-2">2 Tasks</p>
            <p className="text-2xl font-bold text-gray-800">60 min</p>
          </div>
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: accentColor }}>Speaking</h3>
            <p className="text-gray-600 text-sm mb-2">3 Parts</p>
            <p className="text-2xl font-bold text-gray-800">11–14 min</p>
          </div>
        </div>
      </div>

      {/* Scoring System */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Scoring System</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Listening Scores */}
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: accentColor }}>
              Listening Score Conversion
            </h3>
            <div className="space-y-2">
              {listeningScores.map((score, idx) => (
                <div 
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-xl"
                  style={{ backgroundColor: idx % 2 === 0 ? lightBg : 'white' }}
                >
                  <span className="text-gray-700 font-medium">{score.answers} correct</span>
                  <span 
                    className="font-bold text-lg"
                    style={{ color: accentColor }}
                  >
                    Band {score.band}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reading Scores */}
          <div 
            className="p-6 rounded-3xl bg-white"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: accentColor }}>
              Reading Score Conversion
            </h3>
            <div className="space-y-2">
              {readingScores.map((score, idx) => (
                <div 
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-xl"
                  style={{ backgroundColor: idx % 2 === 0 ? lightBg : 'white' }}
                >
                  <span className="text-gray-700 font-medium">{score.answers} correct</span>
                  <span 
                    className="font-bold text-lg"
                    style={{ color: accentColor }}
                  >
                    Band {score.band}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Validity & Retakes */}
      <div 
        className="p-8 rounded-3xl"
        style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}
      >
        <h2 className="text-3xl font-bold mb-6" style={{ color: accentColor }}>
          Validity & Re-takes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'white', color: accentColor }}
            >
              <span className="font-bold text-lg">1</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">IELTS scores are valid for 2 years from the test date.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'white', color: accentColor }}
            >
              <span className="font-bold text-lg">2</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Expired scores are not accepted for study, work, or immigration.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'white', color: accentColor }}
            >
              <span className="font-bold text-lg">3</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">There is no limit to the number of times you can take the exam and no waiting period for retaking IELTS.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; // Fixed: Added missing closing brace and semicolon