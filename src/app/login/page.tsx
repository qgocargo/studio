import { LoginForm } from "@/components/auth/LoginForm";
import { QgoLogo } from "@/components/shared/QgoLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <QgoLogo className="text-5xl" />
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-700">
            Delivery Management Portal
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
