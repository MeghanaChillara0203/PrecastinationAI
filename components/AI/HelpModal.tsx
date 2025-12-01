import React from 'react';
import { X, ExternalLink, RefreshCw, Copy } from 'lucide-react';
import { HelpContent, TaskCategory, CharacterType } from '../../types';
import { CharacterIllustration } from '../Illustrations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: HelpContent | null;
  category: TaskCategory;
  loading: boolean;
  onGenerateMore: () => void;
  onFinishedLearning: () => void;
  character: CharacterType;
}

export const HelpModal: React.FC<HelpModalProps> = ({ 
  isOpen, onClose, content, category, loading, onGenerateMore, onFinishedLearning, character
}) => {
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center flex flex-col items-center">
          <CharacterIllustration character={character} mood="Thinking" className="w-40 h-40" />
          <h3 className="text-xl font-bold text-white mt-4">I'm helping you out...</h3>
          <p className="text-gray-400">Finding the best way for us to do this...</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-gray-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          <div className="flex items-center gap-4">
            <CharacterIllustration character={character} mood="Help" className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-bold text-white">Let's Do This</h2>
              <p className="text-xs text-gray-400">Wanna do it together? I've been waiting for you.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Summary Section */}
          <section className="bg-dark/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-primary mb-3">Here's the plan</h3>
            <p className="text-gray-300 leading-relaxed">{content.summary}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Points */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                Things to keep in mind
              </h3>
              <ul className="space-y-3">
                {content.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                    <span className="text-green-500 font-bold">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            {/* Action Items */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                Our Next Steps
              </h3>
               <ul className="space-y-3">
                {content.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Networking Draft (Conditional) */}
          {content.messageDraft && (
            <section className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 relative group">
               <h3 className="text-lg font-semibold text-white mb-3">I wrote this for you</h3>
               <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-gray-300 whitespace-pre-wrap">
                 {content.messageDraft}
               </div>
               <button 
                onClick={() => navigator.clipboard.writeText(content.messageDraft!)}
                className="absolute top-6 right-6 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                title="Copy to clipboard"
               >
                 <Copy className="w-4 h-4" />
               </button>
            </section>
          )}

          {/* Resources */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Helpful Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider rounded bg-gray-900 text-gray-400 mb-2">
                        {res.type}
                      </span>
                      <h4 className="font-medium text-white group-hover:text-primary transition-colors">{res.title}</h4>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50 flex justify-between items-center">
          <button 
            onClick={onGenerateMore}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try something else
          </button>
          <button 
            onClick={onFinishedLearning}
            className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all transform hover:scale-105"
          >
            I'm Ready to Verify
          </button>
        </div>
      </div>
    </div>
  );
};