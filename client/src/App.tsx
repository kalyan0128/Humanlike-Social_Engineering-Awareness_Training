import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/ui/footer";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AcknowledgementPage from "./pages/AcknowledgementPage";
import DashboardPage from "./pages/DashboardPage";
import TrainingModulePage from "./pages/TrainingModulePage";
import ScenarioPage from "./pages/ScenarioPage";
import PolicyPage from "./pages/PolicyPage";
import NotFound from "@/pages/not-found";

// A very simplified app that doesn't use any auth context directly
function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Switch>
          <Route path="/" component={LoginPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/acknowledgement" component={AcknowledgementPage} />
          
          {/* Detail pages for training modules, scenarios, and policies */}
          <Route path="/training/:id" component={TrainingModulePage} />
          <Route path="/scenarios/:id" component={ScenarioPage} />
          <Route path="/policies/:id" component={PolicyPage} />
          
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Global Footer */}
      <Footer />
      
      <Toaster />
    </div>
  );
}

export default App;
