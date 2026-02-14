"use client";
import React, { useState } from 'react';
// import ContactButton from '../components/ContactButton';
// import { TopNav } from '../components/TopNav';
// import { ResourceTabs } from '../../components/ResourceTabs';
import { ResourceTabs } from '../../../components/Ielts-kit/ResourceTabs';
import { ResourceContent } from '../../../components/Ielts-kit/ResourceContent';
import { ResourceTab } from '../../../types';
// import Navbar from '../components/navbar';
import { Navbar } from '../../../components/Navbar';
import ContactButton from '../../../components/ContactButton';
// import NewFooter from '../components/newFooter';

const App: React.FC = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const [activeTab, setActiveTab] = useState<ResourceTab>(ResourceTab.IELTS);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar />
      {/* <ContactButton /> */}
      
      {/* Main Content Area */}
      <div className="flex flex-col relative">
        {/* Background Gradient Orbs */}
        <div 
          className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full -z-10"
          style={{ backgroundColor: `${accentColor}10` }}
        ></div>
        <div 
          className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] blur-[100px] rounded-full -z-10"
          style={{ backgroundColor: `${accentColor}05` }}
        ></div>

        <main className="px-4 sm:px-6 py-6 sm:py-8 md:px-12 lg:px-16 pt-20 sm:pt-24 md:pt-28">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 sm:mb-4 tracking-wider uppercase"
                style={{ 
                  backgroundColor: `${accentColor}10`,
                  border: `1px solid ${accentColor}33`,
                  color: accentColor
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span 
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: accentColor }}
                  ></span>
                  <span 
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: accentColor }}
                  ></span>
                </span>
                IELTS Free Learning Resources
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 text-gray-800">
                IELTS ONLINE <span style={{ color: accentColor }}> TEST KIT 2026
</span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                Empowering your IELTS journey with curated study materials, expert insights, and an under-10-minute IELTS Band Predictor. Join the club now.
              </p>
            </div>

            {/* Sticky Tabs Navigation */}
            <ResourceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Dynamic Content Rendering */}
            <div className="mt-6 sm:mt-8">
              <ResourceContent activeTab={activeTab} />
            </div>
            <ContactButton />
          </div>
        </main>
      </div>
      
      {/* <NewFooter /> */}
    </div>
  );
};

export default App;