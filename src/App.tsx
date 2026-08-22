/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/common/Sidebar';
import { PrintScheduleModal } from './components/common/PrintScheduleModal';
import { OperationsDashboard } from './components/operations/OperationsDashboard';
import { TimetableManager } from './components/operations/TimetableManager';
import { TeachingProgressManager } from './components/operations/TeachingProgressManager';
import { WorkloadAnalytics } from './components/operations/WorkloadAnalytics';
import { LabsWorkshopsManager } from './components/operations/LabsWorkshopsManager';
import { ExcelStudio } from './components/operations/ExcelStudio';
import { SystemManagement } from './components/operations/SystemManagement';
import { ActivityLogView } from './components/operations/ActivityLogView';
import { ReportsView } from './components/operations/ReportsView';
import { SettingsView } from './components/operations/SettingsView';
import { UsersAndAccessView } from './components/operations/UsersAndAccessView';
import { NotificationsView } from './components/operations/NotificationsView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherRecordLesson } from './components/teacher/TeacherRecordLesson';
import { ParentPortalView } from './components/parent/ParentPortalView';
import { Menu, Bell } from 'lucide-react';
import { NTSSEmblem } from './components/common/NTSSLogo';

const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated, smartAlerts } = useApp();

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [prefillRecordSlotId, setPrefillRecordSlotId] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const unresolvedAlertsCount = smartAlerts.filter((a) => !a.resolved).length;

  // Automatically adjust default active tab when switching user role
  useEffect(() => {
    if (currentUser.role === 'operations_manager') {
      setActiveTab('dashboard');
    } else if (currentUser.role === 'teacher') {
      setActiveTab('teacher_dashboard');
    } else if (currentUser.role === 'parent') {
      setActiveTab('parent_dashboard');
    }
  }, [currentUser.id, currentUser.role]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOpenRecordModal = (slotId?: string) => {
    setPrefillRecordSlotId(slotId);
    setActiveTab('teacher_record');
  };

  const renderActiveScreen = () => {
    // Operations Manager Screens
    if (currentUser.role === 'operations_manager') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <OperationsDashboard
              onSelectTab={setActiveTab}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          );
        case 'school_structure':
          return <SystemManagement initialTab="classes" />;
        case 'teachers':
          return <SystemManagement initialTab="teachers" />;
        case 'subjects':
          return <SystemManagement initialTab="subjects" />;
        case 'timetable':
          return (
            <TimetableManager
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          );
        case 'teaching_progress':
          return <TeachingProgressManager />;
        case 'workload_analytics':
        case 'analytics':
          return (
            <WorkloadAnalytics
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          );
        case 'labs_workshops':
          return <LabsWorkshopsManager />;
        case 'users_access':
          return <UsersAndAccessView />;
        case 'reports':
          return (
            <ReportsView
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          );
        case 'notifications':
          return <NotificationsView onSelectTab={setActiveTab} />;
        case 'excel_studio':
          return <ExcelStudio />;
        case 'system_management':
          return <SystemManagement initialTab="teachers" />;
        case 'activity_log':
          return <ActivityLogView />;
        case 'settings':
          return <SettingsView />;
        default:
          return (
            <OperationsDashboard
              onSelectTab={setActiveTab}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          );
      }
    }

    // Teacher Screens
    if (currentUser.role === 'teacher') {
      switch (activeTab) {
        case 'teacher_dashboard':
          return (
            <TeacherDashboard
              onSelectTab={setActiveTab}
              onOpenRecordModal={handleOpenRecordModal}
            />
          );
        case 'teacher_schedule':
          return (
            <TimetableManager
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          );
        case 'teacher_workload':
          return <WorkloadAnalytics onOpenPrintModal={() => setIsPrintModalOpen(true)} />;
        case 'teacher_record':
          return (
            <TeacherRecordLesson
              prefillSlotId={prefillRecordSlotId}
              onSuccess={() => setActiveTab('teacher_dashboard')}
            />
          );
        case 'teacher_materials':
          return <TeachingProgressManager />;
        case 'notifications':
          return <NotificationsView onSelectTab={setActiveTab} />;
        default:
          return (
            <TeacherDashboard
              onSelectTab={setActiveTab}
              onOpenRecordModal={handleOpenRecordModal}
            />
          );
      }
    }

    // Parent Screens
    if (currentUser.role === 'parent') {
      if (activeTab === 'notifications') {
        return <NotificationsView onSelectTab={setActiveTab} />;
      }
      let initialTab: 'taught' | 'schedule' | 'summary' | 'materials' = 'taught';
      if (activeTab === 'parent_schedule') initialTab = 'schedule';
      else if (activeTab === 'parent_summary') initialTab = 'summary';
      else if (activeTab === 'parent_materials') initialTab = 'materials';
      else if (activeTab === 'parent_taught' || activeTab === 'parent_dashboard') initialTab = 'taught';

      return (
        <ParentPortalView
          initialTab={initialTab}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans flex" dir="rtl">
      {/* Sidebar Navigation - Fixed & Permanent on Desktop, Drawer on Mobile */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport (Strictly NO TOP BAR) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Mobile Floating Drawer Trigger (Mobile Only, not a navbar) */}
        <div className="lg:hidden p-3 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              aria-label="القائمة الجانبية"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <NTSSEmblem className="w-6 h-6" color="#00908E" />
              <span className="text-xs font-black text-slate-900">EBDA EDU • بدر</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unresolvedAlertsCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-xs font-bold"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F35024] text-white text-[9px] font-black flex items-center justify-center">
                  {unresolvedAlertsCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Page Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* A4 Print Schedule & Workload Modal */}
      <PrintScheduleModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
