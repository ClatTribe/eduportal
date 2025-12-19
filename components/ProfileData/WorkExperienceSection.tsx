import React from "react";
import { Award } from "lucide-react";

interface WorkExperienceSectionProps {
  formData: {
    has_experience: string;
    experience_years: string;
    experience_field: string;
  };
  isEditing: boolean;
  isExpanded: boolean;
  isComplete: boolean;
  visible?: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: string, value: string) => void;
  Section: any;
  SelectField: any;
  InputField: any;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  formData,
  isEditing,
  isExpanded,
  isComplete,
  visible = true,
  onToggle,
  onInputChange,
  Section,
  SelectField,
  InputField,
}) => {
  return (
    <Section
      id="experience"
      title="Work Experience"
      icon={Award}
      visible={visible}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <SelectField
        label="Do you have work experience?"
        value={formData.has_experience}
        onChange={onInputChange}
        field="has_experience"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        required
        disabled={!isEditing}
      />
      {formData.has_experience === "Yes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField
            label="Years of Experience"
            type="number"
            value={formData.experience_years}
            onChange={onInputChange}
            field="experience_years"
            placeholder="2"
            disabled={!isEditing}
          />
          <InputField
            label="Field/Industry"
            value={formData.experience_field}
            onChange={onInputChange}
            field="experience_field"
            placeholder="IT, Finance, Healthcare, etc."
            disabled={!isEditing}
          />
        </div>
      )}
    </Section>
  );
};

export default WorkExperienceSection;