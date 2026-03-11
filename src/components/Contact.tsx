import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Send } from 'lucide-react';
import { useRef, useState } from 'react';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();
  
  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <section 
        id="contact" 
        className="min-h-screen bg-white text-black flex items-center justify-center py-24 px-6 md:px-12 relative overflow-hidden perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-6">{t('contact.getInTouch')}</h2>
            <h1 className="text-5xl md:text-7xl font-light uppercase tracking-tight mb-8 leading-none">
              {t('contact.lets')} <br />
              <span className="font-bold">{t('contact.create')}</span>
            </h1>
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              {t('contact.description')}
            </p>
            
            <div className="space-y-2 text-sm font-mono text-gray-500">
              <p>INFO@ETCPROYECTO.COM</p>
              <p>+44 (0) 20 1234 5678</p>
            </div>
          </motion.div>

          {/* 3D Form */}
          <motion.form
            ref={formRef}
            style={{ 
              rotateX, 
              rotateY,
              transformStyle: "preserve-3d"
            }}
            className="bg-gray-200 p-8 md:p-12 rounded-2xl border border-black/10 shadow-2xl relative group"
          >
            {/* Glossy Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-2xl pointer-events-none" />

            <div className="space-y-8" style={{ transform: "translateZ(20px)" }}>
              <InputGroup label={t('contact.name')} type="text" placeholder="John Doe" />
              <InputGroup label={t('contact.email')} type="email" placeholder="john@example.com" />
              <InputGroup label={t('contact.message')} type="textarea" placeholder="Tell us about your project..." />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                {t('contact.send')}
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.form>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

function InputGroup({ label, type, placeholder }: { label: string, type: string, placeholder: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label className={`absolute left-0 transition-all duration-300 ${focused ? '-top-6 text-xs text-black' : 'top-0 text-gray-500'}`}>
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          className="w-full bg-transparent border-b border-black/30 py-2 text-black outline-none focus:border-black transition-colors resize-none h-32 placeholder-transparent"
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={(e) => setFocused(e.target.value !== '')}
        />
      ) : (
        <input
          type={type}
          className="w-full bg-transparent border-b border-black/30 py-2 text-black outline-none focus:border-black transition-colors placeholder-transparent"
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={(e) => setFocused(e.target.value !== '')}
        />
      )}
    </div>
  );
}
