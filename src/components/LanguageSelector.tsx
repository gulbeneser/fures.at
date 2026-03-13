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
    "--glass-surface-bg": "rgba(255, 255, 255, 0.16)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.24)",
    "--glass-highlight-height": "12%",
  } as CSSProperties;

  const dropdownGlassStyle = {
    "--glass-surface-bg": "rgba(255, 255, 255, 0.14)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.2)",
    "--glass-highlight-height": "11%",
    "--glass-reflection-height": "42%",
  } as CSSProperties;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/18 bg-white/[0.06] text-xs text-white/88 hover:text-white"
          style={triggerGlassStyle}
        >
          <Globe className="relative z-10 h-4 w-4" />
          <span className="relative z-10 hidden text-sm sm:inline">{currentLanguage?.flag}</span>
          <span className="relative z-10 text-sm">{currentLanguage?.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="liquid-glass mt-2 w-48 rounded-2xl border-white/20 bg-white/[0.06] p-1 text-white"
        style={dropdownGlassStyle}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`liquid-glass flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
              language === lang.code ? 'is-active text-white' : 'text-slate-100/82 hover:text-white'
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