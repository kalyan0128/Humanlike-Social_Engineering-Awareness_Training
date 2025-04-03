import { useState } from "react";
import { setAcknowledgedStatus } from "@/lib/auth"; // Direct import from lib/auth
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import gannonLogo from "@assets/gu logo.jpg";

const AcknowledgementPage = () => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [_, setLocation] = useLocation();

  const handleAcknowledge = () => {
    if (acknowledged) {
      setAcknowledgedStatus(true);
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-white">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center my-8">
          <img src={gannonLogo} alt="Gannon University Logo" className="h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">HumanLike-AwareBot</h1>
          <p className="text-xl text-neutral-700">A Social Engineering Awareness Training Platform</p>
        </div>
        
        <div className="bg-neutral-100 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">Project Acknowledgement</h2>
          
          <p className="text-neutral-700 mb-4">
            Welcome to the HumanLike-AwareBot platform! This project aims to increase employee awareness about social engineering threats and organizational policies through a gamified chatbot experience. By completing the training modules, you will learn to identify and mitigate various social engineering attacks that target human behavior vulnerabilities.
          </p>
          
          <p className="text-neutral-700 mb-6">
            Before you proceed, please take a moment to familiarize yourself with the platform's features and acknowledge your participation in this training program.
          </p>
          
          <div className="border-t border-b border-neutral-300 py-4 mb-6">
            <h3 className="text-xl font-semibold mb-4">Project Team</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-primary">Team Members</h4>
                <ul className="list-disc pl-5 mt-2">
                  <li>Kalyankumar Konda</li>
                  <li>Baji Narra</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-primary">Project Adviser</h4>
                <p className="mt-2">Samuel Tweneboah-Koduah, Ph.D.</p>
                <p className="text-sm text-neutral-600">Assistant Professor, Computer Science</p>
                <p className="text-sm text-neutral-600">Gannon University</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 text-white mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Interactive Chatbot</h4>
                  <p className="text-sm text-neutral-700">AI-powered chatbot to answer your questions and guide your training</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 text-white mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Threat Scenarios</h4>
                  <p className="text-sm text-neutral-700">Real-world social engineering threat simulations</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 text-white mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Gamified Training</h4>
                  <p className="text-sm text-neutral-700">Earn points and badges as you complete training modules</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 text-white mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Progress Tracking</h4>
                  <p className="text-sm text-neutral-700">Monitor your learning journey and training completion</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <Checkbox
              id="acknowledge-checkbox"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
              className="h-5 w-5 text-primary focus:ring-primary"
            />
            <label className="ml-2 block text-neutral-700" htmlFor="acknowledge-checkbox">
              I acknowledge that I will participate in this social engineering awareness training program and follow the guidelines provided.
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAcknowledge}
              disabled={!acknowledged}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6"
            >
              Proceed to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgementPage;
