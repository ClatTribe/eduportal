import React from "react";
import { BookOpen, Plus, Minus } from "lucide-react";

const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

interface TestScore {
  exam: string;
  score: string;
}

interface TestScoresSectionProps {
  testScores: TestScore[];
  isEditing: boolean;
  isExpanded: boolean;
  isComplete: boolean;
  onToggle: (id: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "exam" | "score", value: string) => void;
  Section: any;
}

const COMMON_EXAMS = [
  'GRE', 'GMAT', 'TOEFL', 'IELTS', 'Duolingo English Test',
  'PTE Academic', 'TestDaF', 'Goethe Certificate', 'DELF/DALF',
  'SAT', 'ACT', 'Other'
];

const TestScoresSection: React.FC<TestScoresSectionProps> = ({
  testScores,
  isEditing,
  isExpanded,
  isComplete,
  onToggle,
  onAdd,
  onRemove,
  onChange,
  Section,
}) => {
  return (
    <Section
      id="tests"
      title="Test Scores"
      icon={BookOpen}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <div className="flex items-center justify-between mb-4">
        {isEditing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-white px-3 sm:px-4 py-2 rounded-lg transition-all ml-auto text-sm sm:text-base"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            Add Test
          </button>
        )}
      </div>
      {testScores.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
          {isEditing ? (
            <p>No test scores added yet. Click "Add Test" to add your scores.</p>
          ) : (
            <p>No test scores available.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {testScores.map((test, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-lg"
              style={{ backgroundColor: '#FEF2F3', border: `1px solid ${borderColor}` }}
            >
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                {isEditing ? (
                  <select
                    value={test.exam}
                    onChange={(e) => onChange(index, "exam", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none text-gray-800"
                    style={{ borderColor: borderColor }}
                    onFocus={(e) => e.target.style.borderColor = accentColor}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                  >
                    <option value="">Select Exam</option>
                    {COMMON_EXAMS.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p 
                    className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg text-gray-800 bg-gray-100"
                  >
                    {test.exam}
                  </p>
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                <input
                  type="text"
                  value={test.score}
                  onChange={(e) => onChange(index, "score", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none text-gray-800 placeholder:text-gray-400 disabled:bg-gray-100"
                  style={{ borderColor: borderColor }}
                  onFocus={(e) => isEditing && (e.target.style.borderColor = accentColor)}
                  onBlur={(e) => isEditing && (e.target.style.borderColor = borderColor)}
                  placeholder="e.g., 325, 7.5, 110"
                />
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemove(index)}
                  className="sm:mt-8 p-2 sm:p-3 rounded-lg transition-all self-end sm:self-auto"
                  style={{ color: accentColor, backgroundColor: '#FEF2F3' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = borderColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F3'}
                  title="Remove test"
                >
                  <Minus size={18} className="sm:w-[20px] sm:h-[20px]" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
};

export default TestScoresSection;