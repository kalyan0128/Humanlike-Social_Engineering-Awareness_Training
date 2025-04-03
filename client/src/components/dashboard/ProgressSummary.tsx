import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgressSummaryProps {
  progress?: {
    completedModules: number;
    totalModules: number;
    progressPercentage: number;
    currentLevel: string;
    xpPoints: number;
    xpToNextLevel: number;
    xpProgress: number;
  };
  recommendedModules?: {
    id: number;
    title: string;
    description: string;
  }[];
  achievements?: {
    id: number;
    title: string;
    description: string;
    icon: string;
  }[];
}

const ProgressSummary = ({ progress, recommendedModules, achievements }: ProgressSummaryProps) => {
  if (!progress) {
    return (
      <Card className="bg-white rounded-lg shadow-sm mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Your Training Progress</h2>
          <div className="h-40 flex items-center justify-center">
            <p className="text-neutral-600">Loading progress data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Your Training Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Overall Progress */}
          <div className="bg-neutral-100 rounded-lg p-4 flex items-center">
            <div className="mr-4 relative">
              <svg className="transform -rotate-90 w-16 h-16" viewBox="0 0 36 36">
                <path 
                  className="ring" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E9ECEF"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path 
                  className="progress" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#9E1B32"
                  strokeWidth="3"
                  strokeDasharray={`${progress.progressPercentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                {progress.progressPercentage}%
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">Overall Progress</h3>
              <p className="text-sm text-neutral-600">
                {progress.completedModules} of {progress.totalModules} modules completed
              </p>
            </div>
          </div>
          
          {/* Current Level */}
          <div className="bg-neutral-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-neutral-800">Current Level</h3>
              <span className="bg-secondary text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                {progress.currentLevel}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-secondary h-2.5 rounded-full" 
                style={{ width: `${progress.xpProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-neutral-600">
              {progress.xpPoints} / {progress.xpPoints + progress.xpToNextLevel} XP to Next Level
            </p>
          </div>
          
          {/* Recent Achievements */}
          <div className="bg-neutral-100 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-800 mb-2">Recent Achievements</h3>
            <div className="flex space-x-2">
              {achievements && achievements.length > 0 ? (
                achievements.slice(0, 3).map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="bg-primary-light text-white rounded-full h-10 w-10 flex items-center justify-center" 
                    title={achievement.title}
                  >
                    <AchievementIcon name={achievement.icon} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-600">Complete modules to earn achievements!</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Next Recommended Modules */}
        <div>
          <h3 className="font-semibold mb-2">Next Recommended Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendedModules && recommendedModules.length > 0 ? (
              recommendedModules.map((module) => (
                <div 
                  key={module.id}
                  className="border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 cursor-pointer transition duration-150 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-neutral-600">{module.description}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-4">
                <p className="text-neutral-600">No more modules to complete!</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface AchievementIconProps {
  name: string;
}

const AchievementIcon = ({ name }: AchievementIconProps) => {
  const icons: Record<string, JSX.Element> = {
    fishing: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9v.01"></path>
        <path d="M7 9a5 5 0 0 0 5 5"></path>
        <path d="M13 17.5V22"></path>
        <path d="M13 14.5V12"></path>
        <path d="M21.29 9.5a19 19 0 0 0-8.34-7"></path>
        <path d="M21.29 9.5a19 19 0 0 1-8.34 7"></path>
      </svg>
    ),
    quiz: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    speed: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
        <polyline points="13 11 9 17 15 17 11 23"></polyline>
      </svg>
    ),
  };

  return icons[name] || <span>{name}</span>;
};

export default ProgressSummary;
