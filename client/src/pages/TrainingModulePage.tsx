import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useParams } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrainingModule } from "@shared/schema";
import { ArrowLeft, Book, Award, CheckCircle, HelpCircle, AlertCircle, Check, X } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Interface for quiz questions and answers
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct answer in options array
}

// Parse quiz content from markdown format
const parseQuizContent = (content: string): QuizQuestion[] => {
  try {
    // Simple parser for quiz format in markdown
    const questions: QuizQuestion[] = [];
    const sections = content.split('## Question');
    
    // Skip the first section if it's an introduction
    const startIndex = sections[0].trim().startsWith('# Quiz') ? 1 : 0;
    
    for (let i = startIndex; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Parse question
      const questionMatch = section.match(/^\s*(\d+):\s*(.+?)\s*\n/);
      if (!questionMatch) continue;
      
      const questionId = parseInt(questionMatch[1]);
      const questionText = questionMatch[2].trim();
      
      // Parse options and correct answer
      const options: string[] = [];
      let correctAnswer = -1;
      
      const optionsText = section.split('\n').slice(1);
      
      for (let j = 0; j < optionsText.length; j++) {
        const optionLine = optionsText[j].trim();
        // Look for options in format: - Option text (This line will end with `(correct)` for the correct answer)
        if (optionLine.startsWith('- ')) {
          const isCorrect = optionLine.endsWith('(correct)');
          const optionText = isCorrect 
            ? optionLine.substring(2, optionLine.length - 9).trim()
            : optionLine.substring(2).trim();
          
          options.push(optionText);
          
          if (isCorrect) {
            correctAnswer = options.length - 1;
          }
        }
      }
      
      if (options.length > 0 && correctAnswer >= 0) {
        questions.push({
          id: questionId,
          question: questionText,
          options,
          correctAnswer
        });
      }
    }
    
    return questions;
  } catch (error) {
    console.error("Error parsing quiz content:", error);
    return [];
  }
};

interface QuizSectionProps {
  module: TrainingModule;
  onComplete: (score: number) => void;
}

const QuizSection = ({ module, onComplete }: QuizSectionProps) => {
  const questions = parseQuizContent(module.content || "");
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number[]>([]);
  
  const handleAnswerChange = (questionIndex: number, value: string) => {
    if (isSubmitted) return; // Don't allow changes after submission
    
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: parseInt(value)
    }));
  };
  
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check if all questions have been answered
    const allAnswered = questions.every((_, index) => userAnswers[index] !== undefined);
    
    if (!allAnswered) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitted(true);
    
    // Calculate score
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correctAnswer) {
        correctCount++;
      }
    }
    
    const score = Math.round((correctCount / questions.length) * 100);
    
    if (score >= 70) {
      toast({
        title: "Quiz Passed!",
        description: `You scored ${score}% (${correctCount}/${questions.length} correct)`,
        variant: "default",
      });
      
      // Call onComplete with the score
      setTimeout(() => onComplete(score), 1500);
    } else {
      toast({
        title: "Quiz Failed",
        description: `You scored ${score}% (${correctCount}/${questions.length} correct). You need 70% to pass.`,
        variant: "destructive",
      });
    }
  };
  
  const toggleExplanation = (questionIndex: number) => {
    setShowExplanation(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(idx => idx !== questionIndex)
        : [...prev, questionIndex]
    );
  };
  
  if (questions.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <h3 className="font-medium text-amber-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Quiz Content Error
        </h3>
        <p className="text-amber-700 text-sm">
          Could not parse quiz content properly. Please contact an administrator.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quiz</h2>
      <p className="text-neutral-600 mb-6">
        Answer all questions to complete this training module. You need 70% to pass.
      </p>
      
      <div className="space-y-8">
        {questions.map((question, qIndex) => {
          const userAnswer = userAnswers[qIndex];
          const isCorrect = isSubmitted && userAnswer === question.correctAnswer;
          const isWrong = isSubmitted && userAnswer !== undefined && !isCorrect;
          
          return (
            <div 
              key={question.id} 
              className={`border rounded-lg p-5 ${
                isSubmitted 
                  ? isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : 'border-neutral-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg mb-3">{question.question}</h3>
                {isSubmitted && (
                  <div className="ml-2 flex-shrink-0">
                    {isCorrect ? (
                      <div className="text-green-600 bg-green-100 rounded-full p-1">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="text-red-600 bg-red-100 rounded-full p-1">
                        <X className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <RadioGroup 
                value={userAnswer !== undefined ? userAnswer.toString() : undefined}
                onValueChange={(value) => handleAnswerChange(qIndex, value)}
                className="space-y-3"
                disabled={isSubmitted}
              >
                {question.options.map((option, aIndex) => {
                  const isOptionCorrect = aIndex === question.correctAnswer;
                  const isUserSelection = aIndex === userAnswer;
                  
                  return (
                    <div key={aIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        id={`q${qIndex}-a${aIndex}`}
                        value={aIndex.toString()}
                        className={
                          isSubmitted 
                            ? isOptionCorrect
                              ? "text-green-600 border-green-600"
                              : isUserSelection
                                ? "text-red-600 border-red-600"
                                : ""
                            : ""
                        }
                      />
                      <Label 
                        htmlFor={`q${qIndex}-a${aIndex}`}
                        className={
                          isSubmitted 
                            ? isOptionCorrect
                              ? "text-green-600 font-medium"
                              : isUserSelection
                                ? "text-red-600"
                                : ""
                            : ""
                        }
                      >
                        {option}
                        {isSubmitted && isOptionCorrect && (
                          <span className="ml-2 text-green-600 text-sm">
                            (Correct Answer)
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              
              {isWrong && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleExplanation(qIndex)}
                    className="flex items-center text-sm text-neutral-600"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {showExplanation.includes(qIndex) ? "Hide Explanation" : "Show Explanation"}
                  </Button>
                  
                  {showExplanation.includes(qIndex) && (
                    <div className="mt-2 text-sm p-3 bg-neutral-100 rounded-md text-neutral-700">
                      <p className="font-medium">Explanation:</p>
                      <p>
                        The correct answer is "{question.options[question.correctAnswer]}".
                        {question.options[userAnswer] && (
                          <>
                            <br />Your answer "{question.options[userAnswer]}" was incorrect.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!isSubmitted ? (
        <Button 
          onClick={handleSubmit}
          className="mt-6 bg-primary text-white px-6 py-3 rounded-md"
        >
          Submit Quiz
        </Button>
      ) : (
        <div className="mt-6 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="px-6 py-3 rounded-md"
          >
            Retry Quiz
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="px-6 py-3 rounded-md"
          >
            Review Content
          </Button>
        </div>
      )}
    </div>
  );
};

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
          
          {/* Quiz section if module type is quiz */}
          {module.type === 'quiz' && (
            <div className="mt-8 pt-8 border-t">
              <QuizSection module={module} onComplete={(score) => {
                // Update user progress via API
                const updateProgress = async () => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error("Authentication required");
                    
                    await fetch('/api/user-progress', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        moduleId: module.id,
                        completed: true,
                        score: score
                      })
                    });
                    
                    toast({
                      title: "Quiz Completed!",
                      description: `You've earned ${module.xpReward} XP for completing this quiz.`,
                      variant: "default",
                    });
                    
                    // Navigate back to dashboard after slight delay
                    setTimeout(() => {
                      window.localStorage.setItem('dashboardActiveSection', 'progress');
                      setLocation('/dashboard');
                    }, 1500);
                  } catch (error) {
                    console.error("Failed to update progress", error);
                    toast({
                      title: "Error",
                      description: "Failed to update your progress. Please try again.",
                      variant: "destructive",
                    });
                  }
                };
                
                updateProgress();
              }}/>
            </div>
          )}
          
          {/* Mark as complete button (for non-quiz modules) */}
          {module.type !== 'quiz' && (
            <div className="mt-12 border-t pt-6">
              <button 
                onClick={() => {
                  // Update user progress via API
                  const updateProgress = async () => {
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) throw new Error("Authentication required");
                      
                      await fetch('/api/user-progress', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          moduleId: module.id,
                          completed: true,
                          score: null
                        })
                      });
                      
                      toast({
                        title: "Module Completed!",
                        description: `You've earned ${module.xpReward} XP for completing this module.`,
                        variant: "default",
                      });
                      
                      // Navigate back to dashboard after slight delay
                      setTimeout(() => {
                        window.localStorage.setItem('dashboardActiveSection', 'progress');
                        setLocation('/dashboard');
                      }, 1500);
                    } catch (error) {
                      console.error("Failed to update progress", error);
                      toast({
                        title: "Error",
                        description: "Failed to update your progress. Please try again.",
                        variant: "destructive",
                      });
                    }
                  };
                  
                  updateProgress();
                }}
                className="bg-primary text-white px-6 py-3 rounded-md flex items-center justify-center w-full md:w-auto"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Mark as Complete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}