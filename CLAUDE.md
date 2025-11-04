# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soccer1 is a Vue 3-based football odds calculation application that provides betting market analysis for major European football leagues. It allows users to select leagues, teams, and calculate various betting odds including 1X2 (win/draw/lose), Asian handicap, and goal lines (over/under).

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### Tech Stack
- **Vue 3.5.18** with Composition API
- **Vite 7.0.6** for build tooling
- **Pinia 3.0.3** for state management
- **Supabase** for backend data and RPC functions
- **Tailwind CSS** with dark mode support
- **vue-i18n** for internationalization (Chinese/English)

### Project Structure
```
src/
├── main.js                # App entry point with Pinia, i18n, and theme setup
├── App.vue                # Main application layout
├── supabase.js            # Supabase client configuration
├── index.css              # Tailwind CSS imports
├── i18n/
│   ├── index.js           # i18n configuration (default: zh, fallback: en)
│   └── locales/
│       ├── en.json        # English translations
│       └── zh.json        # Chinese translations
├── components/
│   ├── TopBar.vue         # Header with language/theme controls
│   └── Markets.vue        # Main odds calculation interface
└── store/                 # Pinia stores using function syntax
    ├── ThemeStore.js      # Dark/light theme management
    ├── LanguageStore.js   # Language preference handling
    ├── Leagues.js         # League data fetching
    ├── LeagueTeams.js     # Team data by league
    └── Markets.js         # Odds calculation logic
```

### State Management Pattern
All stores use **Composition API style** with Pinia function syntax (not options). The main stores are:
- **ThemeStore**: Manages dark/light theme with localStorage persistence and system preference detection
- **LanguageStore**: Handles language preference based on browser locale
- **Data Stores**: Leagues, LeagueTeams, and Markets for backend data fetching and calculations

### Backend Integration
- Uses **Supabase** with custom RPC functions:
  - `distinct_leagues()` - Get all available leagues
  - `distinct_teams_in_league(p_league)` - Get teams by league
  - `get_markets(league, team1, team2)` - Calculate odds for match
- Environment variables required in `.env`:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Theme & Internationalization
- **Dark Mode**: Complete dark/light theme using Tailwind's `dark:` classes with localStorage persistence
- **i18n**: Default language is Chinese (zh) with English fallback, covers all UI text, league names, and betting terms
- **Responsive Design**: Mobile-first with breakpoints at 768px, 480px

### Component Architecture
- Single-page application (no Vue Router)
- All components use `<script setup>` syntax
- Scoped CSS with extensive dark mode support
- Event-driven updates between components and stores

### Data Flow
1. User selects league → LeagueTeamsStore fetches teams for that league
2. User selects home/away teams → MarketsStore calculates odds via Supabase RPC
3. Results displayed with timestamp and three market types (1X2, Asian Handicap, Goal Line)

## Development Guidelines

### Code Style
- Use Composition API with `<script setup>` consistently
- Follow existing Pinia store patterns with function syntax
- Maintain dark mode compatibility in all new components
- Externalize all UI text to i18n locale files
- Use async/await patterns for API calls with proper error handling

### Path Aliases
- Use `@/` prefix for src directory imports (configured in vite.config.js)

### Styling
- Tailwind CSS utilities for all styling
- Dark mode classes using `dark:` prefix
- Glassmorphism effects with backdrop blur (existing design pattern)
- Smooth transitions for theme changes and interactions

### Testing & Build
- No testing framework currently configured
- Vite handles build optimization automatically
- Preview production builds locally with `npm run preview`

### Others
- 输出永远用中文
- 分步骤修改代码
- 每次只修改一处代码，修改代码的时候要询问我。