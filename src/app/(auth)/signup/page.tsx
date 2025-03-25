"use client"
import { useState, useEffect, useCallback } from "react"
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [resendTimer, setResendTimer] = useState(0)
    const [pageLoading, setPageLoading] = useState(true)

    // Wrap handleVerifyFromUrl in useCallback to prevent unnecessary re-renders
    const handleVerifyFromUrl = useCallback(async (emailParam: string, otpValue: string) => {
        if (otpValue.length !== 6) {
            toast.error("Invalid Code", {
                description: "Please enter the complete 6-digit code"
            })
            setPageLoading(false)
            return
        }

        try {
            setLoading(true)
            
            // Call API to verify OTP
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailParam, otp: otpValue })
            })
            
            if (!response.ok) throw new Error('Invalid verification code')

                const newPassword = "Lesearch@123";
                const supabase = createClient();
                // Update the user's password using Supabase Auth
                const { error: createError } = await supabase.auth.signUp({
                  email: emailParam,
                  password: newPassword,
                })

                if (createError) {
                  console.error("Error during user creation:", createError.message);
                  setPageLoading(false)
                  return NextResponse.json(
                    { message: "Error creating user" },
                    { status: 500 },
                  );
                }
                
            // Successfully verified
            toast.success("Code Verified", {
                description: "You will be redirected to the complete profile page"
            })
            
            // Redirect to complete profile page
            setTimeout(() => {
                router.push('/complete-profile')
            }, 1000)
            
        } catch (err) {
            toast.error("Verification Failed", {
                description: (err as Error).message || "Invalid verification code"
            })
            setPageLoading(false)
        } finally {
            setLoading(false)
        }
    }, [router]); // Add router as a dependency

    // Check for email and OTP in URL parameters on component mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const emailParam = params.get('email')
        const otpParam = params.get('otp')
        
        if (emailParam && otpParam) {
            // Convert OTP string to array format
            const otpArray = otpParam.split('').slice(0, 6)
            // Pad with empty strings if OTP is less than 6 digits
            while (otpArray.length < 6) {
                otpArray.push('')
                }
                // setOtp(otpArray)
                
                // Verify the OTP from URL parameters
                handleVerifyFromUrl(emailParam, otpParam)
            } else{
                setPageLoading(false)
            }
        }, [handleVerifyFromUrl])
    
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prevTimer => prevTimer - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [resendTimer])

    const handleGoogleSignup = async () => {
        try {
            setGoogleLoading(true);
            await signIn("google", { callbackUrl: "/documents", redirect: true });
        } catch (error: unknown) {
            let errorMessage = "Failed to sign in with Google";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage); 
        } finally {
            setTimeout(() => {
                setGoogleLoading(false);
            }, 5000);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        if (e) e.preventDefault()
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            toast.error("Invalid Email", {
                description: "Please enter a valid email address"
            })
            return
        }

        try {
            setLoading(true)
            
            // Call your forgot password API endpoint
            // This would typically verify the email exists and send an OTP
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email,isSignup:true })
            })

            const data = await response.json()
            
            if (!response.ok) throw new Error(data.message || "Failed to send reset code")
            
            setOtpSent(true)
            setResendTimer(60) // 60 seconds cooldown
            toast.success("Reset Code Sent", {
                description: `We've sent a password reset code to ${email}`
            })
        } catch (err) {
            toast.error("Failed to Send Code", {
                description: (err as Error).message || "An error occurred while sending reset code"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        // Only allow one character
        const newValue = value.slice(0, 1)
        if (newValue.length > 1) {
            return
        }
        
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) {
            return
        }

        // Create a new OTP array with the updated value
        const newOtp = [...otp]
        newOtp[index] = value
        
        // Update state
        setOtp(newOtp)

        // Auto-focus next input if current input is filled
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            if (nextInput) {
                nextInput.focus()
            }
        }
        
        // Auto verify when all digits are entered
        if (value && index === 5) {
            // Use the newly created array which has the latest value
            // instead of the state which might not be updated yet
            if (newOtp.every(digit => digit !== "")) {
                // All digits entered, trigger verification with the complete code
                setTimeout(() => {
                    // Pass the complete OTP code directly to avoid state timing issues
                    handleVerifyWithCode(newOtp.join(''))
                }, 300) // Small delay for better UX
            }
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Focus previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

        // Add this useEffect to focus on first OTP input when OTP screen is shown
useEffect(() => {
    if (otpSent) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0')
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    }
  }, [otpSent])
  
  // Add this function to handle paste events on OTP inputs
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      // Split the pasted data into individual digits and update OTP state
      const pastedOtp = pastedData.split('').slice(0, 6)
      setOtp(pastedOtp)
      
      // Auto-verify after a short delay
      setTimeout(() => {
        handleVerifyWithCode(pastedData)
      }, 300)
    }
  }

  const handleVerifyWithCode = async (otpValue: string) => {
    if (otpValue.length !== 6) {
        toast.error("Invalid Code", {
            description: "Please enter the complete 6-digit code"
        })
        return
    }

    try {
        setLoading(true)
        
        // Call API to verify OTP
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpValue })
        })
        
        if (!response.ok) throw new Error('Invalid verification code')

            const newPassword = "Lesearch@123";
            const supabase = createClient();
            // Update the user's password using Supabase Auth
            const { error: createError } = await supabase.auth.signUp({
              email,
              password: newPassword,
            })

            if (createError) {
              console.error("Error during user creation:", createError.message);
              return NextResponse.json(
                { message: "Error creating user" },
                { status: 500 },
              );
            }
            
        // Successfully verified
        toast.success("Code Verified", {
            description: "You will be redirected to the complete profile page"
        })
        
        // Redirect to complete profile page
        setTimeout(() => {
            router.push('/complete-profile')
        }, 1000)
        
    } catch (err) {
        toast.error("Verification Failed", {
            description: (err as Error).message || "Invalid verification code"
        })
    } finally {
        setLoading(false)
    }
}

    // Original handler for form submission
    const handleVerifyOtp = async (e: React.FormEvent) => {
        if (e) e.preventDefault()
        const otpValue = otp.join('')
        handleVerifyWithCode(otpValue)
    }

    return (
        <section className="flex min-h-screen bg-background/80 px-4 py-8 md:py-16 dark:bg-transparent">
        {pageLoading ? (
                <div className="max-w-92 m-auto flex h-fit w-full flex-col items-center justify-center">
                    <div className="animate-pulse text-center">
                        <p className="text-lg">Verifying your request...</p>
                    </div>
                </div>
            ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="max-w-92 m-auto h-fit w-full">
                <div className="p-6">
                    <div className='flex flex-col items-center'>
                        <Link href="/" aria-label="go home">
                            <Logo />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Create a LeSearch Account</h1>
                        <p>Welcome! Create an account to get started</p>
                    </div>
                    {!otpSent && <>
                    <div className="mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full" 
                            aria-label='Sign up with Google'
                            onClick={handleGoogleSignup}
                            disabled={googleLoading || loading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262" role='img'>
                                <title>Google Logo</title>
                                <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"/>
                                <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"/>
                                <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"/>
                                <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"/>
                            </svg>
                            <span className="ml-2">Google</span>
                        </Button>
                    </div>

                    <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <hr className="border-dashed" />
                        <span className="text-muted-foreground text-xs">Or continue With</span>
                        <hr className="border-dashed" />
                    </div>
                  </>}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm">
                                Email
                            </Label>
                            <div className="flex gap-2">
                                <Input 
                                    type="email" 
                                    required 
                                    name="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading || otpSent}
                                    className={otpSent ? "flex-1" : "w-full"}
                                />
                                {otpSent && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOtpSent(false)}
                                        disabled={loading}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>

                        {otpSent && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        We&apos;ve sent a verification code to <span className="font-medium">{email}</span>
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="otp-0" className="block text-sm">
                                        Verification Code
                                    </Label>
                                    <div className="flex justify-between gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <Input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={otp[index]}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={index === 0 ? handlePaste : undefined}
                                                className="h-12 w-12 text-center text-lg"
                                                autoComplete="one-time-code"
                                                disabled={loading}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        disabled={resendTimer > 0 || loading}
                                        onClick={(e) => handleSendOtp(e)}
                                        className="text-xs"
                                    >
                                        {resendTimer > 0 
                                            ? `Resend code in ${resendTimer}s` 
                                            : "Resend code"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loading || googleLoading}
                        >
                            {loading 
                                ? <span className="text-sm animate-pulse">{otpSent ? "Verifying! Please wait..." : "Sending otp! Please wait..."}</span>
                                : otpSent 
                                    ? "Verify Code" 
                                    : "Continue"}
                        </Button>
                    </div>
                </div>

                <p className="text-accent-foreground text-center text-sm">
                    Have an account?
                    <Button asChild variant="link" className="px-2">
                        <Link href="/login">Sign In</Link>
                    </Button>
                </p>
            </form>
            )}
        </section>
    )
}