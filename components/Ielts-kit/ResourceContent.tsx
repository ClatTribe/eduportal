
import React from 'react';
// import { ResourceTab } from './types';
import { ResourceTab } from '../../types';
import { IELTSSection } from '../sections/IELTSSection';
import { FailurePatternSection } from '../sections/FailurePatternSection';
// import { ToppersTalkSection } from './sections/ToppersTalkSection';
import { FreeMockSection } from '../sections/FreeMock';
// import ContactPage from '../sections/ContactUs';
import IELTSFlashcards from '../sections/Flashcards';
import SampleSectionsPage from '../sections/SampleTasks';
import { BandPredictorSection } from '../sections/BandPredcitor';
import ContactUs from '../sections/ContactUs';
import  MindJournalsSection  from '../sections/MindJournalsSection';
// import UnifiedCutoffsPage from './cut-offs/UnifiedCutoffsPage';


interface Props {
  activeTab: ResourceTab;
}

export const ResourceContent: React.FC<Props> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case ResourceTab.IELTS:
        return <IELTSSection />;
      case ResourceTab.FAILURE_PATTERNS:
        return <FailurePatternSection />;
      case ResourceTab.FREE_MOCK:
        return <FreeMockSection />;
      case ResourceTab.SAMPLE_TASKS:
        return <SampleSectionsPage />;
      case ResourceTab.FLASHCARDS:
        return <IELTSFlashcards />;
      case ResourceTab.MIND_JOURNALS:
        return <MindJournalsSection />;
      case ResourceTab.BAND_PREDICTOR:
        return<BandPredictorSection />
      case ResourceTab.CONTACT:
        return <ContactUs />;
      default:
        return <div className="text-white">Content for {activeTab} is coming soon!</div>;
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      {renderContent()}
    </div>
  );
};
