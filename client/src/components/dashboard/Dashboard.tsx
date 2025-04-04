import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Chatbot from "./Chatbot";

const Dashboard = () => {
  // Check localStorage for active section, default to "overview"
  const [activeSection, setActiveSection] = useState(() => {
    const savedSection = window.localStorage.getItem('dashboardActiveSection');
    return savedSection || "overview";
  });
  
  // Update localStorage when active section changes
  useEffect(() => {
    window.localStorage.setItem('dashboardActiveSection', activeSection);
  }, [activeSection]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <MainContent activeSection={activeSection} />
      <Chatbot />
    </div>
  );
};

export default Dashboard;
