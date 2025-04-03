import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import gannonLogo from "@assets/gu logo.jpg";

interface AuthPageProps {
  initialView?: "login" | "signup";
}

const AuthPage = ({ initialView = "login" }: AuthPageProps) => {
  const [currentView, setCurrentView] = useState<"login" | "signup">(initialView);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-primary p-4 text-white text-center">
          <img src={gannonLogo} alt="Gannon University Logo" className="h-16 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">HumanLike-AwareBot</h1>
          <p className="text-sm">A Social Engineering Awareness Training Platform</p>
        </div>
        
        {currentView === "login" ? (
          <LoginForm />
        ) : (
          <SignupForm />
        )}
      </div>
      
      <div className="mt-8 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Gannon University. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthPage;
