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
import { useNotifications } from "@/utils/notificationService";

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
}

interface PromptCount {
  total: number;
  remaining: number;
  limit: number;
  isPremium: boolean;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession() as { 
    data: ExtendedSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
    update: (data?: any) => Promise<ExtendedSession | null>;
  };
  const notifications = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (data: { [name: string]: any }) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await updateSession();
      
      notifications.success("Your profile has been updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      notifications.error("Failed to update your profile. Please try again.");
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/documents" 
                className="text-gray-600 hover:text-gray-900 flex items-center"
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Prompt Count Card for non-premium users */}
        {promptCount && !promptCount.isPremium && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Assistant Usage</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
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
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Why Premium? 🤔</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    We love providing AI assistance, but running advanced AI models is quite resource-intensive. 
                    Your premium subscription helps us:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">🚀</span>
                      <span>Maintain fast, reliable AI responses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🧠</span>
                      <span>Use the most advanced AI models available</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">💡</span>
                      <span>Keep developing new smart features</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-600">
                    Join our premium community and unlock unlimited AI assistance!
                  </p>
                  <Button
                    onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ?prefilled_email=" + session?.user?.email}
                    themeColor="primary"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
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
              }}
              onSubmit={handleSubmit}
              render={(formRenderProps: FormRenderProps) => (
                <FormElement>
                  <div className="space-y-6">
                    {/* Avatar Display Only */}
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