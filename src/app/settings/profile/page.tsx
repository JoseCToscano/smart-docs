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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            {promptCount && !promptCount.isPremium && (
              <Button
                onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ"}
                themeColor="primary"
                size="small"
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Prompt Count Card for non-premium users */}
        {promptCount && !promptCount.isPremium && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Assistant Usage</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
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
                  <p className="text-sm text-gray-500 mt-2">
                    Upgrade to Premium for unlimited AI assistant usage and additional features
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ"}
                  themeColor="primary"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
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
                    <div className="flex items-center space-x-4">
                      <Avatar
                        type="image"
                        size="large"
                      >
                        <img 
                          src={session?.user?.image || "/default-avatar.png"} 
                          alt={session?.user?.name || "User avatar"}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </Avatar>
                      <div>
                        {session?.user?.isPremium ? (
                          <>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              className="mb-2"
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
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            )}
                            <p className="text-sm text-gray-500">
                              Recommended: Square image, at least 400x400 pixels
                            </p>
                          </>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Upgrade to Premium to customize your avatar
                            </p>
                            <Button
                              onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ"}
                              themeColor="primary"
                              size="small"
                            >
                              Upgrade to Premium
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name Field */}
                    <Field
                      id="name"
                      name="name"
                      label="Name"
                      component={Input}
                      validator={(value) => !value ? "Name is required" : ""}
                    />

                    {/* Email Field */}
                    <Field
                      id="email"
                      name="email"
                      label="Email"
                      component={Input}
                      disabled
                    />

                    {/* Timezone Field */}
                    <Field
                      id="timezone"
                      name="timezone"
                      label="Timezone"
                      component={Input}
                      disabled
                    />

                    {/* Language Field */}
                    <Field
                      id="language"
                      name="language"
                      label="Language"
                      component={Input}
                      disabled
                    />
                  </div>

                  <CardActions className="mt-8">
                    <Button
                      themeColor="primary"
                      disabled={!formRenderProps.allowSubmit || isLoading}
                      type="submit"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardActions>
                </FormElement>
              )}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  );
} 