import React, { useState, useRef } from 'react';
import { User, Mail, FileText, Save, Upload, AlertCircle, Smile } from 'lucide-react';
import { UserProfile, CharacterType } from '../types';
import { CharacterIllustration } from '../components/Illustrations';

interface ProfileProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const Profile: React.FC<ProfileProps> = ({ profile, setProfile }) => {
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(profile.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    alert("Profile saved! The AI now knows who you are and what you look like.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setProfile(prev => ({
          ...prev,
          documentName: file.name,
          documentContent: content
        }));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>
      
      <div className="bg-card border border-gray-800 rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => {
                    setProfile({ ...profile, email: e.target.value });
                    if (error) setError('');
                }}
                className={`w-full bg-dark border rounded-xl px-4 py-3 text-white focus:ring-2 outline-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-primary'}`}
              />
              {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}
            </div>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Smile className="w-4 h-4" /> Choose Your Character
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-4 bg-dark rounded-xl border border-gray-700">
                {Object.values(CharacterType).map((char) => (
                    <button
                        type="button"
                        key={char}
                        onClick={() => setProfile({ ...profile, character: char })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${profile.character === char ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-gray-700'}`}
                    >
                        <CharacterIllustration character={char} mood="Idle" className="w-16 h-16" />
                        <span className={`mt-2 text-xs font-medium ${profile.character === char ? 'text-white' : 'text-gray-400'}`}>{char}</span>
                    </button>
                ))}
            </div>
           </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Bio / Summary
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-primary outline-none leading-relaxed mb-4"
              placeholder="E.g., I am a software engineer looking for backend roles..."
            />
            
            <div className="bg-dark border border-gray-700 border-dashed rounded-xl p-6 text-center">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept=".txt,.md,.csv,.json"
                 onChange={handleFileUpload}
               />
               <div className="flex flex-col items-center justify-center gap-2">
                  {profile.documentName ? (
                      <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg">
                          <FileText className="w-5 h-5" />
                          <span className="font-medium">{profile.documentName}</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setProfile(p => ({ ...p, documentName: undefined, documentContent: undefined }));
                                if(fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="ml-2 hover:text-white"
                          >
                              ×
                          </button>
                      </div>
                  ) : (
                    <>
                        <div className="p-3 bg-gray-800 rounded-full">
                            <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-sm text-gray-400">
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-primary font-bold hover:underline"
                            >
                                Upload a document
                            </button> 
                            <span className="ml-1">to provide context</span>
                        </div>
                        <p className="text-xs text-gray-600">Supports .txt, .md (Text files)</p>
                    </>
                  )}
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
