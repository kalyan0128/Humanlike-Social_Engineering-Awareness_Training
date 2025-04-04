import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useParams } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrainingModule } from "@shared/schema";
import { ArrowLeft, Book, Award, CheckCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface TrainingModulePageParams {
  id: string;
}

// Function to fetch training module data
async function fetchTrainingModule(id: string): Promise<TrainingModule> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await fetch(`/api/training-modules/${id}`, {
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
    console.error("Training module fetch error:", error);
    throw error;
  }
}

export default function TrainingModulePage() {
  const params = useParams<TrainingModulePageParams>();
  const [_, setLocation] = useLocation();
  const moduleId = params.id;

  // Fetch training module data
  const { data: module, isLoading, error } = useQuery<TrainingModule>({
    queryKey: [`/api/training-modules/${moduleId}`],
    queryFn: () => fetchTrainingModule(moduleId)
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
        description: "Failed to load training module. Please try again later.",
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

  // If module is not found
  if (!module) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard" className="flex items-center text-neutral-600 hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Training Module Not Found</h1>
            <p className="text-neutral-600 mb-6">The training module you're looking for doesn't exist or has been removed.</p>
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
            <h1 className="text-2xl font-bold text-neutral-800">{module.title}</h1>
            
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded text-xs ${
                module.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                module.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
              </span>
              
              <div className="flex items-center text-neutral-600">
                <Award className="h-4 w-4 mr-1 text-primary" />
                <span>{module.xpReward} XP</span>
              </div>
            </div>
          </div>
          
          <div className="prose prose-neutral max-w-none">
            <ReactMarkdown>
              {module.content || "Content not available for this training module."}
            </ReactMarkdown>
          </div>
          
          <div className="mt-12 border-t pt-6">
            <button 
              onClick={() => {
                toast({
                  title: "Module Completed!",
                  description: `You've earned ${module.xpReward} XP for completing this module.`,
                  variant: "default",
                });
                setTimeout(() => setLocation('/dashboard'), 1500);
              }}
              className="bg-primary text-white px-6 py-3 rounded-md flex items-center justify-center w-full md:w-auto"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Mark as Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}