import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTimeGreeting } from '../utils/timeUtils';
import { MUSIC_THEMES } from '../constants/themes';
import { Button, ThemeToggle } from '../components/ui';
import { usePlayerStore } from '../store/playerStore';
import type { MusicGenre, ThemeCategory } from '../types';

const Landing = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] =
    useState<ThemeCategory | null>(null);
  const setSelectedGenre = usePlayerStore((state) => state.setSelectedGenre);

  const greeting = getTimeGreeting();

  const handleGenreSelect = (genre: MusicGenre) => {
    setSelectedGenre(genre);
    navigate('/player');
  };

  const selectedTheme = MUSIC_THEMES.find(
    (theme) => theme.category === selectedCategory
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full space-y-12 animate-fade-in">
        {/* Greeting Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient">
            {greeting}
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-slate-700 dark:text-slate-300">
            어떤 노래 듣고 싶으신가요?
          </p>
        </div>

        {/* Category Selection */}
        {!selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MUSIC_THEMES.map((theme) => (
              <button
                key={theme.category}
                onClick={() => setSelectedCategory(theme.category)}
                className="glass-effect p-6 rounded-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-center space-y-2">
                  <div className="text-4xl mb-2">
                    {getCategoryEmoji(theme.category)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {theme.categoryNameKo}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {theme.categoryName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Genre Selection */
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                {selectedTheme?.categoryNameKo}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                ← 뒤로
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTheme?.genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre)}
                  className="glass-effect p-6 rounded-xl hover:glow-primary transition-all duration-300 text-left group"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {genre.nameKo}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {genre.name}
                    </p>
                    {genre.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {genre.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI가 생성하는 나만의 음악 경험
        </p>
      </div>
    </div>
  );
};

// Category Emoji Helper
const getCategoryEmoji = (category: ThemeCategory): string => {
  const emojis: Record<ThemeCategory, string> = {
    focus: '🎯',
    energy: '⚡',
    relax: '🌙',
    mood: '🎨',
    workout: '💪',
  };
  return emojis[category];
};

export default Landing;
