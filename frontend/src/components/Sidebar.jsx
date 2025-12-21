import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  PieChart, 
  Receipt, 
  Gift, 
  Bell,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const location = useLocation();
  const { logoutUser } = useAuth();
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useSidebar();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/accounts', label: 'Accounts', icon: CreditCard },
    { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
    { path: '/budgets', label: 'Budgets', icon: PieChart },
    { path: '/bills', label: 'Bills', icon: Receipt },
    { path: '/rewards', label: 'Rewards', icon: Gift },
    { path: '/alerts', label: 'Alerts', icon: Bell },
  ];

  // Auto-minimize on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, closeSidebar]);

  const handleHeaderClick = () => {
    if (!isSidebarOpen) toggleSidebar();
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen 
          /* BACKGROUND: Soft Grey for the whole bar */
          bg-gray-50
          border-r border-gray-200 
          transition-all duration-300 ease-in-out shadow-xl
          
          /* Mobile Logic */
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}

          /* Desktop Logic */
          ${isSidebarOpen ? 'w-64' : 'md:w-20 w-64'} 
        `}
      >
        {/* --- HEADER --- */}
        <div className={`h-20 flex items-center px-4 mb-2 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          
          <div 
            onClick={handleHeaderClick}
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'cursor-pointer p-2 hover:bg-white rounded-xl shadow-sm' : ''}`}
            title={!isSidebarOpen ? "Click to Expand" : ""}
          >
            <div className="w-10 h-10 min-w-[40px] bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-sm">
              B
            </div>
            <span className={`text-2xl font-bold text-sky-700 whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              BankApp
            </span>
          </div>

          {/* Close Button (Visible when Open) */}
          {isSidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        {/* --- NAV ITEMS --- */}
        <nav className="px-3 space-y-2 overflow-y-auto overflow-x-hidden h-[calc(100vh-160px)] scrollbar-hide py-2"> 
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Active logic (Both '/' and '/dashboard' light up)
            const isActive = location.pathname === item.path || 
                             (item.path === '/' && location.pathname === '/dashboard');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && closeSidebar()}
                className={`
                  relative flex items-center py-3.5 rounded-xl transition-all duration-200 group
                  cursor-default
                  
                  /* Spacing Logic */
                  ${isSidebarOpen ? 'px-4 gap-4' : 'justify-center px-2'}

                  /* --- COLOR & HOVER LOGIC --- */
                  ${isActive 
                    /* SELECTED STATE: */
                    ? 'bg-sky-100 shadow-lg shadow-sky-200 text-sky-900' 
                    
                    /* UNSELECTED STATE: */
                    : 'text-gray-500 hover:bg-white hover:shadow-md hover:text-sky-700'
                  }
                `}
              >
                {/* 1. LEFT BORDER INDICATOR (Only when active) */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-sky-600 rounded-r-full shadow-sm" />
                )}

                {/* 2. ICON */}
                <Icon 
                  size={24} 
                  className={`
                    shrink-0 transition-colors duration-200
                    ${isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-sky-600'}
                  `} 
                />
                
                {/* 3. TEXT LABEL */}
                <span 
                  className={`
                    font-medium whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}
                    ${isActive ? 'font-bold' : ''}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* --- FOOTER --- */}
        <div className={`absolute bottom-0 w-full p-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <button 
            onClick={logoutUser} 
            className="flex items-center w-full bg-white text-red-500 shadow-md hover:shadow-xl rounded-2xl transition-all py-3 px-4 gap-3 cursor-pointer"
          >
            <LogOut size={22} className="shrink-0" />
            <span className="font-medium whitespace-nowrap overflow-hidden">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;