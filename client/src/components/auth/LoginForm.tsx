import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, loginAsGuest } from "@/lib/auth"; // Direct import instead of context
import { toast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await loginUser(data.email, data.password);
      toast({
        title: "Success",
        description: "You have successfully logged in.",
      });
      // Redirect to acknowledgement page after successful login
      setLocation("/acknowledgement");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = async () => {
    setIsLoading(true);
    
    try {
      await loginAsGuest();
      toast({
        title: "Welcome, Guest!",
        description: "You have successfully logged in as a guest.",
      });
      // Redirect to acknowledgement page after successful login
      setLocation("/acknowledgement");
    } catch (error) {
      toast({
        title: "Guest login failed",
        description: error instanceof Error ? error.message : "Unable to login as guest",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-neutral-800 mb-6 text-center">Log in to your account</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 text-sm font-semibold">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    {...field} 
                    type="email" 
                    className="py-2 px-3 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 text-sm font-semibold">
                  Password
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your password" 
                    {...field} 
                    type="password" 
                    className="py-2 px-3 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      className="text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-neutral-700 cursor-pointer">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
            
            <a 
              href="#"
              className="inline-block align-baseline text-sm text-primary hover:text-primary-dark"
            >
              Forgot Password?
            </a>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full border-primary text-primary hover:bg-primary/10 font-semibold py-2"
        >
          {isLoading ? "Logging in..." : "Continue as Guest"}
        </Button>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-neutral-600">
          Don't have an account? 
          <Link 
            href="/signup"
            className="text-primary hover:text-primary-dark font-semibold ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
