import React from "react";
import { Trophy } from "lucide-react";

const borderColor = '#FECDD3';

interface ExtracurricularSectionProps {
  formData: {
    extracurricular: string;
  };
  isEditing: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: string, value: string) => void;
  Section: any;
}

const ExtracurricularSection: React.FC<ExtracurricularSectionProps> = ({
  formData,
  isEditing,
  isExpanded,
  onToggle,
  onInputChange,
  Section,
}) => {
  return (
    <Section
      id="extra"
      title="Extracurricular Activities"
      icon={Trophy}
      isExpanded={isExpanded}
      isComplete={false}
      onToggle={onToggle}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your achievements, activities, and experiences
        </label>
        <textarea
          value={formData.extracurricular}
          onChange={(e) => onInputChange("extracurricular", e.target.value)}
          disabled={!isEditing}
          rows={6}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none text-gray-800 placeholder:text-gray-400 disabled:bg-gray-100 resize-none"
          style={{ borderColor: borderColor }}
          placeholder="Include sports, volunteer work, leadership roles, competitions, research projects, internships, etc."
        />
      </div>
    </Section>
  );
};

export default ExtracurricularSection;