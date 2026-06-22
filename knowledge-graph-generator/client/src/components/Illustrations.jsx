import React from 'react';

// Professional SVG illustrations for the app
// Inspired by undraw.co and storyset.com style

export const EmptyDocumentsIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Document Stack */}
    <rect x="40" y="60" width="80" height="100" rx="8" fill="var(--bg-tertiary)" stroke="var(--border-primary)" strokeWidth="2"/>
    <rect x="50" y="50" width="80" height="100" rx="8" fill="var(--bg-secondary)" stroke="var(--border-primary)" strokeWidth="2"/>
    <rect x="60" y="40" width="80" height="100" rx="8" fill="url(#grad1)" opacity="0.2" stroke="url(#grad1)" strokeWidth="2"/>
    
    {/* Lines on document */}
    <line x1="75" y1="60" x2="125" y2="60" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="75" y1="75" x2="120" y2="75" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="75" y1="90" x2="125" y2="90" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="75" y1="105" x2="115" y2="105" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Floating plus icon */}
    <circle cx="150" cy="130" r="20" fill="url(#grad1)"/>
    <line x1="150" y1="120" x2="150" y2="140" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <line x1="140" y1="130" x2="160" y2="130" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Sparkles */}
    <circle cx="30" cy="40" r="2" fill="var(--brand-primary)"/>
    <circle cx="160" cy="50" r="2" fill="var(--brand-accent)"/>
    <circle cx="170" cy="100" r="2" fill="var(--brand-secondary)"/>
  </svg>
);

export const KnowledgeGraphIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Connection lines */}
    <line x1="60" y1="60" x2="100" y2="100" stroke="var(--brand-primary)" strokeWidth="2" opacity="0.3"/>
    <line x1="140" y1="60" x2="100" y2="100" stroke="var(--brand-secondary)" strokeWidth="2" opacity="0.3"/>
    <line x1="100" y1="100" x2="60" y2="140" stroke="var(--brand-accent)" strokeWidth="2" opacity="0.3"/>
    <line x1="100" y1="100" x2="140" y2="140" stroke="var(--color-success)" strokeWidth="2" opacity="0.3"/>
    
    {/* Nodes */}
    <circle cx="60" cy="60" r="18" fill="url(#grad2)" opacity="0.8"/>
    <circle cx="140" cy="60" r="18" fill="var(--brand-secondary)" opacity="0.8"/>
    <circle cx="100" cy="100" r="24" fill="var(--brand-primary)" />
    <circle cx="60" cy="140" r="18" fill="var(--brand-accent)" opacity="0.8"/>
    <circle cx="140" cy="140" r="18" fill="var(--color-success)" opacity="0.8"/>
    
    {/* Center icon */}
    <path d="M100 90 L100 110 M90 100 L110 100" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Glow effects */}
    <circle cx="100" cy="100" r="28" fill="var(--brand-primary)" opacity="0.1"/>
    <circle cx="100" cy="100" r="36" fill="var(--brand-primary)" opacity="0.05"/>
  </svg>
);

export const AIProcessingIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Brain outline */}
    <path 
      d="M100 40 Q120 45, 130 60 Q140 75, 135 90 Q130 105, 120 115 Q110 125, 100 125 Q90 125, 80 115 Q70 105, 65 90 Q60 75, 70 60 Q80 45, 100 40" 
      fill="url(#grad3)" 
      opacity="0.2" 
      stroke="var(--brand-primary)" 
      strokeWidth="2"
    />
    
    {/* AI nodes inside brain */}
    <circle cx="85" cy="70" r="4" fill="var(--brand-primary)">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="100" cy="75" r="4" fill="var(--brand-secondary)">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="115" cy="70" r="4" fill="var(--brand-accent)">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="90" cy="90" r="4" fill="var(--color-info)">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="110" cy="90" r="4" fill="var(--color-success)">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    {/* Data flow arrows */}
    <path d="M100 140 L100 160" stroke="var(--brand-primary)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
    <path d="M70 100 L50 100" stroke="var(--brand-secondary)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
    <path d="M130 100 L150 100" stroke="var(--brand-accent)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="var(--brand-primary)" />
      </marker>
    </defs>
    
    {/* Processing text */}
    <rect x="75" y="165" width="50" height="20" rx="4" fill="var(--bg-secondary)" stroke="var(--border-primary)" strokeWidth="1"/>
    <circle cx="85" cy="175" r="2" fill="var(--brand-primary)">
      <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="95" cy="175" r="2" fill="var(--brand-primary)">
      <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="105" cy="175" r="2" fill="var(--brand-primary)">
      <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.6s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

export const LearningPathIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Path line */}
    <path 
      d="M50 150 Q75 130, 100 120 Q125 110, 150 90" 
      stroke="var(--brand-primary)" 
      strokeWidth="3" 
      strokeDasharray="5,5" 
      opacity="0.3"
      fill="none"
    />
    
    {/* Steps */}
    <circle cx="50" cy="150" r="12" fill="var(--color-success)" stroke="white" strokeWidth="2"/>
    <path d="M46 150 L49 153 L54 146" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    
    <circle cx="100" cy="120" r="12" fill="var(--brand-primary)" stroke="white" strokeWidth="2"/>
    <circle cx="100" cy="120" r="4" fill="white"/>
    
    <circle cx="150" cy="90" r="12" fill="var(--bg-secondary)" stroke="var(--border-primary)" strokeWidth="2"/>
    
    {/* Book icon at end */}
    <rect x="140" y="60" width="20" height="24" rx="2" fill="url(#grad4)" opacity="0.8"/>
    <line x1="145" y1="60" x2="145" y2="84" stroke="white" strokeWidth="1"/>
    <line x1="150" y1="60" x2="150" y2="84" stroke="white" strokeWidth="1"/>
    <line x1="155" y1="60" x2="155" y2="84" stroke="white" strokeWidth="1"/>
    
    {/* Trophy */}
    <path d="M35 35 L40 45 L60 45 L65 35 Z" fill="var(--color-warning)" opacity="0.8"/>
    <rect x="45" y="45" width="10" height="8" fill="var(--color-warning)" opacity="0.6"/>
    <circle cx="50" cy="30" r="8" fill="var(--color-warning)" opacity="0.4"/>
  </svg>
);

export const SuccessIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Success circle */}
    <circle cx="100" cy="100" r="50" fill="url(#grad5)" opacity="0.1"/>
    <circle cx="100" cy="100" r="40" fill="url(#grad5)" opacity="0.2"/>
    <circle cx="100" cy="100" r="30" fill="var(--color-success)"/>
    
    {/* Checkmark */}
    <path d="M85 100 L95 110 L115 85" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    
    {/* Confetti */}
    <rect x="60" y="40" width="8" height="8" fill="var(--brand-primary)" opacity="0.6" transform="rotate(45 64 44)"/>
    <rect x="140" y="50" width="6" height="6" fill="var(--brand-accent)" opacity="0.6" transform="rotate(30 143 53)"/>
    <circle cx="50" cy="120" r="3" fill="var(--brand-secondary)" opacity="0.6"/>
    <circle cx="150" cy="130" r="3" fill="var(--color-warning)" opacity="0.6"/>
    <rect x="70" y="150" width="6" height="6" fill="var(--color-info)" opacity="0.6" transform="rotate(15 73 153)"/>
  </svg>
);

export const ErrorIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Error circle */}
    <circle cx="100" cy="100" r="50" fill="var(--color-error)" opacity="0.1"/>
    <circle cx="100" cy="100" r="40" fill="var(--color-error)" opacity="0.2"/>
    <circle cx="100" cy="100" r="30" fill="var(--color-error)"/>
    
    {/* X mark */}
    <line x1="90" y1="90" x2="110" y2="110" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <line x1="110" y1="90" x2="90" y2="110" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    
    {/* Alert */}
    <path d="M100 140 L100 150" stroke="var(--color-error)" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="100" cy="160" r="2" fill="var(--color-error)"/>
  </svg>
);

export const DataVisualizationIllustration = ({ className = "w-64 h-64" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bar chart */}
    <rect x="40" y="100" width="20" height="60" rx="4" fill="var(--brand-primary)" opacity="0.6">
      <animate attributeName="height" values="60;40;60" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="y" values="100;120;100" dur="2s" repeatCount="indefinite"/>
    </rect>
    <rect x="70" y="80" width="20" height="80" rx="4" fill="var(--brand-secondary)" opacity="0.6">
      <animate attributeName="height" values="80;100;80" dur="2s" begin="0.3s" repeatCount="indefinite"/>
      <animate attributeName="y" values="80;60;80" dur="2s" begin="0.3s" repeatCount="indefinite"/>
    </rect>
    <rect x="100" y="60" width="20" height="100" rx="4" fill="var(--brand-accent)" opacity="0.6">
      <animate attributeName="height" values="100;120;100" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      <animate attributeName="y" values="60;40;60" dur="2s" begin="0.6s" repeatCount="indefinite"/>
    </rect>
    <rect x="130" y="90" width="20" height="70" rx="4" fill="var(--color-success)" opacity="0.6">
      <animate attributeName="height" values="70;50;70" dur="2s" begin="0.9s" repeatCount="indefinite"/>
      <animate attributeName="y" values="90;110;90" dur="2s" begin="0.9s" repeatCount="indefinite"/>
    </rect>
    
    {/* Line chart overlay */}
    <polyline 
      points="50,140 80,100 110,70 140,110" 
      stroke="var(--brand-primary)" 
      strokeWidth="3" 
      fill="none"
      opacity="0.5"
    />
    
    {/* Data points */}
    <circle cx="50" cy="140" r="4" fill="var(--brand-primary)"/>
    <circle cx="80" cy="100" r="4" fill="var(--brand-secondary)"/>
    <circle cx="110" cy="70" r="4" fill="var(--brand-accent)"/>
    <circle cx="140" cy="110" r="4" fill="var(--color-success)"/>
  </svg>
);
