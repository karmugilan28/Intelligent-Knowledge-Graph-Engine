/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors
        void: '#050505',
        shell: '#0E0E10',
        titanium: '#141417',
        ashGray: '#A1A1AA',
        crispWhite: '#FAFAFA',
        
        // PRIMARY RAINBOW SPECTRUM (10 Core Colors)
        'electric-cyan': 'var(--color-electric-cyan)',
        'ocean-blue': 'var(--color-ocean-blue)',
        'royal-purple': 'var(--color-royal-purple)',
        'violet-dream': 'var(--color-violet-dream)',
        'magenta-pulse': 'var(--color-magenta-pulse)',
        'ruby-red': 'var(--color-ruby-red)',
        'sunset-orange': 'var(--color-sunset-orange)',
        'amber-gold': 'var(--color-amber-gold)',
        'lime-burst': 'var(--color-lime-burst)',
        'emerald-green': 'var(--color-emerald-green)',
        
        // EXTENDED VIBRANT PALETTE (20 Additional Colors)
        'sky-azure': 'var(--color-sky-azure)',
        'indigo-night': 'var(--color-indigo-night)',
        'lavender-mist': 'var(--color-lavender-mist)',
        'pink-flamingo': 'var(--color-pink-flamingo)',
        'rose-passion': 'var(--color-rose-passion)',
        'coral-sunset': 'var(--color-coral-sunset)',
        'peach-dream': 'var(--color-peach-dream)',
        'tangerine-fizz': 'var(--color-tangerine-fizz)',
        'honey-yellow': 'var(--color-honey-yellow)',
        'citrus-lime': 'var(--color-citrus-lime)',
        'mint-fresh': 'var(--color-mint-fresh)',
        'jade-forest': 'var(--color-jade-forest)',
        'teal-ocean': 'var(--color-teal-ocean)',
        'aqua-splash': 'var(--color-aqua-splash)',
        'arctic-blue': 'var(--color-arctic-blue)',
        'sapphire-deep': 'var(--color-sapphire-deep)',
        'cobalt-steel': 'var(--color-cobalt-steel)',
        'iris-bloom': 'var(--color-iris-bloom)',
        'orchid-purple': 'var(--color-orchid-purple)',
        'fuchsia-electric': 'var(--color-fuchsia-electric)',
        
        // METALLIC & LUXURY ACCENTS (5 Premium Colors)
        'gold-luxe': 'var(--color-gold-luxe)',
        'silver-chrome': 'var(--color-silver-chrome)',
        'bronze-antique': 'var(--color-bronze-antique)',
        'platinum-shine': 'var(--color-platinum-shine)',
        'copper-rose': 'var(--color-copper-rose)',
        
        // NEON GLOW SPECTRUM (5 Ultra-Bright Colors)
        'neon-pink': 'var(--color-neon-pink)',
        'neon-green': 'var(--color-neon-green)',
        'neon-blue': 'var(--color-neon-blue)',
        'neon-yellow': 'var(--color-neon-yellow)',
        'neon-orange': 'var(--color-neon-orange)',
        
        // Legacy support
        cyanAccent: 'var(--color-electric-cyan)',
        limeAccent: 'var(--color-lime-burst)',
        cyberAmber: 'var(--color-amber-gold)',
        foundational: 'var(--color-electric-cyan)',
        intermediate: 'var(--color-amber-gold)',
        advanced: 'var(--color-royal-purple)',
        success: 'var(--color-emerald-green)',
        ai: 'var(--color-magenta-pulse)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-rainbow': 'var(--gradient-rainbow)',
        'gradient-sunset': 'var(--gradient-sunset)',
        'gradient-ocean': 'var(--gradient-ocean)',
        'gradient-forest': 'var(--gradient-forest)',
        'gradient-cosmic': 'var(--gradient-cosmic)',
      },
    },
  },
  plugins: [],
}
