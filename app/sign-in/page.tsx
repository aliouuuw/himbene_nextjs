import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <SignInForm />
    </div>
  );
}