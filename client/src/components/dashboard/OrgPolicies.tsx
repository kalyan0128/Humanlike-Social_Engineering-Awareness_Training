import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrgPoliciesProps {
  policies?: {
    id: number;
    title: string;
    description: string;
    category: string;
  }[];
}

const OrgPolicies = ({ policies }: OrgPoliciesProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Organization Policies</h2>
          <a href="#policies" className="text-primary hover:text-primary-dark text-sm font-semibold">View All</a>
        </div>
        
        <div className="space-y-3">
          {policies && policies.length > 0 ? (
            policies.map((policy) => (
              <div 
                key={policy.id}
                className="border border-neutral-200 rounded p-3 hover:bg-neutral-50 transition duration-150 cursor-pointer"
              >
                <h3 className="font-medium text-neutral-800">{policy.title}</h3>
                <p className="text-sm text-neutral-600">{policy.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-neutral-600">No policies available</p>
            </div>
          )}
          
          {policies && policies.length > 0 && (
            <Button 
              variant="link"
              className="w-full py-2 text-center text-primary hover:text-primary-dark font-semibold text-sm"
            >
              Show More
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrgPolicies;
