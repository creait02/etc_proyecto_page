import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-black text-white py-24 px-6 md:px-12 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-bold tracking-tighter uppercase mb-8">ETC PROYECTO</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            {t('footer.description')}
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{t('footer.contact')}</h4>
          <ul className="space-y-4 text-sm font-light">
            <li><a href="#" className="hover:text-gray-300 transition-colors">info@etcproyecto.com</a></li>
            <li><a href="#" className="hover:text-gray-300 transition-colors">+44 (0) 20 1234 5678</a></li>
            <li className="text-gray-400">{t('footer.location')}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{t('footer.social')}</h4>
          <ul className="space-y-4 text-sm font-light">
            <li><a href="#" className="hover:text-gray-300 transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-gray-300 transition-colors">LinkedIn</a></li>
            <li><a href="#" className="hover:text-gray-300 transition-colors">Pinterest</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{t('footer.newsletter')}</h4>
          <div className="flex border-b border-white/30 pb-2">
            <input 
              type="email" 
              placeholder={t('footer.emailPlaceholder')} 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-600"
            />
            <button className="text-xs uppercase tracking-widest hover:text-gray-300">{t('footer.subscribe')}</button>
          </div>
        </div>
      </div>
      
      <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
        <p>{t('footer.rights')}</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#">{t('footer.privacy')}</a>
          <a href="#">{t('footer.terms')}</a>
        </div>
      </div>
    </footer>
  );
}
