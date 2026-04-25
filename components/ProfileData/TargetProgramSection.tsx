import React, { useState, useMemo, useRef, useEffect } from "react";
import { Target, X, Search } from "lucide-react";

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

const QUICK_COUNTRIES = ['United States of America', 'United Kingdom', 'Italy', 'Australia', 'Germany', 'Europe (Other)'];

const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Brazil', 'Brunei', 'Bulgaria', 'Cambodia', 'Cameroon',
  'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia', 'Europe (Other)',
  'Fiji', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Hong Kong',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan',
  'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Macau', 'Malaysia', 'Maldives',
  'Malta', 'Mauritius', 'Mexico', 'Mongolia', 'Morocco', 'Myanmar', 'Nepal',
  'Netherlands', 'New Zealand', 'Nigeria', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia',
  'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden',
  'Switzerland', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States of America', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam',
  'Zambia', 'Zimbabwe'
];

// UPDATED: Added all study level options to match filter and database
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
  const [countrySearch, setCountrySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return [];
    const query = countrySearch.toLowerCase();
    return ALL_COUNTRIES.filter(
      (c) => c.toLowerCase().includes(query) && !formData.target_countries.includes(c)
    ).slice(0, 8);
  }, [countrySearch, formData.target_countries]);

  const handleCountryAdd = (country: string) => {
    if (!formData.target_countries.includes(country)) {
      onMultiSelect(country);
    }
    setCountrySearch("");
    setShowDropdown(false);
  };

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

        {/* Quick-select country buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {QUICK_COUNTRIES.map((country) => (
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

        {/* Search input for more countries */}
        {isEditing && (
          <div className="mt-3 relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => countrySearch.trim() && setShowDropdown(true)}
                placeholder="Search and add more countries..."
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 rounded-lg focus:outline-none text-gray-800 placeholder:text-gray-400"
                style={{ borderColor: borderColor }}
                onFocusCapture={(e) => (e.target.style.borderColor = accentColor)}
                onBlurCapture={(e) => (e.target.style.borderColor = borderColor)}
              />
            </div>
            {showDropdown && filteredCountries.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                style={{ borderColor: borderColor }}>
                {filteredCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleCountryAdd(country)}
                    className="w-full text-left px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-white transition-colors"
                    style={{ }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = accentColor;
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected countries (extra ones beyond quick-select) */}
        {formData.target_countries.filter((c) => !QUICK_COUNTRIES.includes(c)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.target_countries
              .filter((c) => !QUICK_COUNTRIES.includes(c))
              .map((country) => (
                <span
                  key={country}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: '#FEF2F3',
                    color: accentColor,
                    border: `1.5px solid ${accentColor}`,
                  }}
                >
                  {country}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => onMultiSelect(country)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
          </div>
        )}
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
            { value: 'Under 10L', label: 'Under \u20B910 Lakhs' },
            { value: '10-20L', label: '\u20B910-20 Lakhs' },
            { value: '20-30L', label: '\u20B920-30 Lakhs' },
            { value: 'Above 30L', label: 'Above \u20B930 Lakhs' }
          ]}
          disabled={!isEditing}
        />
      </div>
    </Section>
  );
};

export default TargetProgramSection;
