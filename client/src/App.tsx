import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AcknowledgementPage from "./pages/AcknowledgementPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "@/pages/not-found";

// A very simplified app that doesn't use any auth context directly
function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/acknowledgement" component={AcknowledgementPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
