import React from 'react';
import { CharacterType } from '../types';

type Mood = 'Idle' | 'Success' | 'Failure' | 'Thinking' | 'Help';

interface CharacterProps {
  mood: Mood;
}

// ==================================
// Accessory Components
// ==================================
const SuccessSparkles: React.FC = () => (
  <g fill="#facc15" opacity="0">
    <animate attributeName="opacity" values="0; 1; 0" dur="0.8s" repeatCount="indefinite" />
    <circle cx="40" cy="50" r="6" />
    <path d="M160 40 l 5 10 l -10 -5 l 5 -10 z" />
    <circle cx="150" cy="90" r="4" />
    <path d="M50 150 l 5 10 l -10 -5 l 5 -10 z" />
  </g>
);

const ThinkingBubbles: React.FC = () => (
  <g opacity="0">
    <animate attributeName="opacity" values="0; 1; 0; 0" dur="4s" repeatCount="indefinite" />
    <circle cx="145" cy="45" r="8" fill="#475569" stroke="#64748b" strokeWidth="2" />
    <circle cx="160" cy="25" r="5" fill="#475569" stroke="#64748b" strokeWidth="2" />
  </g>
);

const HelpLightbulb: React.FC = () => (
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur="1.5s" repeatCount="indefinite" />
    <path d="M145 70 C 145 65, 155 65, 155 70 L 145 70 Z M 140 50 C 140 35, 160 35, 160 50 C 160 60, 145 65, 145 70" fill="#facc15"/>
    <rect x="145" y="70" width="10" height="5" rx="2" fill="#64748b" />
  </g>
);

const SadTears: React.FC<{ y1: number, y2: number }> = ({ y1, y2 }) => (
    <g stroke="#3b82f6" strokeWidth="3" fill="#3b82f6" opacity="0">
        <animate attributeName="opacity" values="0; 1; 1; 0" dur="3s" repeatCount="indefinite" />
        <path d={`M90 ${y1} q -5 10 0 20`}>
            <animate attributeName="d" values={`M90 ${y1} q -5 10 0 20; M90 ${y2} q -5 10 0 20; M90 ${y2} q -5 10 0 20`} dur="3s" repeatCount="indefinite" />
        </path>
        <path d={`M110 ${y1} q 5 10 0 20`}>
            <animate attributeName="d" values={`M110 ${y1} q 5 10 0 20; M110 ${y2} q 5 10 0 20; M110 ${y2} q 5 10 0 20`} dur="3s" repeatCount="indefinite" />
        </path>
    </g>
);


// ==================================
// Character Implementations
// ==================================

const BearCharacter: React.FC<CharacterProps> = ({ mood }) => (
  <g>
    {/* Base */}
    <path d="M60 120 C 60 100, 140 100, 140 120 L 140 170 C 140 180, 130 190, 120 190 H 80 C 70 190, 60 180, 60 170 Z" fill="#854d0e" />
    <path d="M80 120 C 80 110, 120 110, 120 120 V 170 C 120 175, 115 180, 110 180 H 90 C 85 180, 80 175, 80 170 Z" fill="#a16207" />
    <path d="M65 50 H 135 C 150 50, 155 70, 145 85 C 140 100, 120 125, 100 125 C 80 125, 60 100, 55 85 C 45 70, 50 50, 65 50 Z" fill="#854d0e" />
    <circle cx="70" cy="50" r="18" fill="#543109"/>
    <circle cx="130" cy="50" r="18" fill="#543109"/>
    <path d="M85 95 C 80 110, 120 110, 115 95 C 110 90, 90 90, 85 95 Z" fill="#a16207" />
    <circle cx="100" cy="95" r="4" fill="#543109" />
    
    {/* Limbs */}
    <rect x="55" y="110" width="20" height="60" rx="10" fill="#543109" transform="rotate(20 70 120)">
        { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="20 70 120; -60 70 120; 20 70 120" dur="0.8s" repeatCount="indefinite" /> }
    </rect>
    <rect x="125" y="110" width="20" height="60" rx="10" fill="#543109" transform="rotate(-20 130 120)">
        { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="-20 130 120; 60 130 120; -20 130 120" dur="0.8s" repeatCount="indefinite" /> }
        { mood === 'Thinking' && <animateMotion path="M0 0 L-10 -50 L 0 0" dur="4s" repeatCount="indefinite" /> }
    </rect>
    <rect x="80" y="185" width="15" height="25" rx="8" fill="#543109" />
    <rect x="105" y="185" width="15" height="25" rx="8" fill="#543109" />

    {/* Face */}
    { mood === 'Success' && <path d="M85 85 Q 90 75 95 85 M105 85 Q 110 75 115 85" stroke="#1e293b" fill="none" strokeWidth="4" strokeLinecap="round" /> }
    { mood === 'Failure' && <path d="M85 85 Q 90 95 95 85 M105 85 Q 110 95 115 85" stroke="#1e293b" fill="none" strokeWidth="4" strokeLinecap="round" /> }
    { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <g fill="#1e293b"><circle cx="90" cy="82" r="4" /><circle cx="110" cy="82" r="4" /></g> }

    { mood === 'Success' && <path d="M90 105 Q 100 115 110 105" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
    { mood === 'Failure' && <path d="M90 110 Q 100 100 110 110" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
    { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <path d="M95 105 Q 100 110 105 105" stroke="#1e293b" fill="none" strokeWidth="2" strokeLinecap="round" /> }
    { mood === 'Failure' && <SadTears y1={85} y2={95} /> }
  </g>
);

const CatCharacter: React.FC<CharacterProps> = ({ mood }) => (
    <g>
        {/* Base */}
        <path d="M60 120 C 60 100, 140 100, 140 120 L 140 180 C 140 185, 135 190, 130 190 H 70 C 65 190, 60 185, 60 180 Z" fill="#94a3b8" />
        <path d="M65 50 H 135 C 145 50, 150 65, 140 75 L 120 110 C 110 125, 90 125, 80 110 L 60 75 C 50 65, 55 50, 65 50 Z" fill="#94a3b8" />
        <path d="M65 55 L 65 30 L 90 50 Z" fill="#475569" />
        <path d="M135 55 L 135 30 L 110 50 Z" fill="#475569" />
        <path d="M85 90 C 80 105, 120 105, 115 90 C 110 85, 90 85, 85 90 Z" fill="white" />
        <path d="M98 92 L 90 95 M102 92 L 110 95 M98 92 L 90 90 M102 92 L 110 90" stroke="#475569" strokeWidth="1" />
        <path d="M100 90 L 100 95" stroke="#e11d48" fill="none" strokeWidth="1" />

        {/* Limbs */}
        <rect x="55" y="120" width="15" height="50" rx="8" fill="#475569" transform="rotate(10 60 130)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="10 60 130; -40 60 130; 10 60 130" dur="0.8s" repeatCount="indefinite" /> }
        </rect>
        <rect x="130" y="120" width="15" height="50" rx="8" fill="#475569" transform="rotate(-10 140 130)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="-10 140 130; 40 140 130; -10 140 130" dur="0.8s" repeatCount="indefinite" /> }
            { mood === 'Thinking' && <animateMotion path="M0 0 L-10 -40 L 0 0" dur="4s" repeatCount="indefinite" /> }
        </rect>
        <rect x="80" y="185" width="15" height="20" rx="8" fill="#475569" />
        <rect x="105" y="185" width="15" height="20" rx="8" fill="#475569" />
        <path d="M130 160 Q 150 140 160 170" stroke="#475569" strokeWidth="8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 130 160; 10 130 160; -5 130 160; 0 130 160" dur="5s" repeatCount="indefinite" />
        </path>


        {/* Face */}
        <g fill="#10b981" stroke="#1e293b" strokeWidth="3" strokeLinecap="round">
            { mood === 'Success' && <path d="M85 80 C 90 75, 95 75, 95 80 M105 80 C 110 75, 115 75, 115 80" /> }
            { mood === 'Failure' && <path d="M85 80 C 90 85, 95 85, 95 80 M105 80 C 110 85, 115 85, 115 80" /> }
            { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <g fill="#10b981" stroke="none"><ellipse cx="90" cy="80" rx="3" ry="5"/><ellipse cx="110" cy="80" rx="3" ry="5"/></g>}
        </g>
        
        { mood === 'Success' && <path d="M95 100 C 100 105, 105 105, 105 100" stroke="#e11d48" fill="none" strokeWidth="2" /> }
        { mood === 'Failure' && <path d="M95 102 Q 100 98 105 102" stroke="#e11d48" fill="none" strokeWidth="2" /> }
        { mood === 'Failure' && <SadTears y1={80} y2={90} /> }
    </g>
);

const MaleCharacter: React.FC<CharacterProps> = ({ mood }) => (
    <g>
        {/* Base */}
        <rect x="65" y="110" width="70" height="80" rx="15" fill="#4f46e5" />
        <rect x="65" y="50" width="70" height="70" rx="20" fill="#f59e0b" />
        <path d="M70 55 C 70 40, 130 40, 130 55" fill="#4a2c0d"/>
        
        {/* Limbs */}
        <rect x="50" y="110" width="20" height="60" rx="10" fill="#4f46e5" transform="rotate(20 65 120)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="20 65 120; -60 65 120; 20 65 120" dur="0.8s" repeatCount="indefinite" /> }
        </rect>
        <rect x="130" y="110" width="20" height="60" rx="10" fill="#4f46e5" transform="rotate(-20 135 120)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="-20 135 120; 60 135 120; -20 135 120" dur="0.8s" repeatCount="indefinite" /> }
            { mood === 'Thinking' && <animateMotion path="M0 0 L-15 -50 L 0 0" dur="4s" repeatCount="indefinite" /> }
        </rect>
        <rect x="80" y="185" width="15" height="25" rx="8" fill="#4a2c0d" />
        <rect x="105" y="185" width="15" height="25" rx="8" fill="#4a2c0d" />

        {/* Face */}
        <rect x="80" y="65" width="40" height="3" fill="#4a2c0d" />
        { mood === 'Success' && <path d="M85 85 Q 90 75 95 85 M105 85 Q 110 75 115 85" stroke="#1e293b" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M85 85 Q 90 95 95 85 M105 85 Q 110 95 115 85" stroke="#1e293b" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <g fill="#1e293b"><circle cx="90" cy="82" r="4" /><circle cx="110" cy="82" r="4" /></g> }

        { mood === 'Success' && <path d="M85 100 C 90 110, 110 110, 115 100" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M85 105 C 90 95, 110 95, 115 105" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <path d="M95 105 L 105 105" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { mood === 'Failure' && <SadTears y1={85} y2={95} /> }
    </g>
);

const FemaleCharacter: React.FC<CharacterProps> = ({ mood }) => (
    <g>
        {/* Base */}
        <path d="M70 110 L 130 110 L 115 190 L 85 190 Z" fill="#be185d" />
        <rect x="65" y="50" width="70" height="70" rx="20" fill="#fbcfe8" />
        <path d="M60 70 C 40 40, 80 30, 100 50 L 145 70 C 160 40, 120 30, 100 50 Z" fill="#701a75"/>
        
        {/* Limbs */}
        <rect x="50" y="110" width="20" height="60" rx="10" fill="#fbcfe8" transform="rotate(20 65 120)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="20 65 120; -60 65 120; 20 65 120" dur="0.8s" repeatCount="indefinite" /> }
        </rect>
        <rect x="130" y="110" width="20" height="60" rx="10" fill="#fbcfe8" transform="rotate(-20 135 120)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="-20 135 120; 60 135 120; -20 135 120" dur="0.8s" repeatCount="indefinite" /> }
            { mood === 'Thinking' && <animateMotion path="M0 0 L-15 -50 L 0 0" dur="4s" repeatCount="indefinite" /> }
        </rect>
        <rect x="80" y="185" width="15" height="25" rx="8" fill="#fbcfe8" />
        <rect x="105" y="185" width="15" height="25" rx="8" fill="#fbcfe8" />

        {/* Face */}
        <path d="M85 70 Q 90 65, 95 70 M105 70 Q 110 65, 115 70" stroke="#701a75" strokeWidth="2" fill="none" />
        { mood === 'Success' && <path d="M85 85 Q 90 75 95 85 M105 85 Q 110 75 115 85" stroke="#701a75" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M85 85 Q 90 95 95 85 M105 85 Q 110 95 115 85" stroke="#701a75" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <g fill="#701a75"><circle cx="90" cy="82" r="4" /><circle cx="110" cy="82" r="4" /></g> }
        
        { mood === 'Success' && <path d="M90 105 Q 100 115 110 105" stroke="#be185d" fill="#be185d" /> }
        { mood === 'Failure' && <path d="M90 105 Q 100 95 110 105" stroke="#701a75" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <path d="M95 105 Q 100 108 105 105" stroke="#be185d" fill="none" strokeWidth="2" strokeLinecap="round" /> }
        { mood === 'Failure' && <SadTears y1={85} y2={95} /> }
    </g>
);

const DogCharacter: React.FC<CharacterProps> = ({ mood }) => (
    <g>
        {/* Base */}
        <path d="M60 120 C 60 100, 140 100, 140 120 L 140 180 C 140 185, 135 190, 130 190 H 70 C 65 190, 60 185, 60 180 Z" fill="#f59e0b" />
        <path d="M65 50 H 135 C 150 50, 155 70, 145 85 C 140 100, 120 125, 100 125 C 80 125, 60 100, 55 85 C 45 70, 50 50, 65 50 Z" fill="#f59e0b" />
        <path d="M60 60 C 40 60, 40 90, 65 90 Z" fill="#92400e" />
        <path d="M140 60 C 160 60, 160 90, 135 90 Z" fill="#92400e" />
        <path d="M85 95 C 80 110, 120 110, 115 95 C 110 90, 90 90, 85 95 Z" fill="white" />
        <circle cx="100" cy="95" r="4" fill="#1e293b" />
        
        {/* Limbs & Tail */}
        <rect x="55" y="120" width="20" height="50" rx="10" fill="#92400e" transform="rotate(10 60 130)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="10 60 130; -40 60 130; 10 60 130" dur="0.8s" repeatCount="indefinite" /> }
        </rect>
        <rect x="125" y="120" width="20" height="50" rx="10" fill="#92400e" transform="rotate(-10 140 130)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="-10 140 130; 40 140 130; -10 140 130" dur="0.8s" repeatCount="indefinite" /> }
            { mood === 'Thinking' && <animateMotion path="M0 0 L-10 -40 L 0 0" dur="4s" repeatCount="indefinite" /> }
        </rect>
        <rect x="80" y="185" width="15" height="20" rx="8" fill="#92400e" />
        <rect x="105" y="185" width="15" height="20" rx="8" fill="#92400e" />
        <path d="M130 170 Q 150 160 150 180" stroke="#92400e" strokeWidth="10" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 130 170; 20 130 170; -10 130 170; 0 130 170" dur="0.5s" repeatCount="indefinite" />
        </path>

        {/* Face */}
        { mood === 'Success' && <path d="M85 85 Q 90 75 95 85 M105 85 Q 110 75 115 85" stroke="#1e293b" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M85 85 Q 90 95 95 85 M105 85 Q 110 95 115 85" stroke="#1e293b" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <g fill="#1e293b"><circle cx="90" cy="82" r="4" /><circle cx="110" cy="82" r="4" /></g> }
        
        { mood === 'Success' && <path d="M90 105 Q 100 115 110 105" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M90 110 Q 100 100 110 110" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <path d="M95 105 Q 100 110 105 105" stroke="#1e293b" fill="none" strokeWidth="2" strokeLinecap="round" /> }
        { mood === 'Success' && <path d="M110 105 Q 120 100 120 110" fill="#be185d" stroke="#1e293b" strokeWidth="2" /> }
        { mood === 'Failure' && <SadTears y1={85} y2={95} /> }
    </g>
);

const PandaCharacter: React.FC<CharacterProps> = ({ mood }) => (
    <g>
        {/* Base */}
        <path d="M60 120 C 60 100, 140 100, 140 120 L 140 170 C 140 180, 130 190, 120 190 H 80 C 70 190, 60 180, 60 170 Z" fill="white" />
        <path d="M65 50 H 135 C 150 50, 155 70, 145 85 C 140 100, 120 125, 100 125 C 80 125, 60 100, 55 85 C 45 70, 50 50, 65 50 Z" fill="white" />
        <circle cx="70" cy="50" r="18" fill="#1e293b"/>
        <circle cx="130" cy="50" r="18" fill="#1e293b"/>
        <ellipse cx="85" cy="80" rx="12" ry="15" fill="#1e293b" transform="rotate(-20 85 80)"/>
        <ellipse cx="115" cy="80" rx="12" ry="15" fill="#1e293b" transform="rotate(20 115 80)"/>
        <circle cx="100" cy="100" r="4" fill="#1e293b" />
        
        {/* Limbs */}
        <rect x="55" y="110" width="20" height="60" rx="10" fill="#1e293b" transform="rotate(20 70 120)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="20 70 120; -60 70 120; 20 70 120" dur="0.8s" repeatCount="indefinite" /> }
        </rect>
        <rect x="125" y="110" width="20" height="60" rx="10" fill="#1e293b" transform="rotate(-20 130 120)">
            { mood === 'Success' && <animateTransform attributeName="transform" type="rotate" values="-20 130 120; 60 130 120; -20 130 120" dur="0.8s" repeatCount="indefinite" /> }
            { mood === 'Thinking' && <animateMotion path="M0 0 L-10 -50 L 0 0" dur="4s" repeatCount="indefinite" /> }
        </rect>
        <rect x="80" y="185" width="15" height="25" rx="8" fill="#1e293b" />
        <rect x="105" y="185" width="15" height="25" rx="8" fill="#1e293b" />

        {/* Face */}
        { mood === 'Success' && <path d="M85 85 Q 90 75 95 85 M105 85 Q 110 75 115 85" stroke="white" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M85 85 Q 90 95 95 85 M105 85 Q 110 95 115 85" stroke="white" fill="none" strokeWidth="4" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <g fill="white"><circle cx="90" cy="82" r="3" /><circle cx="110" cy="82" r="3" /></g> }

        { mood === 'Success' && <path d="M90 105 Q 100 115 110 105" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { mood === 'Failure' && <path d="M90 110 Q 100 100 110 110" stroke="#1e293b" fill="none" strokeWidth="3" strokeLinecap="round" /> }
        { (mood === 'Idle' || mood === 'Thinking' || mood === 'Help') && <path d="M95 105 Q 100 110 105 105" stroke="#1e293b" fill="none" strokeWidth="2" strokeLinecap="round" /> }
        { mood === 'Failure' && <SadTears y1={85} y2={95} /> }
    </g>
);


// ==================================
// Main Component
// ==================================
interface CharacterIllustrationProps {
  className?: string;
  character: CharacterType;
  mood: Mood;
}

const characterMap: Record<CharacterType, React.FC<CharacterProps>> = {
  [CharacterType.MALE]: MaleCharacter,
  [CharacterType.FEMALE]: FemaleCharacter,
  [CharacterType.CAT]: CatCharacter,
  [CharacterType.DOG]: DogCharacter,
  [CharacterType.BEAR]: BearCharacter,
  [CharacterType.PANDA]: PandaCharacter,
};

export const CharacterIllustration: React.FC<CharacterIllustrationProps> = ({ className = 'w-48 h-48', character, mood }) => {
  const CharacterComponent = characterMap[character] || MaleCharacter;

  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Whole Body Animations */}
        { mood === 'Idle' && <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur="3s" repeatCount="indefinite" /> }
        { mood === 'Success' && <animateTransform attributeName="transform" type="translate" values="0 0; 0 -15; 0 0" dur="0.8s" repeatCount="indefinite" /> }
        { mood === 'Failure' && <animateTransform attributeName="transform" type="translate" values="0 0; 0 5; 0 0" dur="3s" repeatCount="indefinite" /> }
        { mood === 'Thinking' && <animateTransform attributeName="transform" type="translate" values="0 0; -2 0; 2 0; 0 0" dur="4s" repeatCount="indefinite" /> }

        <g>
          { mood === 'Failure' && <animateTransform attributeName="transform" type="rotate" values="0 100 120; 8 100 120; 0 100 120" dur="3s" repeatCount="indefinite" /> }
          <CharacterComponent mood={mood} />
        </g>
      </g>

      {/* Accessories based on mood */}
      {mood === 'Success' && <SuccessSparkles />}
      {mood === 'Thinking' && <ThinkingBubbles />}
      {mood === 'Help' && <HelpLightbulb />}
    </svg>
  );
};
