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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group relative gap-2 overflow-hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-[1px] hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <span className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(135deg,rgba(93,123,255,0.45),rgba(146,90,255,0.4),rgba(255,122,73,0.45))] opacity-0 transition duration-300 group-hover:opacity-60" />
          <Globe className="relative z-10 h-4 w-4" />
          <span className="relative z-10 hidden text-sm sm:inline">{currentLanguage?.flag}</span>
          <span className="relative z-10 text-sm">{currentLanguage?.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-2 w-48 rounded-2xl border border-white/10 bg-[#07060b]/95 p-1 backdrop-blur-2xl shadow-[0_30px_90px_-40px_rgba(15,23,42,0.95)]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
              language === lang.code
                ? 'bg-[linear-gradient(135deg,rgba(93,123,255,0.78),rgba(146,90,255,0.75),rgba(255,122,73,0.75))] text-white shadow-[0_14px_28px_-18px_rgba(96,125,255,0.8)]'
                : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}