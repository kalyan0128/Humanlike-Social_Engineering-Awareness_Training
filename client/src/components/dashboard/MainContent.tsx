import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { DashboardData } from "@/lib/auth";
import ProgressSummary from "./ProgressSummary";
import ThreatScenarios from "./ThreatScenarios";
import OrgPolicies from "./OrgPolicies";
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
          <div className="space-y-6">
            {/* Progress Overview Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Progress Overview</h2>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-6">
                    <div className="mr-6 relative">
                      <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 36 36">
                        <path 
                          className="ring" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E9ECEF"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                        />
                        <path 
                          className="progress" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#9E1B32"
                          strokeWidth="3"
                          strokeDasharray={`${data?.userProgress.progressPercentage || 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
                        {data?.userProgress.progressPercentage || 0}%
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-neutral-800">Training Progress</h3>
                      <p className="text-neutral-600 mt-1">
                        You've completed {data?.userProgress.completedModules || 0} out of {data?.userProgress.totalModules || 0} modules
                      </p>
                      <div className="mt-2 flex items-center">
                        <div className="mr-2 text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-neutral-700">Level {data?.userProgress.currentLevel || "Beginner"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-neutral-800">XP Progress</h3>
                      <span className="text-sm text-neutral-600">
                        {data?.userProgress.xpPoints || 0} / {(data?.userProgress.xpPoints || 0) + (data?.userProgress.xpToNextLevel || 0)} XP
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${data?.userProgress.xpProgress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">
                      {data?.userProgress.xpToNextLevel || 0} XP needed to reach the next level
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Completed Modules Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Completed Training</h2>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : data?.completedTraining && data.completedTraining.length > 0 ? (
                <div className="space-y-4">
                  {data.completedTraining?.map((module: any) => (
                    <div key={module.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition duration-150">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-base">{module.title}</h3>
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Completed
                            </span>
                          </div>
                          <p className="text-neutral-600 text-sm mt-1">{module.description}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          module.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          module.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {module.difficulty?.charAt(0).toUpperCase() + module.difficulty?.slice(1) || 'Beginner'}
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <div className="flex items-center text-neutral-600 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M12 20.94a10 10 0 1 0-7-17.94"/>
                            <path d="M12 12v.1"/>
                            <polyline points="12 20.94 16 16 12 11"/>
                          </svg>
                          <span>{module.type?.charAt(0).toUpperCase() + module.type?.slice(1) || 'Module'}</span>
                        </div>
                        <div className="flex items-center text-neutral-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <circle cx="12" cy="8" r="7"/>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                          </svg>
                          <span>{module.xpReward || 10} XP Earned</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-neutral-300 rounded-lg">
                  <div className="text-neutral-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-neutral-700">No completed training yet</h3>
                  <p className="text-neutral-500 text-sm mt-1">Complete training modules to see them here</p>
                </div>
              )}
            </div>
            
            {/* Acknowledged Policies Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Acknowledged Policies</h2>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : data?.acknowledgedPolicies && data.acknowledgedPolicies.length > 0 ? (
                <div className="space-y-4">
                  {data.acknowledgedPolicies?.map((policy: any) => (
                    <div key={policy.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition duration-150">
                      <div className="flex items-start">
                        <div className="p-2 rounded-md mr-3 flex-shrink-0 text-primary">
                          {policy.category === 'data-security' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          )}
                          {policy.category === 'communication' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          )}
                          {policy.category === 'device-security' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                              <line x1="12" y1="18" x2="12" y2="18"></line>
                            </svg>
                          )}
                          {policy.category === 'remote-work' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                          )}
                          {(policy.category !== 'data-security' && 
                            policy.category !== 'communication' && 
                            policy.category !== 'device-security' && 
                            policy.category !== 'remote-work') && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{policy.title}</h3>
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Acknowledged
                            </span>
                          </div>
                          <p className="text-neutral-600 text-sm mt-1">{policy.description}</p>
                          <div className="mt-2 text-primary text-sm hover:underline cursor-pointer"
                               onClick={() => setLocation(`/policies/${policy.id}`)}>
                            View Policy
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-neutral-300 rounded-lg">
                  <div className="text-neutral-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-neutral-700">No acknowledged policies yet</h3>
                  <p className="text-neutral-500 text-sm mt-1">Review and acknowledge policies to see them here</p>
                </div>
              )}
            </div>
            
            {/* Achievements Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Achievements</h2>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : data?.achievements && data.achievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.achievements?.map((achievement) => (
                    <div key={achievement.id} className="border border-neutral-200 rounded-lg p-4 flex flex-col items-center text-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-3 text-primary">
                        {achievement.icon === 'star' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        )}
                        {achievement.icon === 'award' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                          </svg>
                        )}
                        {achievement.icon === 'trophy' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 2v3.5a2.5 2.5 0 0 0 2.5 2.5h15a2.5 2.5 0 0 0 2.5-2.5V2"></path>
                            <path d="M2.5 18v3.5a2.5 2.5 0 0 0 2.5 2.5h15a2.5 2.5 0 0 0 2.5-2.5V18"></path>
                            <path d="M2.5 10v8h19v-8a8 8 0 0 0-8-8h-3a8 8 0 0 0-8 8Z"></path>
                            <path d="M9 22v-4"></path>
                            <path d="M15 22v-4"></path>
                          </svg>
                        )}
                        {achievement.icon === 'shield' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        )}
                        {!['star', 'award', 'trophy', 'shield'].includes(achievement.icon) && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                          </svg>
                        )}
                      </div>
                      <h3 className="font-medium text-neutral-800">{achievement.title}</h3>
                      <p className="text-neutral-600 text-sm mt-1">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-neutral-300 rounded-lg">
                  <div className="text-neutral-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-neutral-700">No achievements earned yet</h3>
                  <p className="text-neutral-500 text-sm mt-1">Complete training and activities to earn achievements</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeSection === "settings" && (
          <div className="space-y-6">
            {/* User Profile Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">User Profile</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="bg-neutral-100 rounded-lg p-6 flex flex-col items-center">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-semibold mb-3">
                        {data?.userProfile?.firstName?.charAt(0) || 'U'}{data?.userProfile?.lastName?.charAt(0) || 'S'}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm hover:bg-neutral-200 transition duration-150 border border-neutral-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                          <line x1="16" y1="5" x2="22" y2="11"/>
                          <line x1="14" y1="7" x2="14" y2="13"/>
                          <line x1="8" y1="13" x2="14" y2="13"/>
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-medium text-lg mt-2 text-center">
                      {data?.userProfile?.firstName || 'User'} {data?.userProfile?.lastName || ''}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Level {data?.userProgress?.currentLevel || 'Beginner'} • {data?.userProgress?.xpPoints || 0} XP
                    </p>
                    <div className="mt-4 w-full">
                      <button className="w-full bg-primary text-white px-4 py-2 rounded flex items-center justify-center text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="First Name"
                          defaultValue={data?.userProfile?.firstName || ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Last Name"
                          defaultValue={data?.userProfile?.lastName || ''}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Email Address"
                        defaultValue={data?.userProfile?.email || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
                      <textarea 
                        className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tell us a bit about yourself"
                        rows={3}
                        defaultValue={data?.userProfile?.bio || ''}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="bg-primary text-white px-4 py-2 rounded text-sm font-medium">
                        Save Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Account Security</h2>
              <div className="space-y-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-neutral-600 text-sm">Update your password regularly to keep your account secure</p>
                    </div>
                    <button className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 px-4 py-2 rounded text-sm font-medium transition duration-150">
                      Change
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-neutral-600 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-sm">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Disabled</span>
                      </div>
                      <button className="bg-primary text-white px-4 py-2 rounded text-sm font-medium">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Login History</h3>
                      <p className="text-neutral-600 text-sm">View your recent login activity</p>
                    </div>
                    <button className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 px-4 py-2 rounded text-sm font-medium transition duration-150">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border-b">
                  <div>
                    <h3 className="font-medium">New Training Modules</h3>
                    <p className="text-neutral-600 text-sm">Get notified when new training content is available</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input 
                      type="checkbox"
                      className="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:outline-none peer checked:right-0 checked:border-primary right-6"
                      defaultChecked
                    />
                    <label
                      className="block h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 peer-checked:bg-primary"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border-b">
                  <div>
                    <h3 className="font-medium">New Threat Alerts</h3>
                    <p className="text-neutral-600 text-sm">Be alerted about emerging social engineering threats</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input 
                      type="checkbox"
                      className="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:outline-none peer checked:right-0 checked:border-primary right-6"
                      defaultChecked
                    />
                    <label
                      className="block h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 peer-checked:bg-primary"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border-b">
                  <div>
                    <h3 className="font-medium">Achievement Milestones</h3>
                    <p className="text-neutral-600 text-sm">Receive notifications about your progress and achievements</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input 
                      type="checkbox"
                      className="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:outline-none peer checked:right-0 checked:border-primary right-6"
                      defaultChecked
                    />
                    <label
                      className="block h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 peer-checked:bg-primary"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border-b">
                  <div>
                    <h3 className="font-medium">Policy Updates</h3>
                    <p className="text-neutral-600 text-sm">Get notified when organization policies are updated</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input 
                      type="checkbox"
                      className="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:outline-none peer checked:right-0 checked:border-primary right-6"
                      defaultChecked
                    />
                    <label
                      className="block h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 peer-checked:bg-primary"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-neutral-600 text-sm">Receive important updates via email</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input 
                      type="checkbox"
                      className="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:outline-none peer checked:right-0 checked:border-primary right-6"
                      defaultChecked
                    />
                    <label
                      className="block h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 peer-checked:bg-primary"
                    ></label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Appearance Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-primary rounded-lg p-3 text-center hover:bg-neutral-50 cursor-pointer">
                      <div className="h-12 bg-white rounded mb-2 relative overflow-hidden">
                        <div className="h-2 bg-primary w-full"></div>
                        <div className="absolute top-2 left-2 w-2 h-8 bg-primary"></div>
                      </div>
                      <div className="flex justify-center items-center">
                        <span className="text-sm font-medium mr-1">Light</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className="border border-neutral-200 rounded-lg p-3 text-center hover:bg-neutral-50 cursor-pointer">
                      <div className="h-12 bg-neutral-900 rounded mb-2 relative overflow-hidden">
                        <div className="h-2 bg-primary w-full"></div>
                        <div className="absolute top-2 left-2 w-2 h-8 bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium">Dark</span>
                    </div>
                    <div className="border border-neutral-200 rounded-lg p-3 text-center hover:bg-neutral-50 cursor-pointer">
                      <div className="h-12 rounded mb-2 relative overflow-hidden" style={{ background: "linear-gradient(to right, white 50%, #1a1a1a 50%)" }}>
                        <div className="h-2 bg-primary w-full"></div>
                        <div className="absolute top-2 left-2 w-2 h-8 bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Accent Color</h3>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 rounded-full bg-[#9E1B32] border-2 border-white ring-2 ring-[#9E1B32] cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-blue-600 border-2 border-white cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-green-600 border-2 border-white cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-purple-600 border-2 border-white cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-orange-600 border-2 border-white cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-teal-600 border-2 border-white cursor-pointer"></div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="bg-primary text-white px-4 py-2 rounded text-sm font-medium">
                    Save Appearance
                  </button>
                </div>
              </div>
            </div>
            
            {/* Data and Privacy */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Data and Privacy</h2>
              <div className="space-y-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Download Your Data</h3>
                      <p className="text-neutral-600 text-sm">Get a copy of your personal data and learning progress</p>
                    </div>
                    <button className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 px-4 py-2 rounded text-sm font-medium transition duration-150">
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Privacy Settings</h3>
                      <p className="text-neutral-600 text-sm">Manage how your information is used</p>
                    </div>
                    <button className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 px-4 py-2 rounded text-sm font-medium transition duration-150">
                      Manage
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-red-600">Delete Account</h3>
                      <p className="text-neutral-600 text-sm">Permanently delete your account and all data</p>
                    </div>
                    <button className="bg-white border border-red-300 hover:bg-red-50 text-red-600 px-4 py-2 rounded text-sm font-medium transition duration-150">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
