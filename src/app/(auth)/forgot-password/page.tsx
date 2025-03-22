"use client"
import { useState, useEffect } from "react"
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false) // Start with loading state
    const [pageLoading, setPageLoading] = useState(true) // Start with loading state
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [resendTimer, setResendTimer] = useState(0)
    const [passwordReset, setPasswordReset] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [verificationError, setVerificationError] = useState("")

    // Check for email and OTP in URL parameters on component mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const emailParam = params.get('email')
        const otpParam = params.get('otp')
        
        if (emailParam && otpParam) {
            // setEmail(emailParam)
            // Convert OTP string to array format
            const otpArray = otpParam.split('').slice(0, 6)
            // Pad with empty strings if OTP is less than 6 digits
            while (otpArray.length < 6) {
                otpArray.push('')
            }
            // setOtp(otpArray)
            
            // Verify the OTP from URL parameters
            verifyOtpFromUrl(emailParam, otpParam)
        } else{
            setPageLoading(false)
        }
    }, [])

    // Timer for resend cooldown
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prevTimer => prevTimer - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [resendTimer])
    
    // Function to verify OTP from URL
    const verifyOtpFromUrl = async (emailParam: string, otpParam: string) => {
        try {
            // Call API to verify OTP
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailParam, otp: otpParam })
            })
            
            if (!response.ok) {
                throw new Error('Invalid or expired verification code')
            }
            
            // verification succeeded
            setPasswordReset(true)
            toast.success("Code Verified", {
                description: "Please create a new password"
            })
            setEmail(emailParam)
        } catch (err) {
            setVerificationError((err as Error).message || "Invalid or expired verification code")
            toast.error("Verification Failed", {
                description: (err as Error).message || "Invalid or expired verification code"
            })
        } finally {
            setLoading(false)
            setPageLoading(false)
        }
    }

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
            // For demo purposes, we're just showing the UI flow
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email,isSignup:false })
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
            if (newOtp.every(digit => digit !== "")) {
                setTimeout(() => {
                    handleVerifyWithCode(newOtp.join(''))
                }, 300) // Small delay for better UX
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

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Focus previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            if (prevInput) {
                prevInput.focus()
            }
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
            
            // Successfully verified
            toast.success("Code Verified", {
                description: "Please create a new password"
            })
            
            setPasswordReset(true)
        } catch (err) {
            toast.error("Verification Failed", {
                description: (err as Error).message || "Invalid verification code"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        if (e) e.preventDefault()
        const otpValue = otp.join('')
        handleVerifyWithCode(otpValue)
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        if (e) e.preventDefault()
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error("Invalid Password", {
                description: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            })
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords Don't Match", {
                description: "Please make sure your passwords match"
            })
            return
        }

        try {
            setLoading(true)
            
            // Call API to reset password
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    newPassword: password 
                })
            })
            
            const data = await response.json()
            
            if (!response.ok) throw new Error(data.message || "Failed to reset password")
            
            toast.success("Password Reset Successful", {
                description: "Your password has been reset successfully"
            })
            
            router.push('/login')
        } catch (err) {
            toast.error("Reset Failed", {
                description: (err as Error).message || "Failed to reset your password"
            })
        } finally {
            setLoading(false)
        }
    }

    const renderForm = () => {
        if (passwordReset) {
            return (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="block text-sm">
                            New Password
                        </Label>
                        <Input 
                            type="password" 
                            required 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            disabled={loading}
                        />
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                            <div className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {/[A-Z]/.test(password) ? <Check size={14} /> : <span className="w-3.5" />}
                                <span>Uppercase letter</span>
                            </div>
                            <div className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {/[a-z]/.test(password) ? <Check size={14} /> : <span className="w-3.5" />}
                                <span>Lowercase letter</span>
                            </div>
                            <div className={`flex items-center space-x-2 ${/[0-9]/.test(password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {/[0-9]/.test(password) ? <Check size={14} /> : <span className="w-3.5" />}
                                <span>Number</span>
                            </div>
                            <div className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {/[^A-Za-z0-9]/.test(password) ? <Check size={14} /> : <span className="w-3.5" />}
                                <span>Special character</span>
                            </div>
                            <div className={`flex items-center space-x-2 ${password.length >= 8 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {password.length >= 8 ? <Check size={14} /> : <span className="w-3.5" />}
                                <span>8+ characters</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="block text-sm">
                            Confirm Password
                        </Label>
                        <Input 
                            type="password" 
                            required 
                            id="confirmPassword" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                        {password && confirmPassword && (
                            <div className={`flex items-center space-x-2 mt-1 text-sm ${password === confirmPassword ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                                {password === confirmPassword ? <Check size={14} /> : <span className="w-3.5" />}
                                <span>{password === confirmPassword ? "Passwords match" : "Passwords don't match"}</span>
                            </div>
                        )}
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? <span className="animate-pulse text-sm">Please wait...</span> : "Reset Password"}
                    </Button>
                </form>
            )
        }

        if (otpSent) {
            return (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                                className="flex-1"
                                readOnly
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setOtpSent(false)}
                                disabled={loading}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

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

                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? <span className="animate-pulse text-sm">Please wait...</span> : "Verify Code"}
                    </Button>
                </form>
            )
        }

        return (
            <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="block text-sm">
                        Email
                    </Label>
                    <Input 
                        type="email" 
                        required 
                        name="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? <span className="animate-pulse text-sm">Sending otp...</span> : "Send Reset Code"}
                </Button>
            </form>
        )
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
                <div className="max-w-92 m-auto h-fit w-full">
                    <div className="p-6">
                        <div className='flex flex-col items-center'>
                            <Link href="/" aria-label="go home">
                                <Logo />
                            </Link>
                            <h1 className="mb-1 mt-4 text-xl font-semibold">
                                {passwordReset 
                                    ? "Create New Password" 
                                    : "Reset Your Password"}
                            </h1>
                            <p>
                                {verificationError ? (
                                    <span className="text-destructive">{verificationError}</span>
                                ) : (
                                    passwordReset
                                        ? "Please create a new secure password"
                                        : otpSent
                                            ? "Enter the verification code"
                                            : "Enter your email to receive a reset code"
                                )}
                            </p>
                        </div>

                        <div className="mt-6">
                            {renderForm()}
                        </div>
                    </div>

                    <p className="text-accent-foreground text-center text-sm">
                        Remember your password?
                        <Button asChild variant="link" className="px-2">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </p>
                </div>
            )}
        </section>
    )
}