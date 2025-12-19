import React from "react";
import { GraduationCap } from "lucide-react";

interface AcademicSectionProps {
  id: string;
  title: string;
  type: "tenth" | "twelfth" | "ug" | "pg";
  formData: any;
  isEditing: boolean;
  isExpanded: boolean;
  isComplete: boolean;
  visible?: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: string, value: string) => void;
  Section: any;
  InputField: any;
  SelectField: any;
}

const AcademicSection: React.FC<AcademicSectionProps> = ({
  id,
  title,
  type,
  formData,
  isEditing,
  isExpanded,
  isComplete,
  visible = true,
  onToggle,
  onInputChange,
  Section,
  InputField,
  SelectField,
}) => {
  const renderFields = () => {
    switch (type) {
      case "tenth":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <SelectField
              label="Board"
              value={formData.tenth_board}
              onChange={onInputChange}
              field="tenth_board"
              options={[
                { value: "CBSE", label: "CBSE" },
                { value: "ICSE", label: "ICSE" },
                { value: "State Board", label: "State Board" },
                { value: "Other", label: "Other" },
              ]}
              required
              disabled={!isEditing}
            />
            <InputField
              label="Year of Passing"
              type="number"
              value={formData.tenth_year}
              onChange={onInputChange}
              field="tenth_year"
              placeholder="2019"
              required
              disabled={!isEditing}
            />
            <InputField
              label="Percentage/CGPA"
              value={formData.tenth_score}
              onChange={onInputChange}
              field="tenth_score"
              placeholder="85% or 9.5 CGPA"
              required
              disabled={!isEditing}
            />
          </div>
        );

      case "twelfth":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Board"
              value={formData.twelfth_board}
              onChange={onInputChange}
              field="twelfth_board"
              options={[
                { value: "CBSE", label: "CBSE" },
                { value: "ICSE", label: "ICSE" },
                { value: "State Board", label: "State Board" },
                { value: "Other", label: "Other" },
              ]}
              required
              disabled={!isEditing}
            />
            <InputField
              label="Year of Passing"
              type="number"
              value={formData.twelfth_year}
              onChange={onInputChange}
              field="twelfth_year"
              placeholder="2021"
              required
              disabled={!isEditing}
            />
            <SelectField
              label="Stream"
              value={formData.twelfth_stream}
              onChange={onInputChange}
              field="twelfth_stream"
              options={[
                { value: "Science", label: "Science" },
                { value: "Commerce", label: "Commerce" },
                { value: "Arts", label: "Arts" },
                { value: "Other", label: "Other" },
              ]}
              required
              disabled={!isEditing}
            />
            <InputField
              label="Percentage/CGPA"
              value={formData.twelfth_score}
              onChange={onInputChange}
              field="twelfth_score"
              placeholder="88% or 9.2 CGPA"
              required
              disabled={!isEditing}
            />
          </div>
        );

      case "ug":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Degree"
              value={formData.ug_degree}
              onChange={onInputChange}
              field="ug_degree"
              placeholder="B.Tech, B.Sc, B.Com, etc."
              required
              disabled={!isEditing}
            />
            <InputField
              label="University/College"
              value={formData.ug_university}
              onChange={onInputChange}
              field="ug_university"
              placeholder="Name of institution"
              required
              disabled={!isEditing}
            />
            <InputField
              label="Field of Study"
              value={formData.ug_field}
              onChange={onInputChange}
              field="ug_field"
              placeholder="Computer Science, Mechanical, etc."
              disabled={!isEditing}
            />
            <InputField
              label="Year of Graduation"
              type="number"
              value={formData.ug_year}
              onChange={onInputChange}
              field="ug_year"
              placeholder="2024"
              required
              disabled={!isEditing}
            />
            <InputField
              label="CGPA/Percentage"
              value={formData.ug_score}
              onChange={onInputChange}
              field="ug_score"
              placeholder="8.5 CGPA or 85%"
              required
              disabled={!isEditing}
            />
          </div>
        );

      case "pg":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Degree"
              value={formData.pg_degree}
              onChange={onInputChange}
              field="pg_degree"
              placeholder="M.Tech, M.Sc, MBA, etc."
              required
              disabled={!isEditing}
            />
            <InputField
              label="University"
              value={formData.pg_university}
              onChange={onInputChange}
              field="pg_university"
              placeholder="Name of institution"
              required
              disabled={!isEditing}
            />
            <InputField
              label="Field of Study"
              value={formData.pg_field}
              onChange={onInputChange}
              field="pg_field"
              placeholder="Specialization"
              disabled={!isEditing}
            />
            <InputField
              label="Year of Graduation"
              type="number"
              value={formData.pg_year}
              onChange={onInputChange}
              field="pg_year"
              placeholder="2024"
              required
              disabled={!isEditing}
            />
            <InputField
              label="CGPA/Percentage"
              value={formData.pg_score}
              onChange={onInputChange}
              field="pg_score"
              placeholder="8.5 CGPA or 85%"
              disabled={!isEditing}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Section
      id={id}
      title={title}
      icon={GraduationCap}
      visible={visible}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      {renderFields()}
    </Section>
  );
};

export default AcademicSection;