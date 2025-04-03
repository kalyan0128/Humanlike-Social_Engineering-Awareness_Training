import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { getDashboardData, DashboardData } from "@/lib/auth";
import ProgressSummary from "./ProgressSummary";
import ThreatScenarios from "./ThreatScenarios";
import OrgPolicies from "./OrgPolicies";
import { useLocation } from "wouter";

interface MainContentProps {
  activeSection: string;
}

const MainContent = ({ activeSection }: MainContentProps) => {
  const [_, setLocation] = useLocation();
  
  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: getDashboardData,
    retry: 1,
    onError: (error) => {
      // If we get a 401 error, redirect to login
      if (error instanceof Response && error.status === 401) {
        setLocation("/login");
      }
    }
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Render loading state
  if (isLoading) {
    return (
      <main className="flex-1 bg-neutral-100 overflow-y-auto">
        <div className="p-6">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-neutral-100 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">
            {activeSection === "overview" && "Dashboard Overview"}
            {activeSection === "training" && "Training Modules"}
            {activeSection === "scenarios" && "Threat Scenarios"}
            {activeSection === "policies" && "Organization Policies"}
            {activeSection === "progress" && "My Progress"}
            {activeSection === "settings" && "Settings"}
          </h1>
          <div className="flex space-x-2">
            <button className="bg-white p-2 rounded-full shadow-sm hover:bg-neutral-200 transition duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button className="bg-white p-2 rounded-full shadow-sm hover:bg-neutral-200 transition duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Show content based on active section */}
        {activeSection === "overview" && (
          <>
            <ProgressSummary 
              progress={data?.userProgress} 
              recommendedModules={data?.recommendedModules}
              achievements={data?.achievements}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ThreatScenarios 
                threats={data?.latestThreats} 
                className="md:col-span-2"
              />
              
              <OrgPolicies 
                policies={data?.policies} 
              />
            </div>
          </>
        )}
        
        {activeSection === "training" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Training Modules</h2>
            <p className="text-neutral-600">This section will display all available training modules.</p>
          </div>
        )}
        
        {activeSection === "scenarios" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Threat Scenarios</h2>
            <p className="text-neutral-600">This section will display detailed threat scenarios.</p>
          </div>
        )}
        
        {activeSection === "policies" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Organization Policies</h2>
            <p className="text-neutral-600">This section will display all organization policies.</p>
          </div>
        )}
        
        {activeSection === "progress" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">My Progress</h2>
            <p className="text-neutral-600">This section will display detailed progress tracking.</p>
          </div>
        )}
        
        {activeSection === "settings" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <p className="text-neutral-600">This section will allow you to customize your account settings.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
