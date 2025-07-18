import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Interface for server-side chat messages
interface ServerChatMessage {
  id: number;
  userId: number;
  content: string;
  isBot: boolean;
  timestamp: string;
}

// Interface for local chat messages (may have temporary IDs)
interface ChatMessage {
  id: number;
  content: string;
  isBot: boolean;
  timestamp: string;
}

const Chatbot = () => {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Custom fetch function for chat messages using apiRequest helper
  const fetchChatMessages = async (): Promise<ChatMessage[]> => {
    try {
      if (!localStorage.getItem('token')) {
        throw new Error("Authentication required");
      }
      
      const response = await apiRequest("GET", "/api/chat-messages");
      return response.json();
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem('token');
        localStorage.removeItem('acknowledged');
        setLocation("/auth");
        throw new Error("Session expired");
      }
      throw error;
    }
  };
  
  // Fetch chat messages
  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages"],
    queryFn: fetchChatMessages,
    enabled: isOpen,
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  // Only use server messages on initial load
  useEffect(() => {
    if (messages && messages.length > 0 && localMessages.length === 0) {
      console.log("Initial chat messages from server:", messages);
      setLocalMessages(messages);
    }
  }, [messages, localMessages.length]);
  
  // Send message and handle both user message and bot response
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessageText: string) => {
      if (!localStorage.getItem('token')) {
        throw new Error("Authentication required");
      }
      
      try {
        // Send the message to the server - API now returns both user message and bot response
        const response = await apiRequest("POST", "/api/chat", { message: userMessageText });
        return await response.json();
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem('token');
          localStorage.removeItem('acknowledged');
          setLocation("/auth");
          throw new Error("Session expired");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Chat API response:", data);
      
      // We already added the user message, so just add the bot response
      if (data.botResponse) {
        const botMsg = data.botResponse;
        
        // Add bot message to local state
        setLocalMessages(prev => [...prev, botMsg]);
      }
      
      // Invalidate query to keep background sync
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);
  
  // Create a typing indicator when waiting for bot response
  const renderTypingIndicator = () => {
    if (sendMessageMutation.isPending) {
      return (
        <div className="flex items-start mb-3">
          <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-white mr-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </div>
          <div className="bg-neutral-200 rounded-lg p-3 max-w-[85%]">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      // Show user message immediately in UI
      const userMessageText = message.trim(); // Cache the message text
      const tempUserMessage: ChatMessage = {
        id: Date.now(),
        content: userMessageText,
        isBot: false,
        timestamp: new Date().toISOString()
      };
      
      // Add to local state first for immediate feedback
      setLocalMessages(prevMessages => [...prevMessages, tempUserMessage]);
      
      // Clear input field immediately for better UX
      setMessage("");
      
      // Then send to server
      sendMessageMutation.mutate(userMessageText);
    }
  };
  
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-80 mb-4">
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
              <h3 className="font-semibold">HumanLike-AwareBot</h3>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0 hover:bg-primary-light rounded"
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-80 p-3 bg-neutral-50">
            {isLoading && localMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : localMessages.length > 0 ? (
              <>
                {localMessages.map((msg) => (
                  <div key={msg.id} className="mb-3">
                    {msg.isBot ? (
                      <div className="flex items-start">
                        <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-white mr-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                          </svg>
                        </div>
                        <div className="bg-neutral-200 rounded-lg p-2 max-w-[85%]">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white rounded-lg p-2 max-w-[85%]">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Show typing indicator while the bot is generating a response */}
                {renderTypingIndicator()}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center px-4">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-neutral-400">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                  </svg>
                  <p className="text-neutral-600 text-sm">
                    Hello! I'm your Social Engineering Awareness assistant. How can I help you today?
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="border-t border-neutral-200 p-3">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <Input
                type="text"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 py-2 px-3 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button 
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="bg-primary hover:bg-primary-dark text-white py-2 px-3 rounded-r-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </Button>
            </form>
            <div className="text-xs text-neutral-500 mt-1">
              Powered by Groq LLM - Llama 3 8B
            </div>
          </div>
        </div>
      )}
      
      {/* Chatbot Toggle Button */}
      <Button
        onClick={toggleChatbot}
        className="bg-primary hover:bg-primary-dark text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="22"></line>
        </svg>
      </Button>
    </div>
  );
};

export default Chatbot;
