import React from 'react';
import { Home, BarChart2, Calendar, User, FileSpreadsheet } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'progress', icon: BarChart2, label: 'Progress' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'documents', icon: FileSpreadsheet, label: 'Documents' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-gray-800 h-screen sticky top-0">
      <Logo />
      
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : ''}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Procrastination Level</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
          <p className="text-right text-xs text-green-400 mt-1">Low (Keep it up!)</p>
        </div>
      </div>
    </div>
  );
};