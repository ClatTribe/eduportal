import React from 'react';
import { RESOURCE_TABS } from '../../constants';
import { ResourceTab } from '../../types';

interface Props {
  activeTab: ResourceTab;
  setActiveTab: (tab: ResourceTab) => void;
}

export const ResourceTabs: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const accentColor = '#A51C30';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  return (
    <div className="relative">
      {/* Hide scrollbar only on Desktop (min-width: 768px) */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .desktop-hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>

      <div 
        className="desktop-hide-scrollbar flex items-center gap-2 overflow-x-auto pb-4 -mx-2 px-2 sticky -top-8 z-20 pt-4" 
        style={{ 
          backgroundColor: 'rgba(249, 250, 251, 0.8)', 
          backdropFilter: 'blur(12px)',
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        {/* FIX: Added index to the map function */}
        {RESOURCE_TABS.map((tab, index) => (
          <button
            // FIX: Using a combination of id and index ensures the key is always unique
            key={tab.id ? `${tab.id}-${index}` : index}
            onClick={() => setActiveTab(tab.id as ResourceTab)}
            className="relative group flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300"
            style={{
              backgroundColor: activeTab === tab.id ? 'white' : lightBg,
              border: activeTab === tab.id ? `1px solid ${accentColor}` : `1px solid ${borderColor}`,
              color: activeTab === tab.id ? '#1f2937' : '#6b7280'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            <span 
              className="transition-colors"
              style={{ 
                color: activeTab === tab.id ? accentColor : '#9ca3af'
              }}
            >
              {tab.icon}
            </span>
            <span className="text-sm font-semibold">{tab.label}</span>
            
            {tab.isNew && (
              <div className="absolute -top-2 -right-2 flex items-center">
                <div 
                  className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                  style={{ 
                    backgroundColor: accentColor,
                    boxShadow: `0 0 10px ${accentColor}80`
                  }}
                >
                  <span className="leading-none">NEW</span>
                  <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
            )}
            
            {activeTab === tab.id && (
              <div 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-[2px] rounded-full"
                style={{ backgroundColor: accentColor }}
              ></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};