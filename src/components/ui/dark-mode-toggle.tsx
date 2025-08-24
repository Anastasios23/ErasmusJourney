import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleDarkMode}
      className="relative h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        <Sun 
          className={`h-4 w-4 transition-all duration-300 ${
            isDarkMode 
              ? 'scale-0 rotate-90 opacity-0' 
              : 'scale-100 rotate-0 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
            isDarkMode 
              ? 'scale-100 rotate-0 opacity-100' 
              : 'scale-0 -rotate-90 opacity-0'
          }`} 
        />
      </div>
    </Button>
  );
}
