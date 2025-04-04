import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useParams } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ThreatScenario } from "@shared/schema";
import { ArrowLeft, ExternalLink, AlertTriangle, Shield } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ScenarioPageParams {
  id: string;
}

// Function to fetch scenario data
async function fetchScenario(id: string): Promise<ThreatScenario> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await fetch(`/api/threat-scenarios/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('acknowledged');
        throw new Error("401: Session expired");
      }
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Scenario fetch error:", error);
    throw error;
  }
}

export default function ScenarioPage() {
  const params = useParams<ScenarioPageParams>();
  const [_, setLocation] = useLocation();
  const scenarioId = params.id;

  // Fetch scenario data with optimized query configuration
  const { data: scenario, isLoading, error } = useQuery<ThreatScenario>({
    queryKey: ['/api/threat-scenarios', scenarioId], // Use array format for better cache invalidation
    queryFn: () => fetchScenario(scenarioId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0 // Override the default to ensure fresh data
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("acknowledged");
        setLocation("/login");
      }
      
      toast({
        title: "Error",
        description: "Failed to load scenario. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, setLocation]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If scenario is not found
  if (!scenario) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard" className="flex items-center text-neutral-600 hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Threat Scenario Not Found</h1>
            <p className="text-neutral-600 mb-6">The threat scenario you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => setLocation('/dashboard')}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="flex items-center text-neutral-600 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-neutral-800">{scenario.title}</h1>
                {scenario.isNew && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    New
                  </span>
                )}
                {scenario.isTrending && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Trending
                  </span>
                )}
              </div>
              <p className="text-neutral-600 mt-1">{scenario.description}</p>
            </div>
            
            <div className="ml-4">
              <span className={`px-2 py-1 rounded text-xs ${
                scenario.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                scenario.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Why This Matters</h3>
              <p className="text-sm text-amber-700">
                Understanding this threat scenario is important for recognizing and responding to social engineering attacks in real-world situations.
              </p>
            </div>
          </div>
          
          <div className="prose prose-neutral max-w-none">
            <ReactMarkdown>
              {scenario.content || "Content not available for this scenario."}
            </ReactMarkdown>
          </div>
          
          <div className="mt-12 pt-6 border-t">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <button 
                onClick={() => {
                  toast({
                    title: "Resource Noted",
                    description: "This scenario has been saved to your learning resources.",
                    variant: "default",
                  });
                }}
                className="border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-md flex items-center justify-center"
              >
                <Shield className="h-5 w-5 mr-2" />
                <span>Save to Resources</span>
              </button>
              
              <button 
                onClick={() => setLocation('/dashboard')}
                className="bg-primary text-white px-4 py-2 rounded-md flex items-center justify-center"
              >
                <span>Return to Dashboard</span>
                <ArrowLeft className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}