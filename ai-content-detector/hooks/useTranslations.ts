import { translations } from '../translations';
import type { Language } from '../App';

export const useTranslations = (language: Language) => {
  return translations[language];
};
