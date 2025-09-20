"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Building2,
  Users,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import Link from "next/link";
import axiosIns from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userStore } from "@/zustand/store";
import { useRouter } from "next/navigation";

const citizenSignInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type CitizenSignInFormData = z.infer<typeof citizenSignInSchema>;

const CitizenSignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = userStore();

  const form = useForm<CitizenSignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(citizenSignInSchema),
  });

  const signInCitizen = async (userData: CitizenSignInFormData) => {
    const response = await axiosIns.post("/api/auth/signin", userData);
    return response.data;
  };

  const signInMutation = useMutation({
    mutationFn: signInCitizen,
    onSuccess: (data: any) => {
      console.log("Citizen login successful:", data);
      toast.success("Login successful! Welcome back.");
      setUser(data.user);
      router.push("/");
    },
    onError: (error: any) => {
      console.error("Citizen login failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: CitizenSignInFormData) => {
    // console.log(data);
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Citizen Login
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your complaints and municipal services
          </p>
          <Badge variant="secondary" className="mt-2">
            <Users className="w-4 h-4 mr-1" />
            Citizen Portal
          </Badge>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your email and password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={() => form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-10"
                              disabled={signInMutation.isPending}
                            />
                          </div>
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-12"
                              disabled={signInMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={signInMutation.isPending}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox className="border" />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-normal"
                      >
                        Remember me
                      </label>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 font-normal text-sm"
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full"
                    disabled={signInMutation.isPending}
                    size="lg"
                  >
                    {signInMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <Alert>
                    <AlertDescription className="text-sm">
                      Need help? Contact your local municipal office or call the
                      citizen helpline for assistance with login issues.
                    </AlertDescription>
                  </Alert>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-medium" asChild>
              <Link href="/sign-up">Register here</Link>
            </Button>
          </p>
        </div>

        <Card className="mt-4 border-dashed">
          <CardContent className="pt-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Demo Login
              </Badge>
              <div className="text-xs text-muted-foreground">
                <div>
                  <strong>Email:</strong> citizen@example.com
                </div>
                <div>
                  <strong>Password:</strong> citizen123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenSignInPage;
