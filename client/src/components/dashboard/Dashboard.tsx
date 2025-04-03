import { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Chatbot from "./Chatbot";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <MainContent activeSection={activeSection} />
      <Chatbot />
    </div>
  );
};

export default Dashboard;
