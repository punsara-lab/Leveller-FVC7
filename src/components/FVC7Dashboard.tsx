import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './dashboard/DashboardSidebar';
import HeroHeader from './dashboard/HeroHeader';
import DailyScorePanel from './dashboard/DailyScorePanel';
import TaskManager, { Task } from './dashboard/TaskManager';
import TrainingModule from './dashboard/TrainingModule';
import StudyTracker from './dashboard/StudyTracker';
import WeeklyReview from './dashboard/WeeklyReview';
import DailyPlanPanel from './dashboard/DailyPlanPanel';
import AnalyticsPanel from './dashboard/AnalyticsPanel';
import ProgressReportPanel from './dashboard/ProgressReportPanel';
import BuildPlanPanel from './dashboard/BuildPlanPanel';
import WastedTimePanel from './dashboard/WastedTimePanel';
import LocalAIPanel from './dashboard/LocalAIPanel';
import SyncPanel from './dashboard/SyncPanel';
import SettingsPanel from './dashboard/SettingsPanel';
import ArcWorkspace from './arc/ArcWorkspace';

import LevelUpNotification from './LevelUpNotification';
import { cn } from '@/lib/utils';

const FVC7Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // State for all dashboard data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trainingData, setTrainingData] = useState({
    pushUps: 0,
    sitUps: 0,
    pullUps: 0,
    squats: 0,
    runKm: 0,
    martialArts: false,
  });
  const [studyHours, setStudyHours] = useState(0);
  const [meditationMinutes, setMeditationMinutes] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('rx1_tasks');
    const savedTraining = localStorage.getItem('rx1_training_v2');
    const savedMeditation = localStorage.getItem('rx1_meditation');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedTraining) setTrainingData(JSON.parse(savedTraining));
    if (savedMeditation) setMeditationMinutes(parseInt(savedMeditation));
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('rx1_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save training data to localStorage
  useEffect(() => {
    localStorage.setItem('rx1_training_v2', JSON.stringify(trainingData));
  }, [trainingData]);

  // Update streak logic
  useEffect(() => {
    const lastVisit = localStorage.getItem('rx1_last_visit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
      const savedStreak = parseInt(localStorage.getItem('rx1_streak') || '0');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastVisit === yesterday.toDateString()) {
        localStorage.setItem('rx1_streak', String(savedStreak + 1));
      } else if (lastVisit !== today) {
        localStorage.setItem('rx1_streak', '1');
      }
      
      localStorage.setItem('rx1_last_visit', today);
    }
  }, []);

  const handleStudyHoursChange = useCallback((hours: number) => {
    setStudyHours(hours);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'arc':
        return <ArcWorkspace />;
      case 'build':
        return (
          <div className="space-y-6">
            <BuildPlanPanel />
          </div>
        );
      case 'cost':
        return <WastedTimePanel />;
      case 'core':
        return <LocalAIPanel />;
      case 'sync':
        return <SyncPanel />;
      case 'settings':
        return <SettingsPanel />;

      case 'tasks':
        return (
          <div className="space-y-6">
            <HeroHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskManager tasks={tasks} onTasksChange={setTasks} />
              <DailyPlanPanel />
            </div>
          </div>
        );
      case 'training':
        return (
          <div className="space-y-6">
            <HeroHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrainingModule data={trainingData} onDataChange={setTrainingData} />
              <ProgressReportPanel 
                studyHours={studyHours} 
                trainingData={trainingData}
                meditationMinutes={meditationMinutes}
              />
            </div>
          </div>
        );
      case 'study':
        return (
          <div className="space-y-6">
            <HeroHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudyTracker onHoursChange={handleStudyHoursChange} />
              <AnalyticsPanel studyHours={studyHours} trainingData={trainingData} />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <HeroHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsPanel studyHours={studyHours} trainingData={trainingData} />
              <WeeklyReview 
                tasks={tasks} 
                trainingData={trainingData} 
                studyHours={studyHours} 
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Hero Header */}
            <HeroHeader />
            
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Score & Tasks */}
              <div className="space-y-6">
                <DailyScorePanel 
                  tasks={tasks} 
                  trainingData={trainingData} 
                  studyHours={studyHours} 
                />
                <TaskManager tasks={tasks} onTasksChange={setTasks} />
              </div>
              
              {/* Middle Column - Training & Study */}
              <div className="space-y-6">
                <TrainingModule data={trainingData} onDataChange={setTrainingData} />
                <StudyTracker onHoursChange={handleStudyHoursChange} />
              </div>
              
              {/* Right Column - Plan, Reports & Analytics */}
              <div className="space-y-6">
                <DailyPlanPanel />
                <ProgressReportPanel 
                  studyHours={studyHours} 
                  trainingData={trainingData}
                  meditationMinutes={meditationMinutes}
                />
                
                {/* Quick Actions */}
                <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-4 shadow-xl shadow-primary/5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/spiritual')}
                      className="w-full p-2 rounded-xl bg-muted/20 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center gap-2 group text-sm"
                    >
                      <span>🧘</span>
                      <span className="font-medium group-hover:text-primary transition-colors">Meditation</span>
                    </button>
                    <button
                      onClick={() => navigate('/physical')}
                      className="w-full p-2 rounded-xl bg-muted/20 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center gap-2 group text-sm"
                    >
                      <span>💪</span>
                      <span className="font-medium group-hover:text-primary transition-colors">Physical</span>
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="w-full p-2 rounded-xl bg-muted/20 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center gap-2 group text-sm"
                    >
                      <span>📊</span>
                      <span className="font-medium group-hover:text-primary transition-colors">Reports</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Level Up Notification */}
      <LevelUpNotification />
      
      {/* Sidebar */}
      <DashboardSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <main className="ml-16 lg:ml-64 transition-all duration-300 min-h-screen">
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FVC7Dashboard;
