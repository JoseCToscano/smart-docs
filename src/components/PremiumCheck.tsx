import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader, CardTitle, CardActions } from "@progress/kendo-react-layout";
import { Button } from "@/components/kendo/free";

interface PremiumCheckProps {
  children: React.ReactNode;
}

export default function PremiumCheck({ children }: PremiumCheckProps) {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium;

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <Card>
          <CardHeader>
            <CardTitle>Premium Feature</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
              <p className="text-gray-600 mb-6">
                This feature is only available to premium users. Upgrade now to access:
              </p>
              <ul className="text-left max-w-md mx-auto mb-8 space-y-2">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Custom avatar uploads
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Profile customization
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
          </CardBody>
          <CardActions>
            <div className="w-full flex justify-center">
              <Button
                themeColor="primary"
                onClick={() => window.location.href = "https://buy.stripe.com/test_00g02Pbdx65afzadQQ"}
              >
                Upgrade Now
              </Button>
            </div>
          </CardActions>
        </Card>
      </div>
    </div>
  );
} 