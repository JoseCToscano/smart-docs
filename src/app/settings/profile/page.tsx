"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardBody,
  CardActions 
} from "@progress/kendo-react-layout";
import { 
  Form, 
  Field, 
  FormElement,
  FormRenderProps 
} from "@progress/kendo-react-form";
import { 
  Input, 
  Button,
  Avatar
} from "@/components/kendo/free";
import PremiumCheck from "@/components/PremiumCheck";
import { Session } from "next-auth";
import { UserProfile } from "@/components/UserProfile";
import Link from "next/link";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isPremium?: boolean;
  }
}

interface ProfileFormModel {
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  language: string;
}

interface PromptCount {
  total: number;
  remaining: number;
  limit: number;
  isPremium: boolean;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession() as { 
    data: ExtendedSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
    update: (data?: any) => Promise<ExtendedSession | null>;
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptCount, setPromptCount] = useState<PromptCount | null>(null);

  // Fetch prompt count
  const fetchPromptCount = async () => {
    try {
      const response = await fetch('/api/prompts/count');
      if (!response.ok) throw new Error('Failed to fetch prompt count');
      const data = await response.json();
      setPromptCount(data);
    } catch (error) {
      console.error('Error fetching prompt count:', error);
    }
  };

  useEffect(() => {
    fetchPromptCount();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (values: { [name: string]: any }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = session?.user?.image || undefined;

      // Upload new avatar if one was selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const data: ProfileFormModel = {
        name: values.name,
        email: values.email,
        avatar: avatarUrl,
        timezone: values.timezone,
        language: values.language
      };

      // Update profile in the backend
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          avatar: data.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      
      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...result.user,
        }
      });

      setSuccess("Profile updated successfully!");
      setAvatarFile(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/documents" 
                className="text-gray-600 hover:text-gray-900 flex items-center transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Documents
              </Link>
              <div className="h-4 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {promptCount && !promptCount.isPremium && (
                <Button
                  onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ?prefilled_email=" + session?.user?.email}
                  themeColor="primary"
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  Upgrade to Premium
                </Button>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Personal Information */}
          <div className="md:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-sm">
                {success}
              </div>
            )}

            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Personal Information</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Form
                  initialValues={{
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                    timezone: "UTC",
                    language: "English"
                  }}
                  onSubmit={handleSubmit}
                  render={(formRenderProps: FormRenderProps) => (
                    <FormElement>
                      <div className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
                          <Avatar
                            type="image"
                            size="large"
                            className="w-20 h-20 border-4 border-white shadow-lg"
                          >
                            <img 
                              src={session?.user?.image || "/default-avatar.png"} 
                              alt={session?.user?.name || "User avatar"}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </Avatar>
                          <div>
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                              />
                              <div className="space-y-2">
                                <Button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full md:w-auto"
                                  themeColor="primary"
                                  fillMode="outline"
                                >
                                  Change Avatar
                                </Button>
                                {avatarPreview && (
                                  <Button
                                    onClick={() => {
                                      setAvatarPreview(null);
                                      setAvatarFile(null);
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                      }
                                    }}
                                    themeColor="error"
                                    fillMode="outline"
                                    className="w-full md:w-auto mt-2 md:mt-0 md:ml-2"
                                  >
                                    Remove
                                  </Button>
                                )}
                                <p className="text-sm text-gray-500">
                                  Recommended: Square image, at least 400x400 pixels
                                </p>
                              </div>
                            </>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="col-span-2">
                            <Field
                              id="name"
                              name="name"
                              label="Name"
                              component={Input}
                              validator={(value) => !value ? "Name is required" : ""}
                              className="w-full"
                            />
                          </div>
                          <Field
                            id="email"
                            name="email"
                            label="Email"
                            component={Input}
                            disabled
                            className="w-full"
                          />
                          <Field
                            id="timezone"
                            name="timezone"
                            label="Timezone"
                            component={Input}
                            disabled
                            className="w-full"
                          />
                          <Field
                            id="language"
                            name="language"
                            label="Language"
                            component={Input}
                            disabled
                            className="w-full"
                          />
                        </div>
                      </div>

                      <CardActions className="mt-8 flex justify-end">
                        <Button
                          themeColor="primary"
                          disabled={!formRenderProps.allowSubmit || isLoading}
                          type="submit"
                          className="px-6"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardActions>
                    </FormElement>
                  )}
                />
              </CardBody>
            </Card>
          </div>

          {/* Right column - AI Assistant Usage */}
          <div className="space-y-6">
            {promptCount && !promptCount.isPremium && (
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>AI Assistant Usage</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className={`text-sm ${
                        promptCount.remaining <= 3 ? 'text-red-600' : 
                        promptCount.remaining <= 5 ? 'text-orange-600' : 
                        'text-gray-600'
                      }`}>
                        {promptCount.remaining > 0 ? (
                          <>
                            <span className="font-medium">{promptCount.remaining}</span> of{' '}
                            <span className="font-medium">{promptCount.limit}</span> free prompts remaining
                          </>
                        ) : (
                          <span className="font-medium">You have reached your limit of free prompts</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Why Premium? 🤔</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        We love providing AI assistance, but running advanced AI models is quite resource-intensive. 
                        Your premium subscription helps us:
                      </p>
                      <ul className="text-sm text-blue-800 space-y-3">
                        <li className="flex items-start transform hover:translate-x-1 transition-transform duration-200">
                          <span className="mr-2">🚀</span>
                          <span>Maintain fast, reliable AI responses</span>
                        </li>
                        <li className="flex items-start transform hover:translate-x-1 transition-transform duration-200">
                          <span className="mr-2">🧠</span>
                          <span>Use the most advanced AI models available</span>
                        </li>
                        <li className="flex items-start transform hover:translate-x-1 transition-transform duration-200">
                          <span className="mr-2">💡</span>
                          <span>Keep developing new smart features</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <p className="text-sm text-gray-600 text-center">
                        Join our premium community and unlock unlimited AI assistance!
                      </p>
                      <Button
                        onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ?prefilled_email=" + session?.user?.email}
                        themeColor="primary"
                        className="w-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 