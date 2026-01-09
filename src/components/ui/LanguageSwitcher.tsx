'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    // Remove the current locale prefix from pathname
    let newPathname = pathname;

    // Check if pathname starts with a locale
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      // Remove the locale prefix
      segments.shift();
      newPathname = '/' + segments.join('/');
    }

    // For default locale (en), don't add prefix
    if (newLocale === 'en') {
      router.push(newPathname || '/');
    } else {
      router.push(`/${newLocale}${newPathname}`);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-medium border border-gold/20 hover:border-gold/40 transition-colors text-cream"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-gold" />
        <span className="text-sm font-medium">{localeFlags[locale]}</span>
        <span className="text-sm hidden sm:inline">{localeNames[locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg bg-navy-medium border border-gold/20 shadow-xl overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gold/10 transition-colors ${
                locale === loc ? 'bg-gold/20 text-gold' : 'text-cream'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span className="text-sm font-medium">{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
