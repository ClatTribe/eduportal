import { Filter, Globe, GraduationCap, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  showFilters: boolean;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  countries: string[];
  degreeLevels: string[];
  accentColor: string;
  borderColor: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  showFilters,
  selectedCountry,
  setSelectedCountry,
  selectedLevel,
  setSelectedLevel,
  countries,
  degreeLevels,
  accentColor,
  borderColor,
}) => {
  if (!showFilters) return null;

  return (
    <div className="rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
        <Filter size={18} className="sm:w-5 sm:h-5" style={{ color: accentColor }} />
        Refine Your Search
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <Globe size={14} className="sm:w-4 sm:h-4" style={{ color: accentColor }} />
            Country
          </label>
          <div className="relative">
            <select
              className="appearance-none w-full rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-gray-900"
              style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-500" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <GraduationCap size={14} className="sm:w-4 sm:h-4" style={{ color: accentColor }} />
            Degree Level
          </label>
          <div className="relative">
            <select
              className="appearance-none w-full rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-gray-900"
              style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {degreeLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};