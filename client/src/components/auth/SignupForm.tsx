import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupUser } from "@/lib/auth"; // Direct import instead of context
import { toast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      await signupUser({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      
      toast({
        title: "Account created",
        description: "You have successfully created an account.",
      });
      // Redirect to acknowledgement page after successful signup
      setLocation("/acknowledgement");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-neutral-800 mb-6 text-center">Create your account</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 text-sm font-semibold">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="First name" 
                      {...field} 
                      className="py-2 px-3 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 text-sm font-semibold">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Last name" 
                      {...field} 
                      className="py-2 px-3 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 text-sm font-semibold">
                  Username
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Choose a username" 
                    {...field} 
                    className="py-2 px-3 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                    placeholder="Create a password" 
                    {...field} 
                    type="password" 
                    className="py-2 px-3 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 text-sm font-semibold">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Confirm your password" 
                    {...field} 
                    type="password" 
                    className="py-2 px-3 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-neutral-600">
          Already have an account? 
          <Link 
            href="/login"
            className="text-primary hover:text-primary-dark font-semibold ml-1"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
