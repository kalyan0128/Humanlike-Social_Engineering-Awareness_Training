import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { DashboardData } from "@/lib/auth";
import ProgressSummary from "./ProgressSummary";
import ThreatScenarios from "./ThreatScenarios";
import OrgPolicies from "./OrgPolicies";
import SearchBar from "./SearchBar";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

// Define extended interfaces based on the DashboardData types to add any missing properties
// Make sure these match the expected properties in the dashboard data structures
interface TrainingModule {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  content?: string;
  order?: number;
  createdAt?: Date;
}

interface ThreatScenario {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  isNew: boolean;
  isTrending: boolean;
  content?: string;
  createdAt?: string | Date;
}

interface Policy {
  id: number;
  title: string;
  description: string;
  category: string;
  content?: string;
  createdAt?: string | Date;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
}

interface MainContentProps {
  activeSection: string;
}

// Function to fetch dashboard data
async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await fetch("/api/dashboard", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth data if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('acknowledged');
        throw new Error("401: Session expired");
      }
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    throw error;
  }
}

const MainContent = ({ activeSection }: MainContentProps) => {
  const [_, setLocation] = useLocation();
  
  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: fetchDashboardData,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0 // Override the default to ensure fresh data
  });
  
  // Force refetch when active section changes to "progress"
  useEffect(() => {
    if (activeSection === "progress") {
      refetch();
    }
  }, [activeSection, refetch]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      // Check for auth errors
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("acknowledged");
        setLocation("/login");
      }
      
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast, setLocation]);

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
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
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
          
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar />
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
            
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.recommendedModules?.map((module) => {
                  // Type-casting module to TrainingModule to ensure proper type checking
                  const moduleData = module as unknown as TrainingModule;
                  return (
                    <div 
                      key={moduleData.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer transition duration-150"
                      onClick={() => setLocation(`/training/${moduleData.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{moduleData.title}</h3>
                          <p className="text-neutral-600 mt-1">{moduleData.description}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          moduleData.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          moduleData.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {moduleData.difficulty?.charAt(0).toUpperCase() + moduleData.difficulty?.slice(1) || 'Beginner'}
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-sm">
                        <div className="flex items-center text-neutral-600 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M12 20.94a10 10 0 1 0-7-17.94"/>
                            <path d="M12 12v.1"/>
                            <polyline points="12 20.94 16 16 12 11"/>
                          </svg>
                          <span>{moduleData.type?.charAt(0).toUpperCase() + moduleData.type?.slice(1) || 'Quiz'}</span>
                        </div>
                        <div className="flex items-center text-neutral-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <circle cx="12" cy="8" r="7"/>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                          </svg>
                          <span>{moduleData.xpReward || 10} XP</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <div className="bg-primary text-white px-3 py-1 rounded flex items-center text-sm">
                          <span className="mr-1">Start Module</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeSection === "scenarios" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Threat Scenarios</h2>
            
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.latestThreats?.map((threat) => {
                  // Type-casting threat to ThreatScenario to ensure proper type checking
                  const threatData = threat as unknown as ThreatScenario;
                  return (
                    <div 
                      key={threatData.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer transition duration-150"
                      onClick={() => setLocation(`/scenarios/${threatData.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-lg">{threatData.title}</h3>
                            {threatData.isNew && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                New
                              </span>
                            )}
                            {threatData.isTrending && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Trending
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-600 mt-1">{threatData.description}</p>
                        </div>
                        <div className={`ml-4 px-2 py-1 rounded text-xs ${
                          threatData.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          threatData.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {threatData.difficulty?.charAt(0).toUpperCase() + threatData.difficulty?.slice(1) || 'Beginner'}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <div className="bg-primary text-white px-3 py-1 rounded flex items-center text-sm">
                          <span className="mr-1">View Scenario</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeSection === "policies" && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Organization Policies</h2>
            
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.policies?.map((policy) => {
                  // Type-casting policy to Policy to ensure proper type checking
                  const policyData = policy as unknown as Policy;
                  return (
                    <div 
                      key={policyData.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer transition duration-150"
                      onClick={() => setLocation(`/policies/${policyData.id}`)}
                    >
                      <div className="flex items-start">
                        <div className="p-2 rounded-md mr-3 flex-shrink-0 text-primary">
                          {policyData.category === 'data-security' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          )}
                          {policyData.category === 'communication' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          )}
                          {policyData.category === 'incident-response' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                          )}
                          {policyData.category === 'usage-policy' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          )}
                          {policyData.category === 'access-control' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          )}
                          {policyData.category === 'device-security' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                              <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                          )}
                          {policyData.category === 'vendor-management' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          )}
                          {policyData.category === 'physical-security' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          )}
                          {policyData.category === 'security-awareness' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          )}
                          {policyData.category === 'remote-work' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                              <line x1="8" y1="21" x2="16" y2="21"></line>
                              <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{policyData.title}</h3>
                          <p className="text-neutral-600 mt-1">{policyData.description}</p>
                          <div className="flex mt-2">
                            <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full capitalize">
                              {policyData.category.split('-').join(' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <div className="bg-primary text-white px-3 py-1 rounded flex items-center text-sm">
                          <span className="mr-1">View Policy</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
