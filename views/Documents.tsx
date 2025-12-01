import React, { useState } from 'react';
import { FileSpreadsheet, Download, Plus, Loader2, FileText } from 'lucide-react';
import { GeneratedDocument, Task, UserProfile, CharacterType } from '../types';
import { generateSpreadsheet } from '../services/geminiService';
import { CharacterIllustration } from '../components/Illustrations';

interface DocumentsProps {
  documents: GeneratedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<GeneratedDocument[]>>;
  tasks: Task[];
  userProfile: UserProfile;
}

export const Documents: React.FC<DocumentsProps> = ({ documents, setDocuments, tasks, userProfile }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSpreadsheet(tasks, userProfile);
      const newDoc: GeneratedDocument = {
        id: `doc-${Date.now()}`,
        title: result.title,
        type: 'csv',
        date: new Date().toLocaleDateString(),
        content: result.content
      };
      setDocuments([newDoc, ...documents]);
    } catch (e) {
      console.error("Failed to generate report", e);
      alert("Sorry, I couldn't generate the report right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (doc: GeneratedDocument) => {
    const blob = new Blob([doc.content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', doc.title);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-400">Your generated reports and spreadsheets.</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-900/25 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {isGenerating ? 'Analyzing Data...' : 'Create Report'}
        </button>
      </header>

      {documents.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center bg-card/50 rounded-2xl border border-gray-800">
          <CharacterIllustration character={userProfile.character} mood="Thinking" className="w-48 h-48 mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">No documents yet</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            I can organize your tasks into a neat spreadsheet for you. Just hit "Create Report" and I'll handle the rest.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="text-primary font-bold hover:underline"
          >
            Generate my first report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div 
                key={doc.id} 
                className="bg-card border border-gray-800 rounded-2xl p-6 group hover:border-green-500/50 transition-all hover:shadow-xl hover:shadow-green-900/10 flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                 <div className="p-3 bg-green-900/20 rounded-xl text-green-500 group-hover:text-green-400 group-hover:scale-110 transition-all">
                    <FileSpreadsheet className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md">{doc.type.toUpperCase()}</span>
              </div>
              
              <div className="mb-6 flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={doc.title}>{doc.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                      Created: {doc.date}
                  </p>
              </div>

              <button 
                onClick={() => handleDownload(doc)}
                className="w-full py-3 bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group-hover:bg-green-600 group-hover:text-white"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};