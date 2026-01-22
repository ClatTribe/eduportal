import React from "react";
import { Target } from "lucide-react";

const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

interface TargetProgramSectionProps {
  formData: {
    target_countries: string[];
    target_degree: string;
    target_field: string;
    budget: string;
    term: string;
  };
  isEditing: boolean;
  isExpanded: boolean;
  isComplete: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: string, value: string) => void;
  onMultiSelect: (value: string) => void;
  Section: any;
  SelectField: any;
  InputField: any;
}

const COUNTRIES = ['United States of America', 'United Kingdom', 'Italy', 'Australia', 'Germany', 'Europe (Other)'];

// ✅ UPDATED: Added all study level options to match filter and database
const DEGREE_OPTIONS = [
  { value: 'Undergraduate', label: 'Undergraduate' },
  { value: 'Postgraduate', label: 'Postgraduate' },
  { value: 'PhD', label: 'PhD' },
  { value: 'UG Diploma /Certificate /Associate Degree', label: 'UG Diploma / Certificate / Associate Degree' },
  { value: 'PG Diploma /Certificate', label: 'PG Diploma / Certificate' }
];

const TERM_OPTIONS = [
  { value: 'Spring 2026', label: 'Spring 2026' },
  { value: 'Summer 2026', label: 'Summer 2026' },
  { value: 'Fall 2026', label: 'Fall 2026' },
  { value: '2027', label: '2027 or later' }
];

const TargetProgramSection: React.FC<TargetProgramSectionProps> = ({
  formData,
  isEditing,
  isExpanded,
  isComplete,
  onToggle,
  onInputChange,
  onMultiSelect,
  Section,
  SelectField,
  InputField,
}) => {
  return (
    <Section
      id="target"
      title="What are you looking to study?"
      icon={Target}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Countries <span style={{ color: accentColor }}>*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => isEditing && onMultiSelect(country)}
              disabled={!isEditing}
              className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base font-medium ${
                !isEditing ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={
                formData.target_countries.includes(country)
                  ? {
                      borderColor: accentColor,
                      backgroundColor: '#FEF2F3',
                      color: accentColor,
                    }
                  : {
                      borderColor: borderColor,
                      backgroundColor: primaryBg,
                      color: '#374151',
                    }
              }
              onMouseEnter={(e) => {
                if (isEditing && !formData.target_countries.includes(country)) {
                  e.currentTarget.style.borderColor = accentColor;
                }
              }}
              onMouseLeave={(e) => {
                if (isEditing && !formData.target_countries.includes(country)) {
                  e.currentTarget.style.borderColor = borderColor;
                }
              }}
            >
              {country}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="What degree are you applying for?"
          value={formData.target_degree}
          onChange={onInputChange}
          field="target_degree"
          options={DEGREE_OPTIONS}
          required
          disabled={!isEditing}
        />
        <InputField
          label="Field of Interest"
          value={formData.target_field}
          onChange={onInputChange}
          field="target_field"
          placeholder="Computer Science, MBA, Medicine, etc."
          required
          disabled={!isEditing}
        />
        <SelectField
          label="When do you plan to start?"
          value={formData.term}
          onChange={onInputChange}
          field="term"
          options={TERM_OPTIONS}
          disabled={!isEditing}
        />
        <SelectField
          label="Budget Range (Annual)"
          value={formData.budget}
          onChange={onInputChange}
          field="budget"
          options={[
            { value: 'Under 10L', label: 'Under ₹10 Lakhs' },
            { value: '10-20L', label: '₹10-20 Lakhs' },
            { value: '20-30L', label: '₹20-30 Lakhs' },
            { value: 'Above 30L', label: 'Above ₹30 Lakhs' }
          ]}
          disabled={!isEditing}
        />
      </div>
    </Section>
  );
};

export default TargetProgramSection;