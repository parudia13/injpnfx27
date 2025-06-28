import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as 'id' | 'en');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code ? 'bg-gray-50 font-medium' : ''
              } cursor-pointer`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.code.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;