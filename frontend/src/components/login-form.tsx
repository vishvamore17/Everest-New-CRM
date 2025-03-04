"use client";

import React, { useState, useEffect } from "react"; // Import useEffect
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { IoLogoGoogle, IoEye, IoEyeOff  } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface User {
  _id?: string;
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [isLogin, setIsLogin] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLogin") === "true";
    }
    return true; 
  });
  const [showVerification, setShowVerification] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("showVerification") === "true";
    }
    return false;
  });  
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isForgotPassword, setIsForgotPassword] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isForgotPassword") === "true";
    }
    return false;
  });  
  const router = useRouter();
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<string>("");

  // Retrieve states from localStorage on component mount
  useEffect(() => {
    // const savedIsLogin = localStorage.getItem("isLogin");
    // const savedIsForgotPassword = localStorage.getItem("isForgotPassword");
    // const savedShowVerification = localStorage.getItem("showVerification");

    // if (savedIsLogin !== null) {
    //   setIsLogin(savedIsLogin === "true");
    // }
    // if (savedIsForgotPassword !== null) {
    //   setIsForgotPassword(savedIsForgotPassword === "true");
    // }
    // if (savedShowVerification !== null) {
    //   setShowVerification(savedShowVerification === "true");
    // }
    setIsLoading(false); // Once states are set, remove loading
  }, []);
  if (isLoading) return null; // Prevent render until states are restored

  // // Save states to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem("isLogin", isLogin.toString());
  // }, [isLogin]);

  // useEffect(() => {
  //   localStorage.setItem("isForgotPassword", isForgotPassword.toString());
  // }, [isForgotPassword]);

  // useEffect(() => {
  //   localStorage.setItem("showVerification", showVerification.toString());
  // }, [showVerification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    if (id === "password") {
      validatePassword(value);
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setPasswordMessage("Password must be at least 8 characters long.");
    } else if (!/[A-Z]/.test(password)) {
      setPasswordMessage("Password must contain at least one uppercase letter.");
    } else if (!/[a-z]/.test(password)) {
      setPasswordMessage("Password must contain at least one lowercase letter.");
    } else if (!/[0-9]/.test(password)) {
      setPasswordMessage("Password must contain at least one number.");
    } else if (!/[\W]/.test(password)) {
      setPasswordMessage("Password must contain at least one special character.");
    } else {
      setPasswordMessage("");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/user/forgot-password",
        { email }
      );

      if (response.data.success) {
        setEmailSent(true); // Show confirmation message
      } else {
        toast({
          title: "Invoice Submitted",
          description: `Your invoice has been successfully submitted. ID: ${data.id}`,
        });      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error submitting the invoice.",
        variant: "destructive",
      });    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if passwords match during registration
    if (formData.password !== formData.confirmPassword && !isLogin) {
        toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    try {
        const endpoint = isLogin
            ? "http://localhost:8000/api/v1/user/login"
            : "http://localhost:8000/api/v1/user/register";

        const response = await axios.post(endpoint, formData);

        if (response.data.success) {
            if (!isLogin) {
                setShowVerification(true);
                toast({
                    title: "Verification Required",
                    description: "A verification code has been sent to your email.",
                });
            } else {
                const { token, userId } = response.data;
                if (token && userId) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("userId", userId);
                    router.push("/Dashboard");

                    toast({
                        title: "Success",
                        description: "Logged in successfully!",
                    });
                }
            }

            // Reset form fields
            setFormData({
                email: "",
                password: "",
                name: "",
                confirmPassword: "",
                verificationCode: "",
            });
        } else {
            toast({
                title: "Error",
                description: response.data.message || "Operation failed",
                variant: "destructive",
            });
        }
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to process request",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
};

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google"; // Backend Google auth route
  };
 

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const response = await axios.post('http://localhost:8000/api/v1/user/verify-email', {
            verificationCode, // Send only the code
        });

        if (response.data.success) {
            toast({
                title: "Email Verified",
                description: "Your email has been verified successfully.",
            });
            setIsLogin(true); // Switch to login after successful verification
            setShowVerification(false); // Hide the verification form
        } else {
            toast({
                title: "Error",
                description: response.data.message || "Verification failed!",
                variant: "destructive",
            });
        }
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.response?.data?.message || "Verification failed!",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-8 md:p-8 shadow-input bg-white dark:bg-black">
      {/* // <div className="max-w-md w-full mx-auto my-12 rounded-none md:rounded-2xl p-8 md:p-8 shadow-input bg-white dark:bg-black"> */}
        {isForgotPassword ? (
          emailSent ? (
            // Show email sent confirmation
            <div className="text-center">
              <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                Check your email
              </h2>
              <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
                An email has been sent to your email address to reset your password.
              </p>
              <p
                className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mt-4"
                onClick={() => {
                  setIsForgotPassword(false);
                  setEmailSent(false);
                }}
              >
                Back to Login
              </p>
            </div>
          ) : (
            // Show Forgot Password form
            <>
              <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                Forgot Password
              </h2>
              <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
                Enter your email address, and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleForgotPasswordSubmit} className="my-8">
                <div className="mb-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-lg"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send a reset password email"}
                </button>
              </form>
              <p
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to Login
              </p>
            </>
          )
        ) : (
          <>
            {showVerification ? (
              <div>
              <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                Verify Your Email
              </h2>
              <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
                A verification code has been sent to your email address to verify your email.
              </p>

              <form className="my-8" onSubmit={handleVerification}>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter the code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </LabelInputContainer>

                <button
                  className="bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </button>
              </form>
              <p
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                onClick={() => {
                  setShowVerification(false); // Hide verification form
                  setIsLogin(false); // Switch to Sign Up form
                }}
              >
                Back to Sign Up
              </p>
            </div>
            ) : (
              <>
                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                  {isLogin ? "Sign In" : "Sign Up"}
                </h2>
                <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
                  {isLogin
                    ? "Please login to access your account."
                    : "Register to create a new account."}
                </p>
                <form onSubmit={handleSubmit} className="my-8">
                  {!isLogin && (
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter Your Name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </LabelInputContainer>
                  )}
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      placeholder="example@gmail.com"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </LabelInputContainer>
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="Enter Your Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <IoEye size={18} /> : <IoEyeOff size={18} />}
                      </button>
                    </div>
                    {passwordMessage && (
                      <p className="text-sm text-red-500 mt-1">{passwordMessage}</p>
                    )}
                  </LabelInputContainer>
                  {!isLogin && (
                    <LabelInputContainer className="mb-8">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          placeholder="Confirm Your Password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-700"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                        </button>
                      </div>
                    </LabelInputContainer>
                  )}
                  {isLogin && (
                    <div className="flex justify-end mb-8">
                      <p
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        onClick={() => setIsForgotPassword(true)}
                      >
                        Forgot Password?
                      </p>
                    </div>
                  )}
                  <button
                    className="bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-lg mb-8"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? isLogin
                        ? "Logging in..."
                        : "Signing up..."
                      : isLogin
                      ? "Sign In"
                      : "Sign Up"}
                  </button>

                  <button onClick={handleGoogleLogin} 
                    className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                    type="submit"
                  >
                    <IoLogoGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                      Google
                    </span>
                  </button>
                  <div className="pt-4 text-center">
                    <p className="text-gray-600 text-sm dark:text-gray-400">
                      {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}{" "}
                      <span
                        className="text-blue-600 font-medium hover:underline cursor-pointer dark:text-blue-400"
                        onClick={() => setIsLogin(!isLogin)}
                      >
                        {isLogin ? "Sign up here" : "Login here"}
                      </span>
                    </p>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};