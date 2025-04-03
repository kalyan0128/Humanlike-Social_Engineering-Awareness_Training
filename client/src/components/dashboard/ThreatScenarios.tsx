import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ThreatScenariosProps {
  threats?: {
    id: number;
    title: string;
    description: string;
    isNew: boolean;
    isTrending: boolean;
  }[];
  className?: string;
}

const ThreatScenarios = ({ threats, className = "" }: ThreatScenariosProps) => {
  return (
    <Card className={`bg-white rounded-lg shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Latest Threat Scenarios</h2>
          <a href="#scenarios" className="text-primary hover:text-primary-dark text-sm font-semibold">View All</a>
        </div>
        
        <div className="space-y-4">
          {threats && threats.length > 0 ? (
            threats.map((threat) => (
              <div 
                key={threat.id}
                className={`border-l-4 ${
                  threat.isNew 
                    ? "border-warning" 
                    : "border-danger"
                } bg-neutral-50 p-3 rounded-r-md`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-neutral-800">{threat.title}</h3>
                  {threat.isNew && (
                    <span className="bg-warning text-neutral-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      NEW
                    </span>
                  )}
                  {threat.isTrending && (
                    <span className="bg-neutral-200 text-neutral-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      TRENDING
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-700 mb-2">
                  {threat.description}
                </p>
                <Button
                  variant="link"
                  className="text-sm text-primary hover:text-primary-dark font-semibold p-0 h-auto flex items-center space-x-1"
                >
                  <span>Practice Scenario</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600">No threat scenarios available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatScenarios;
