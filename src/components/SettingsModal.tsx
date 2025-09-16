import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sun, Moon, Globe, Cpu } from 'lucide-react';
import { Button } from './ui/Button';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../hooks/useTranslation';
import { AIService } from '../services/aiService';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const { 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    aiProvider, 
    setAIProvider, 
    selectedModel, 
    setSelectedModel 
  } = useAppStore();
  const { t } = useTranslation();

  const availableProviders = AIService.getAvailableProviders();
  const languages = [
    { code: 'en' as const, name: 'English' },
    { code: 'zh' as const, name: '中文' }
  ];

  const handleThemeChange = (mode: 'light' | 'dark') => {
    setTheme({ mode });
    // Update document class for Tailwind
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (langCode: 'en' | 'zh') => {
    const lang = languages.find(l => l.code === langCode);
    if (lang) {
      setLanguage(lang);
    }
  };

  const handleProviderChange = (providerId: 'gemini' | 'openrouter') => {
    const provider = availableProviders.find(p => p.id === providerId);
    if (provider) {
      setAIProvider(provider);
      // Set first model as default
      if (provider.models.length > 0) {
        setSelectedModel(provider.models[0]);
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 w-full max-w-md z-50">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-6">
            {/* Theme Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Sun className="h-4 w-4 mr-2" />
                {t('theme')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    theme.mode === 'light'
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-400/10 dark:border-yellow-400/50 dark:text-yellow-400'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  {t('lightMode')}
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    theme.mode === 'dark'
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-400/10 dark:border-yellow-400/50 dark:text-yellow-400'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  {t('darkMode')}
                </button>
              </div>
            </div>

            {/* Language Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {t('language')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                      language.code === lang.code
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-400/10 dark:border-yellow-400/50 dark:text-yellow-400'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Provider Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Cpu className="h-4 w-4 mr-2" />
                {t('aiProvider')}
              </h3>
              <div className="space-y-3">
                {availableProviders.map((provider) => (
                  <div key={provider.id}>
                    <button
                      onClick={() => handleProviderChange(provider.id)}
                      className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                        aiProvider.id === provider.id
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-400/10 dark:border-yellow-400/50 dark:text-yellow-400'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium">{provider.name}</span>
                      {aiProvider.id === provider.id && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      )}
                    </button>
                    
                    {/* Model Selection */}
                    {aiProvider.id === provider.id && (
                      <div className="mt-2 ml-4">
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          {t('model')}
                        </label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100"
                        >
                          {provider.models.map((model) => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* API Key Notice */}
            {aiProvider.id === 'openrouter' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  OpenRouter requires an API key. Add VITE_OPENROUTER_API_KEY to your environment variables.
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};