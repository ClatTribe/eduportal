import React from "react";
import { User } from "lucide-react";

const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    contact_preferences: string[];
  };
  isEditing: boolean;
  isExpanded: boolean;
  isComplete: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: string, value: string) => void;
  onMultiSelectContactPreference: (value: string) => void;
  Section: any;
  InputField: any;
}

const CONTACT_OPTIONS = [
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Email", label: "Email" },
  { value: "Calling", label: "Phone Call" },
  { value: "Do not disturb", label: "Do not disturb" },
];

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  isEditing,
  isExpanded,
  isComplete,
  onToggle,
  onInputChange,
  onMultiSelectContactPreference,
  Section,
  InputField,
}) => {
  return (
    <Section
      id="personal"
      title="Personal Information"
      icon={User}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          value={formData.name}
          onChange={onInputChange}
          field="name"
          placeholder="Enter your full name"
          required
          disabled={!isEditing}
        />
        <InputField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={onInputChange}
          field="email"
          placeholder="your.email@example.com"
          required
          disabled={!isEditing}
        />
        <InputField
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={onInputChange}
          field="phone"
          placeholder="+91 XXXXX XXXXX"
          required
          disabled={!isEditing}
        />
        <InputField
          label="City"
          value={formData.city}
          onChange={onInputChange}
          field="city"
          placeholder="Your city"
          required
          disabled={!isEditing}
        />
        <InputField
          label="State"
          value={formData.state}
          onChange={onInputChange}
          field="state"
          placeholder="Your state"
          disabled={!isEditing}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How would you like us to contact you?<span style={{ color: accentColor }}>*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CONTACT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => isEditing && onMultiSelectContactPreference(option.value)}
              disabled={!isEditing}
              className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base font-medium ${
                !isEditing ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={
                formData.contact_preferences?.includes(option.value)
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
                if (isEditing && !formData.contact_preferences?.includes(option.value)) {
                  e.currentTarget.style.borderColor = accentColor;
                }
              }}
              onMouseLeave={(e) => {
                if (isEditing && !formData.contact_preferences?.includes(option.value)) {
                  e.currentTarget.style.borderColor = borderColor;
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PersonalInfoSection;