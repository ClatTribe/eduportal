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

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep"
];

const STATE_CITIES: { [key: string]: string[] } = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand"],
  "Haryana": ["Faridabad", "Gurgaon", "Rohtak", "Hisar", "Panipat", "Karnal", "Sonipat", "Ambala", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Palampur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere", "Bellary", "Tumkur"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Palakkad", "Alappuzha"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
  "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur", "Ajmer", "Bhilwara", "Alwar", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Mahbubnagar", "Secunderabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Bareilly", "Aligarh", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Nainital", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur", "Bardhaman", "Malda"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Dwarka", "Rohini"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  "Ladakh": ["Leh", "Kargil"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Chandigarh": ["Chandigarh"],
  "Andaman and Nicobar Islands": ["Port Blair", "Car Nicobar"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"]
};

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
  const [showCityInput, setShowCityInput] = React.useState(false);

  const handleContactPreferenceClick = (value: string) => {
    if (!isEditing) return;
    
    const currentPreferences = formData.contact_preferences || [];
    
    if (value === "Do not disturb") {
      if (currentPreferences.includes("Do not disturb")) {
        onMultiSelectContactPreference(value);
      } else {
        currentPreferences.forEach(pref => {
          if (pref !== "Do not disturb") {
            onMultiSelectContactPreference(pref);
          }
        });
        onMultiSelectContactPreference(value);
      }
    } else {
      if (currentPreferences.includes("Do not disturb")) {
        onMultiSelectContactPreference("Do not disturb");
      }
      onMultiSelectContactPreference(value);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    onInputChange("state", newState);
    // Clear city when state changes
    onInputChange("city", "");
    // Reset to dropdown mode
    setShowCityInput(false);
  };

  const availableCities = formData.state ? STATE_CITIES[formData.state] || [] : [];

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
        
        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State<span style={{ color: accentColor }}>*</span>
          </label>
          <select
            value={formData.state}
            onChange={handleStateChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* City Dropdown/Input Combo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City<span style={{ color: accentColor }}>*</span>
          </label>
          {formData.state ? (
            <>
              {!showCityInput ? (
                <div className="relative">
                  <select
                    value={formData.city && availableCities.includes(formData.city) ? formData.city : ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue === "__custom__") {
                        setShowCityInput(true);
                        onInputChange("city", "");
                      } else {
                        onInputChange("city", selectedValue);
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="__custom__" style={{ fontStyle: "italic", color: "#6B7280" }}>
                       (Type your city)
                    </option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => onInputChange("city", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Type your city name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCityInput(false);
                      onInputChange("city", "");
                    }}
                    disabled={!isEditing}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↩ Back
                  </button>
                </div>
              )}
            </>
          ) : (
            <input
              type="text"
              value=""
              disabled
              placeholder="Please select state first"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          )}
        </div>
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
              onClick={() => handleContactPreferenceClick(option.value)}
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