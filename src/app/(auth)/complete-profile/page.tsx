"use client";
import { useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Camera, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

// Define interest options
const interestOptions = [
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "business", label: "Business" },
  { value: "arts", label: "Arts & Culture" },
  { value: "health", label: "Health & Wellness" },
  { value: "education", label: "Education" },
  { value: "travel", label: "Travel" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "food", label: "Food & Cooking" },
  { value: "music", label: "Music" },
  { value: "literature", label: "Literature" },
  { value: "gaming", label: "Gaming" },
];

// Define language options
const languageOptions = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "mandarin", label: "Mandarin" },
  { value: "japanese", label: "Japanese" },
  { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" },
  { value: "portuguese", label: "Portuguese" },
  { value: "russian", label: "Russian" },
];
// Define form validation schema
const profileSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  age: z.number().min(13, "You must be at least 13 years old").max(120, "Please enter a valid age").or(z.nan().transform(() => undefined)).optional(),
  language: z.string().min(1, "Please select your preferred language"),
  location: z.string().min(2, "Please enter your location"),
  interests: z.array(z.string()).min(1, "Please select at least one area of interest"),
  currentWork: z.string().optional(),
  avatar_url: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const CompleteProfile = () => {
  const { user,updateUserData, fetchUser } = useUserStore();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File>();
  const supabase = createClient();

  // Initialize form with validation
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      avatar_url: "",
      age: undefined,
      language: "",
      location: "",
      interests: [],
      currentWork: "",
    },
    mode: "onChange", // Enable validation on change for better UX
  });

  // Set avatar URL from form value
  useEffect(() => {
    const formAvatarUrl = form.getValues('avatar_url');
    if (formAvatarUrl) {
      setProfileImage(formAvatarUrl);
    }
  }, [form]);

  // Handle image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImage(result);
      form.setValue('avatar_url', result, { shouldValidate: true });
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const validateCurrentStep = useCallback(async () => {
    if (activeStep === 0) {
      return await form.trigger(['password', 'confirmPassword']);
    } 
    if (activeStep === 1) {
      return await form.trigger(['firstName', 'lastName', 'age']);
    } 
    if (activeStep === 2) {
      return await form.trigger(['location', 'language']);
    } 
    if (activeStep === 3) {
      return await form.trigger(['interests']);
    }
    return true;
  }, [activeStep, form]);
  
  // Navigate between form steps
  const nextStep = useCallback(async () => {
    // Validate current step before proceeding
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    if (activeStep < 3) {
      setActiveStep(prev => prev + 1);
      carouselApi?.scrollNext();
    }
  }, [activeStep, carouselApi, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      carouselApi?.scrollPrev();
    }
  }, [activeStep, carouselApi]);
  
  // Effect to sync carousel with activeStep state
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setActiveStep(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    // Clean up
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const uploadToSupabaseStorage = async (
    file: File,
  ): Promise<string | null> => {

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`images/${user?.email}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.log("Failed to upload image:", error.message);
      return null;
    }

    const { data: avatar } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);
    return avatar.publicUrl;
  };

  
  // Handle form submission
  const onSubmit = (async (values: z.infer<typeof profileSchema>) => {
    if (!user) {
      toast.error("User session not found. Please try logging in again.");
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate all form fields one final time
      const isValid = await form.trigger();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      
      if(imageFile) {
        const imageUrl = await uploadToSupabaseStorage(imageFile)
        if (imageUrl) {
          values.avatar_url = imageUrl;
        }else{
          toast.error("Failed to upload image. Please try again.");
          return;
        }
      }
      console.log("Form values:", values);


      const userUpdateData = {
        data: {
          firstname: values.firstName,
          lastname: values.lastName,
          image: values.avatar_url,
          isLoggedin: true,
          profileCompletedAt: new Date().toISOString()
        },
        password: values.password
      };


      await updateUserData(userUpdateData);
      
      // Force a refresh of user data
      await fetchUser();
      
      toast.success("Profile completed successfully!");
      
      // Use window.location instead of router to force a full page reload
      setTimeout(() => {
        window.location.href = '/documents';
      }, 500);
      
    } catch (error) {
      // console.error('Error completing profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  });

  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      return newInterests;
    });
  }, []);

  useEffect(() => {
    form.setValue('interests', selectedInterests, { shouldValidate: true });
  }, [selectedInterests, form]);

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background/80 px-4 py-8 dark:bg-transparent">
        <div className="w-full max-w-3xl">
          <Card className="border shadow-lg" aria-label="Complete Profile Form">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
              <CardDescription>
                Just a few more steps to set up your account
              </CardDescription>
              {/* Progress indicator */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {[0, 1, 2, 3].map((step) => (
                    <div 
                      key={step}
                      className={`h-2 w-12 rounded-full ${
                        step === activeStep ? 'bg-primary' : 
                        step < activeStep ? 'bg-primary/60' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      aria-label={`Step ${step + 1} ${step === activeStep ? '(current)' : step < activeStep ? '(completed)' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Carousel
                    className="w-full"
                    setApi={setCarouselApi}
                    opts={{
                      align: 'start',
                      loop: false,
                      dragFree: false,
                      watchDrag: false
                    }}
                  >
                    <CarouselContent>
                      {/* Step 1: Security */}
                      <CarouselItem className="basis-full">
                        <div className="space-y-4 p-1">
                          <h3 className="text-lg font-semibold" id="security-settings">Security Settings</h3>
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <FormControl>
                                  <Input
                                    id="password"
                                    type="password" 
                                    placeholder="Create a strong password" 
                                    {...field} 
                                    aria-labelledby="security-settings"
                                  />
                                </FormControl>
                                <FormMessage />
                                
                                {/* Password requirements */}
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                                  <div className={`flex items-center space-x-2 ${/[A-Z]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                    {/[A-Z]/.test(field.value) ? <Check size={14} /> : <span className="w-3.5" />}
                                    <span>Uppercase letter</span>
                                  </div>
                                  <div className={`flex items-center space-x-2 ${/[a-z]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                    {/[a-z]/.test(field.value) ? <Check size={14} /> : <span className="w-3.5" />}
                                    <span>Lowercase letter</span>
                                  </div>
                                  <div className={`flex items-center space-x-2 ${/[0-9]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                    {/[0-9]/.test(field.value) ? <Check size={14} /> : <span className="w-3.5" />}
                                    <span>Number</span>
                                  </div>
                                  <div className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                    {/[^A-Za-z0-9]/.test(field.value) ? <Check size={14} /> : <span className="w-3.5" />}
                                    <span>Special character</span>
                                  </div>
                                  <div className={`flex items-center space-x-2 ${field.value.length >= 8 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                    {field.value.length >= 8 ? <Check size={14} /> : <span className="w-3.5" />}
                                    <span>8+ characters</span>
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="confirmPassword"
                                    type="password" 
                                    placeholder="Confirm your password" 
                                    {...field} 
                                    aria-labelledby="security-settings"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CarouselItem>
                      
                      {/* Step 2: Personal Info */}
                      <CarouselItem className="basis-full">
                        <div className="space-y-4 p-1">
                          <h3 className="text-lg font-semibold" id="personal-info">Personal Information</h3>
                          
                          {/* Profile Picture Upload */}
                          <div className="flex flex-col items-center space-y-4 mb-6">
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20">
                              {profileImage || user?.user_metadata?.avatar_url ? (
                                <Avatar className='h-24 w-24'>
                                <AvatarImage 
                                  src={profileImage || user?.user_metadata?.avatar_url} 
                                  alt="Profile preview" 
                                  className="object-cover"
                                />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="profileImage" className="cursor-pointer">
                                <div className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md text-sm font-medium transition-colors">
                                  Upload Photo
                                </div>
                                <input 
                                  id="profileImage" 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleImageChange}
                                  aria-labelledby="personal-info"
                                />
                              </Label>
                            </div>
                          </div>
                          <div className='flex gap-3 justify-between'>
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem className='w-full h-full'>
                                <FormLabel htmlFor="firstName">First Name</FormLabel>
                                <FormControl>
                                  <Input
                                    id="firstName"
                                    placeholder="Enter your first name" 
                                    {...field} 
                                    aria-labelledby="personal-info"
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
                              <FormItem className='w-full h-full'>
                                <FormLabel htmlFor="lastName">Last Name</FormLabel>
                                <FormControl>
                                  <Input
                                    id="lastName"
                                    placeholder="Enter your last name" 
                                    {...field} 
                                    aria-labelledby="personal-info"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                              <FormItem className='w-full h-full'>
                                <FormLabel htmlFor="age">Age</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="age"
                                    type="number" 
                                    placeholder="Enter your age" 
                                    value={value || ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                                      onChange(val);
                                    }}
                                    {...fieldProps}
                                    aria-labelledby="personal-info"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          </div>
                        </div>
                      </CarouselItem>
                      
                      {/* Step 3: Location & Language */}
                      <CarouselItem className="basis-full">
                        <div className="space-y-4 p-1">
                          <h3 className="text-lg font-semibold" id="location-language">Location & Language</h3>
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="location">Location</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="location"
                                    placeholder="City, Country" 
                                    {...field} 
                                    aria-labelledby="location-language"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter your city or region
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="language">Preferred Language</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  aria-labelledby="location-language"
                                >
                                  <FormControl>
                                    <SelectTrigger id="language">
                                      <SelectValue placeholder="Select a language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {languageOptions.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CarouselItem>
                      
                      {/* Step 4: Interests */}
                      <CarouselItem className="basis-full">
                        <div className="space-y-4 p-1">
                          <h3 className="text-lg font-semibold" id="interests-work">Interests & Work</h3>
                          {/* Interests selection */}

                          <FormField
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                              <FormItem key={field.name}>
                                <FormLabel>Areas of Interest</FormLabel>
                                <FormDescription>
                                  Select topics you&apos;re interested in (select at least one)
                                </FormDescription>
                                
                                <fieldset className="mt-2">
                                  <legend className="sr-only">Select your areas of interest</legend>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {interestOptions.map(option => (
                                      <label 
                                        key={option.value}
                                        className={`
                                          p-2 rounded-md border cursor-pointer transition-colors flex items-center
                                          ${selectedInterests.includes(option.value)
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'border-input hover:bg-muted/50'
                                          }
                                        `}
                                      >
                                        <input
                                          type="checkbox"
                                          className="sr-only"
                                          checked={selectedInterests.includes(option.value)}
                                          onChange={() => toggleInterest(option.value)}
                                          aria-label={option.label}
                                        />
                                        <span className="ml-2">{option.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </fieldset>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Current Work */}
                          <FormField
                            control={form.control}
                            name="currentWork"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="currentWork">Currently Working On (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="currentWork"
                                    placeholder="Share what you're currently focused on" 
                                    {...field} 
                                    aria-labelledby="interests-work"
                                  />
                                </FormControl>
                                <FormDescription>
                                  This could be a project, research area, or professional role
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          

                        </div>
                      </CarouselItem>
                    </CarouselContent>
                  </Carousel>
                  
                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={activeStep === 0 || isSubmitting}
                      aria-label="Back"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    {activeStep < 3 ? (
                      <Button 
                        type="button"
                        onClick={nextStep}
                        disabled={isSubmitting}
                        aria-label="Next"
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="min-w-[100px]"
                        aria-label="Complete"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Complete'
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // This is a fallback while checking authentication
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 px-4 py-8 md:py-16 dark:bg-transparent">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Checking profile status...</h2>
      </div>
    </div>
  );
}

export default CompleteProfile;