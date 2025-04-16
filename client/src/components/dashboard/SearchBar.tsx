import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
  id: number;
  title: string;
  type: "module" | "scenario" | "policy";
  description?: string;
}

const SearchBar = () => {
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Search function
  const search = async (term: string): Promise<SearchResult[]> => {
    if (!term.trim()) return [];
    
    try {
      // 1. Search training modules
      const moduleResponse = await apiRequest("GET", `/api/search?type=module&q=${encodeURIComponent(term)}`);
      const moduleData = await moduleResponse.json();
      const moduleResults: SearchResult[] = moduleData.map((module: any) => ({
        id: module.id,
        title: module.title,
        type: "module" as const,
        description: module.description
      }));

      // 2. Search threat scenarios  
      const scenarioResponse = await apiRequest("GET", `/api/search?type=scenario&q=${encodeURIComponent(term)}`);
      const scenarioData = await scenarioResponse.json();
      const scenarioResults: SearchResult[] = scenarioData.map((scenario: any) => ({
        id: scenario.id,
        title: scenario.title,
        type: "scenario" as const,
        description: scenario.description
      }));

      // 3. Search policies
      const policyResponse = await apiRequest("GET", `/api/search?type=policy&q=${encodeURIComponent(term)}`);
      const policyData = await policyResponse.json();
      const policyResults: SearchResult[] = policyData.map((policy: any) => ({
        id: policy.id,
        title: policy.title,
        type: "policy" as const,
        description: policy.description
      }));

      // Combine and return results
      return [...moduleResults, ...scenarioResults, ...policyResults];
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  // Perform search when typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm) {
        setIsSearching(true);
        try {
          // For now, mock the search by matching against common titles
          const mockResults: SearchResult[] = [];
          
          // Mock module search
          if ("social engineering".includes(searchTerm.toLowerCase()) || 
              "phishing".includes(searchTerm.toLowerCase())) {
            mockResults.push({
              id: 1,
              title: "Social Engineering Fundamentals",
              type: "module",
              description: "Learn the basics of social engineering attacks and defense strategies"
            });
          }
          
          // Mock scenario search
          if ("phishing".includes(searchTerm.toLowerCase())) {
            mockResults.push({
              id: 1,
              title: "Spear Phishing Attack Simulation",
              type: "scenario",
              description: "Experience a simulated targeted phishing attack"
            });
          }
          
          // Mock policy search
          if ("password".includes(searchTerm.toLowerCase()) || 
              "policy".includes(searchTerm.toLowerCase())) {
            mockResults.push({
              id: 2,
              title: "Password Policy",
              type: "policy",
              description: "Organization guidelines for creating and managing secure passwords"
            });
          }
          
          setResults(mockResults);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "module":
        setLocation(`/training/${result.id}`);
        break;
      case "scenario":
        setLocation(`/scenarios/${result.id}`);
        break;
      case "policy":
        setLocation(`/policies/${result.id}`);
        break;
    }
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search modules, scenarios, policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 border-neutral-300 focus:border-primary"
            onFocus={() => {
              if (searchTerm && results.length > 0) {
                setShowResults(true);
              }
            }}
            onBlur={() => {
              // Delayed hide to allow clicking results
              setTimeout(() => setShowResults(false), 200);
            }}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-t-2 border-primary rounded-full"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All</DropdownMenuItem>
            <DropdownMenuItem>Training Modules</DropdownMenuItem>
            <DropdownMenuItem>Threat Scenarios</DropdownMenuItem>
            <DropdownMenuItem>Policies</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute w-full z-10 bg-white mt-1 py-2 rounded-md shadow-lg border border-neutral-200 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="px-4 py-2 hover:bg-neutral-100 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center">
                {result.type === "module" && (
                  <span className="p-1 bg-blue-100 text-blue-800 rounded-md text-xs mr-2">Module</span>
                )}
                {result.type === "scenario" && (
                  <span className="p-1 bg-amber-100 text-amber-800 rounded-md text-xs mr-2">Scenario</span>
                )}
                {result.type === "policy" && (
                  <span className="p-1 bg-green-100 text-green-800 rounded-md text-xs mr-2">Policy</span>
                )}
                <div>
                  <div className="font-medium">{result.title}</div>
                  {result.description && (
                    <div className="text-sm text-neutral-600 truncate">{result.description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;