/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CarbonProvider, useCarbon } from './context/CarbonContext';
import { LoginScreen } from './components/screens/LoginScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ActivityDataScreen } from './components/screens/ActivityDataScreen';
import { ResultsFormulaScreen } from './components/screens/ResultsFormulaScreen';
import { DataQualityScreen } from './components/screens/DataQualityScreen';
import { CreditsRegistryScreen } from './components/screens/CreditsRegistryScreen';
import { ReportScreen } from './components/screens/ReportScreen';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { FormulaInspectorModal } from './components/common/FormulaInspectorModal';
import { AuditLogDrawer } from './components/common/AuditLogDrawer';

const MainAppContent: React.FC = () => {
  const { currentUser, activeScreen } = useCarbon();

  // If no simulated session, display the Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F7F8] text-[#1F2937]">
      {/* Top Header */}
      <Header />

      {/* Main Workspace: Left Sidebar + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeScreen === 'activity' && <ActivityDataScreen />}
          {activeScreen === 'results' && <ResultsFormulaScreen />}
          {activeScreen === 'quality' && <DataQualityScreen />}
          {activeScreen === 'credits' && <CreditsRegistryScreen />}
          {activeScreen === 'report' && <ReportScreen />}
        </main>
      </div>

      {/* Global Bottom Simulation Notice */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-6 text-center text-xs text-slate-500 no-print shrink-0">
        Nguyên mẫu mô phỏng dữ liệu minh họa. Không dùng cho báo cáo chính thức hoặc tuyên bố Trung hòa carbon / Net Zero.
      </footer>

      {/* Modals & Slide-overs */}
      <DocumentViewerModal />
      <FormulaInspectorModal />
      <AuditLogDrawer />
    </div>
  );
};

export default function App() {
  return (
    <CarbonProvider>
      <MainAppContent />
    </CarbonProvider>
  );
}
