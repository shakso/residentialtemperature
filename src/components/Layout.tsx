import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { Thermometer, FileText, Bell, Menu, Settings, Battery, LogOut, LineChart, Router, Link2, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  const getPageTitle = () => {
    const currentPath = location.pathname.split('/').pop();
    return currentPath?.charAt(0).toUpperCase() + currentPath?.slice(1) || 'Sensors';
  };

  const baseNavItems = [
    { path: '/admin/sensors', icon: Thermometer, label: 'Sensors' },
    { path: '/admin/gateways', icon: Router, label: 'Gateways' },
    { path: '/admin/graphs', icon: LineChart, label: 'Graphs' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/alerts', icon: Bell, label: 'Alerts' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  // Filter nav items based on user role
  const navItems = user?.email === 'alex@alexshakespeare.com' 
    ? [
        ...baseNavItems,
        { path: '/admin/linking', icon: Link2, label: 'Linking', className: 'text-red-500 hover:text-red-600' }
      ]
    : baseNavItems;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'demo_user':
        return {
          text: 'Demo User',
          icon: <Shield className="h-3 w-3 text-red-500" />
        };
      case 'view_user':
        return {
          text: 'Invited User',
          icon: <Shield className="h-3 w-3 text-yellow-500" />
        };
      case 'account_admin':
        return {
          text: 'Account Admin',
          icon: <Shield className="h-3 w-3 text-green-500" />
        };
      case 'super_admin':
        return {
          text: 'Super Admin',
          icon: <Shield className="h-3 w-3 text-orange-500" />
        };
      default:
        return {
          text: 'User',
          icon: <Shield className="h-3 w-3 text-gray-500" />
        };
    }
  };

  const handleSignOut = async () => {
    try {
      signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex md:flex-row flex-col">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-white shadow-lg z-50 flex items-center px-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center ml-4">
          {(() => {
            const path = location.pathname;
            if (path.includes('/sensors')) return <Thermometer className="h-5 w-5 text-blue-500 mr-2" />;
            if (path.includes('/gateways')) return <Router className="h-5 w-5 text-blue-500 mr-2" />;
            if (path.includes('/graphs')) return <LineChart className="h-5 w-5 text-blue-500 mr-2" />;
            if (path.includes('/reports')) return <FileText className="h-5 w-5 text-blue-500 mr-2" />;
            if (path.includes('/alerts')) return <Bell className="h-5 w-5 text-blue-500 mr-2" />;
            if (path.includes('/settings')) return <Settings className="h-5 w-5 text-blue-500 mr-2" />;
            if (path.includes('/linking')) return <Link2 className="h-5 w-5 text-red-500 mr-2" />;
            return null;
          })()}
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Thermometer className="h-8 w-8 text-gray-500 mr-2" />
                  <div className="flex flex-col">
                    <span className="text-logo font-bold text-blue-500">residential</span>
                    <span className="text-logo font-bold text-orange-500">temperature</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-6">
                <div>
                  <div>Logged in as {userProfile?.first_name || user?.first_name} {userProfile?.last_name || user?.last_name}</div>
                  <div className="flex items-center mt-1 text-[10px]" title={getRoleDisplay(userProfile?.role).text}>
                    {getRoleDisplay(userProfile?.role).icon}
                    <span className="ml-1">{getRoleDisplay(userProfile?.role).text}</span>
                  </div>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => {
                        const baseClasses = `flex items-center px-4 py-3 rounded-md ${item.className || ''}`;
                        const activeClasses = item.className 
                          ? 'bg-red-50' 
                          : 'bg-blue-50 text-blue-600';
                        const inactiveClasses = item.className 
                          ? '' 
                          : 'text-gray-600 hover:bg-gray-50';
                        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
                      }}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.label}
                    </NavLink>
                  );
                })}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <LogOut size={20} className="mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'md:w-64' : 'md:w-12'
        } bg-white shadow-lg transition-all duration-300 ease-in-out hidden md:flex
        md:relative md:flex-col md:h-screen`}
      >
        <div className={`${isSidebarOpen ? 'md:p-4 px-4' : 'md:p-2 px-2'} md:w-full flex-shrink-0`}>
          <div className="flex md:justify-between items-center h-16 md:h-auto">
            <Link to="/" className={`md:flex hidden items-center hover:opacity-75 transition-opacity ${isSidebarOpen ? 'space-x-2' : 'justify-center'}`}>
              <Thermometer className={`h-8 w-8 text-gray-500 ${!isSidebarOpen && 'hidden'}`} />
              <div className={`flex flex-col ${!isSidebarOpen && 'hidden'}`}>
                <span className="text-logo font-bold text-blue-500">residential</span>
                <span className="text-logo font-bold text-orange-500">temperature</span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg md:block hidden"
            >
              <Menu size={20} />
            </button>
          </div>
          {isSidebarOpen && user && window.innerWidth >= 768 && (
            <div className="mt-2 px-2 text-sm text-gray-500">
              <div>Logged in as {userProfile?.first_name || user.first_name} {userProfile?.last_name || user.last_name}</div>
              <span className="flex items-center text-[10px]" title={getRoleDisplay(userProfile?.role).text}>
                {getRoleDisplay(userProfile?.role).icon}
                <span className="ml-1">{getRoleDisplay(userProfile?.role).text}</span>
              </span>
            </div>
          )}
        </div>
        <nav className="md:mt-4 flex md:flex-col flex-row flex-1 md:w-full overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => { 
                  const baseClasses = `flex items-center md:px-4 px-2 py-3 md:w-full ${item.className || ''}`;
                  const activeClasses = item.className 
                    ? 'bg-red-50' 
                    : 'bg-blue-50 text-blue-600';
                  const inactiveClasses = item.className 
                    ? '' 
                    : 'text-gray-600 hover:bg-gray-50';
                  
                  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
                }}
              >
                <Icon size={20} className="min-w-[20px]" />
                {isSidebarOpen && <span className="ml-3 md:block hidden">{item.label}</span>}
              </NavLink>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center md:px-4 px-2 py-3 md:w-full text-gray-600 hover:bg-gray-50"
          >
            <LogOut size={20} className="min-w-[20px]" />
            {isSidebarOpen && <span className="ml-3 md:block hidden">Sign Out</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-2 overflow-auto md:mt-0 mt-12 md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
