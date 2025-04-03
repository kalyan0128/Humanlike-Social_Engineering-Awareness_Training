import { useEffect, useState } from "react";
import { logoutUser, getCurrentUser } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import gannonLogo from "@assets/gu logo.jpg";
import { User } from "@shared/schema";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Load user data on component mount
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/login");
  };

  // Navigation items for the sidebar
  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: "dashboard" },
    { id: "training", label: "Training Modules", icon: "school" },
    { id: "scenarios", label: "Threat Scenarios", icon: "security" },
    { id: "policies", label: "Organization Policies", icon: "policy" },
    { id: "progress", label: "My Progress", icon: "insights" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="bg-neutral-800 text-white w-full md:w-64 md:flex-shrink-0 md:h-screen overflow-y-auto">
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center">
          <img src={gannonLogo} alt="Gannon University Logo" className="h-8 mr-3" />
          <h1 className="text-xl font-bold">HumanLike-AwareBot</h1>
        </div>
      </div>
      
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-full h-10 w-10 flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.firstName && user?.lastName 
                ? `${user.firstName[0]}${user.lastName[0]}`
                : "U"}
            </span>
          </div>
          <div>
            <p className="font-semibold">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : "User"}
            </p>
            <p className="text-sm text-neutral-400">{user?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>
      
      <nav className="p-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a 
                href={`#${item.id}`}
                className={`flex items-center space-x-3 p-2 rounded text-neutral-100 transition duration-150 ${
                  activeSection === item.id 
                    ? "bg-primary-dark hover:bg-primary text-white" 
                    : "hover:bg-neutral-700"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(item.id);
                }}
              >
                <SidebarIcon name={item.icon} />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto border-t border-neutral-700">
        <button 
          className="flex items-center space-x-2 text-neutral-400 hover:text-white transition duration-150"
          onClick={handleLogout}
        >
          <SidebarIcon name="logout" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

interface SidebarIconProps {
  name: string;
}

const SidebarIcon = ({ name }: SidebarIconProps) => {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    school: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
    security: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    policy: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <path d="M14 2v6h6"></path>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
        <path d="M10 9H8"></path>
      </svg>
    ),
    insights: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h2a10 10 0 0 1 10 10v0a10 10 0 0 1-10-10z"></path>
        <path d="M2 2h2a10 10 0 0 0 10 10v0a10 10 0 0 0-10-10z"></path>
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    ),
    logout: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    ),
  };

  return icons[name] || <span>{name}</span>;
};

export default Sidebar;
