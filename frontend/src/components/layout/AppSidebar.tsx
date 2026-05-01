// frontend/src/components/layout/AppSidebar.tsx
import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AppSidebar: FC = () => {
  const location = useLocation();

  const navLinkClass = (path: string) => `
    block px-3 py-2 text-sm rounded transition-colors duration-200
    ${location.pathname === path 
      ? 'bg-[#7b1113] text-white font-medium shadow-md' 
      : 'text-gray-700 hover:bg-gray-100'
    }
  `;

  return (
    <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-20">
      <div className="h-14 flex items-center px-6 border-b border-gray-200 font-bold justify-content text-[#7b1113] tracking-wide">
        UPOU Helpdesk
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className={navLinkClass("/")}>
          Chat
        </Link>
        <Link to="/admin" className={navLinkClass("/admin")}>
          Admin Dashboard
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        v1.0.0
      </div>
    </div>
  );
};

export default AppSidebar;