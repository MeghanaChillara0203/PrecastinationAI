import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './views/Home';
import { Progress } from './views/Progress';
import { Profile } from './views/Profile';
import { Calendar } from './views/Calendar';
import { Documents } from './views/Documents';
import { Task, UserProfile, CharacterType, GeneratedDocument } from './types';
import { MOCK_INITIAL_TASKS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState<Task[]>(MOCK_INITIAL_TASKS);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex',
    email: 'alex@example.com',
    bio: 'I am a frontend developer learning AI integration and trying to network with tech leads in San Francisco.',
    character: CharacterType.MALE,
  });
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home tasks={tasks} setTasks={setTasks} userProfile={profile} setActiveTab={setActiveTab} />;
      case 'progress':
        return <Progress tasks={tasks} setTasks={setTasks} userProfile={profile} />;
      case 'calendar':
        return <Calendar tasks={tasks} setActiveTab={setActiveTab} />;
      case 'documents':
        return <Documents documents={documents} setDocuments={setDocuments} tasks={tasks} userProfile={profile} />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} />;
      default:
        return <Home tasks={tasks} setTasks={setTasks} userProfile={profile} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark text-gray-100 font-sans selection:bg-primary selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto h-screen relative">
        {/* Background ambient glow */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;