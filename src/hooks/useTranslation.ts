import { useAppStore } from '../store/useAppStore';
import { getTranslation, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const { language } = useAppStore();
  
  const t = (key: TranslationKey): string => {
    return getTranslation(key, language.code);
  };
  
  return { t, language: language.code };
};