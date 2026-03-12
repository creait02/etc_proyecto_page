import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'menu.projects': 'Projects',
    'menu.services': 'Services',
    'menu.studio': 'Studio',
    'menu.highlights': 'Highlights',
    'menu.contact': 'Contact',
    'menu.back': 'Back',
    'menu.webDesign': 'Web Design Agency',
    'services.arch': 'Architectural Design',
    'services.planning': 'Planning Applications',
    'services.interior': 'Interior Design',
    'services.conservation': 'Conservation & Heritage Design',
    'services.create': 'Create & Construct',
    'home.designMatters': 'DESIGN MATTERS',
    'home.studio': 'CARACAS DESIGN STUDIO',
    'home.viewProject': 'View Project',
    'home.scroll': 'Scroll to explore',
    'contact.getInTouch': 'Get in Touch',
    'contact.lets': "Let's",
    'contact.create': 'Create',
    'contact.description': "Have a project in mind? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.",
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.placeholder.name': 'John Doe',
    'contact.placeholder.email': 'john@example.com',
    'contact.placeholder.message': 'Tell us about your project...',
    'contact.send': 'Send Message',
    'footer.studio': 'Architecture and Interior Design Studio',
    'footer.subscribe': 'Subscribe to our newsletter',
    'footer.emailPlaceholder': 'Email Address',
    'footer.btnSubscribe': 'Subscribe',
    'footer.rights': 'All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'project.back': 'Back to Gallery',
    'project.backHome': 'Back to Home',
    'project.services': 'Services & Projects',
    'project.studio': 'ARCHITECTURE AND INTERIOR DESIGN STUDIO CARACAS'
  },
  es: {
    'menu.projects': 'Proyectos',
    'menu.services': 'Servicios',
    'menu.studio': 'Estudio',
    'menu.highlights': 'Destacados',
    'menu.contact': 'Contacto',
    'menu.back': 'Atrás',
    'menu.webDesign': 'Agencia de Diseño Web',
    'services.arch': 'Diseño Arquitectónico',
    'services.planning': 'Solicitudes de Planificación',
    'services.interior': 'Diseño de Interiores',
    'services.conservation': 'Diseño de Conservación y Patrimonio',
    'services.create': 'Creación y Construcción',
    'home.designMatters': 'EL DISEÑO IMPORTA',
    'home.studio': 'ESTUDIO DE DISEÑO EN CARACAS',
    'home.viewProject': 'Ver Proyecto',
    'home.scroll': 'Desplázate para explorar',
    'contact.getInTouch': 'Ponte en contacto',
    'contact.lets': 'Vamos a',
    'contact.create': 'Crear',
    'contact.description': '¿Tienes un proyecto en mente? Nos encantaría escucharte. Envíanos un mensaje y te responderemos lo antes posible.',
    'contact.name': 'Nombre',
    'contact.email': 'Correo',
    'contact.message': 'Mensaje',
    'contact.placeholder.name': 'Juan Pérez',
    'contact.placeholder.email': 'juan@ejemplo.com',
    'contact.placeholder.message': 'Cuéntanos sobre tu proyecto...',
    'contact.send': 'Enviar Mensaje',
    'footer.studio': 'Estudio de Arquitectura y Diseño de Interiores',
    'footer.subscribe': 'Suscríbete a nuestro boletín',
    'footer.emailPlaceholder': 'Correo Electrónico',
    'footer.btnSubscribe': 'Suscribir',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'project.back': 'Volver a la Galería',
    'project.backHome': 'Volver al Inicio',
    'project.services': 'Servicios y Proyectos',
    'project.studio': 'ESTUDIO DE ARQUITECTURA Y DISEÑO DE INTERIORES CARACAS'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
