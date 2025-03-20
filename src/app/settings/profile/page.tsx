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

interface ProfileFormModel {
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  language: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
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
                          src={avatarPreview || session?.user?.image || "/default-avatar.png"} 
                          alt={session?.user?.name || "User avatar"}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </Avatar>
                      <div>
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