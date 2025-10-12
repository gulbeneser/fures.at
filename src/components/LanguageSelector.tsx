import type { CSSProperties } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);

  const triggerGlassStyle = {
    "--glass-surface-bg": "rgba(12, 20, 42, 0.35)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.32)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.5)",
    "--glass-surface-reflection": "rgba(210, 230, 255, 0.36)",
    "--glass-highlight-height": "16%",
    "--glass-reflection-height": "58%",
  } as CSSProperties;

  const dropdownGlassStyle = {
    "--glass-surface-bg": "rgba(10, 18, 38, 0.42)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.28)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.42)",
    "--glass-surface-reflection": "rgba(210, 230, 255, 0.3)",
    "--glass-highlight-height": "14%",
    "--glass-reflection-height": "48%",
  } as CSSProperties;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/18 bg-white/8 text-xs text-white/85 hover:border-white/26 hover:bg-white/12 hover:text-white"
          style={triggerGlassStyle}
        >
          <Globe className="relative z-10 h-4 w-4" />
          <span className="relative z-10 hidden text-sm sm:inline">{currentLanguage?.flag}</span>
          <span className="relative z-10 text-sm">{currentLanguage?.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="liquid-glass mt-2 w-48 rounded-2xl p-2 text-white backdrop-blur-[42px] backdrop-saturate-[1.75]"
        style={dropdownGlassStyle}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`liquid-glass flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
              language === lang.code ? 'is-active text-white' : 'text-slate-200/80 hover:text-white'
            }`}
            data-active={language === lang.code || undefined}
            style={dropdownGlassStyle}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}