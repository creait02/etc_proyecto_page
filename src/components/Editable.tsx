import React from 'react';
import { useSiteData } from '../contexts/SiteContext';

interface EditableProps {
  section: string;
  element: string;
  projectId?: string | number;
  memberId?: string | number;
  children: React.ReactNode;
  className?: string;
}

export const Editable: React.FC<EditableProps> = ({ section, element, projectId, memberId, children, className = '' }) => {
  const { isAdminPreview } = useSiteData();

  if (!isAdminPreview) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Send message to parent CMS
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'ELEMENT_CLICKED',
        payload: { section, element, projectId, memberId }
      }, '*');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative group cursor-pointer transition-all duration-200 ${className}`}
    >
      {/* Outline that appears on hover in CMS mode */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 group-hover:bg-blue-500/10 z-50 pointer-events-none rounded transition-colors" />
      
      {/* Optional: A small badge showing what element it is (like Elementor) */}
      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
        Editar {element}
      </div>

      {children}
    </div>
  );
};

export default Editable;
