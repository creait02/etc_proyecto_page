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

  const isAbsolute = className.includes('absolute');
  const baseClasses = `${!isAbsolute ? 'relative' : ''} ${className}`;

  if (!isAdminPreview) {
    return <div className={baseClasses}>{children}</div>;
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
      className={`${baseClasses} group cursor-pointer transition-all duration-200`}
    >
      {/* Outline that appears on hover in CMS mode */}
      <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/50 z-50 pointer-events-none rounded transition-colors" />
      
      {/* Optional: A small badge showing what element it is (like Elementor) */}
      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
        {element}
      </div>

      {children}
    </div>
  );
};

export default Editable;
