import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useParams } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OrganizationPolicy } from "@shared/schema";
import { ArrowLeft, FileText, Bookmark, Info } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface PolicyPageParams {
  id: string;
}

// Function to fetch policy data
async function fetchPolicy(id: string): Promise<OrganizationPolicy> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await fetch(`/api/organization-policies/${id}`, {
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
    console.error("Policy fetch error:", error);
    throw error;
  }
}

export default function PolicyPage() {
  const params = useParams<PolicyPageParams>();
  const [_, setLocation] = useLocation();
  const policyId = params.id;

  // Fetch policy data
  const { data: policy, isLoading, error } = useQuery<OrganizationPolicy>({
    queryKey: [`/api/organization-policies/${policyId}`],
    queryFn: () => fetchPolicy(policyId)
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
        description: "Failed to load policy. Please try again later.",
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

  // If policy is not found
  if (!policy) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard" className="flex items-center text-neutral-600 hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Policy Not Found</h1>
            <p className="text-neutral-600 mb-6">The policy you're looking for doesn't exist or has been removed.</p>
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
          <div className="flex items-start mb-6">
            <div className="p-3 rounded-md mr-4 flex-shrink-0 text-primary bg-primary/5">
              {policy.category === 'data-security' && (
                <FileText className="h-6 w-6" />
              )}
              {policy.category === 'communication' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              )}
              {policy.category === 'incident-response' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              )}
              {policy.category === 'usage-policy' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              )}
              {(policy.category !== 'data-security' && 
                policy.category !== 'communication' && 
                policy.category !== 'incident-response' && 
                policy.category !== 'usage-policy') && (
                <FileText className="h-6 w-6" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-800">{policy.title}</h1>
              <p className="text-neutral-600 mt-1">{policy.description}</p>
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full capitalize">
                  {policy.category.split('-').join(' ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800">Policy Importance</h3>
              <p className="text-sm text-blue-700">
                This policy is essential for maintaining security standards and preventing social engineering attacks. All team members are expected to follow these guidelines.
              </p>
            </div>
          </div>
          
          <div className="prose prose-neutral max-w-none">
            <ReactMarkdown>
              {policy.content || "Content not available for this policy."}
            </ReactMarkdown>
          </div>
          
          <div className="mt-12 pt-6 border-t">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error("Authentication required");
                    
                    // Record acknowledgment in user progress
                    await fetch('/api/acknowledge-policy', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        policyId: policy.id,
                        acknowledged: true
                      })
                    });
                    
                    toast({
                      title: "Policy Acknowledged",
                      description: "Thank you for reviewing this organization policy.",
                      variant: "default",
                    });
                    
                    // Navigate back to dashboard after short delay
                    setTimeout(() => {
                      window.localStorage.setItem('dashboardActiveSection', 'progress');
                      setLocation('/dashboard');
                    }, 1500);
                  } catch (error) {
                    console.error("Failed to acknowledge policy:", error);
                    toast({
                      title: "Error",
                      description: "Failed to record your acknowledgment. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-md flex items-center justify-center"
              >
                <Bookmark className="h-5 w-5 mr-2" />
                <span>Acknowledge Policy</span>
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