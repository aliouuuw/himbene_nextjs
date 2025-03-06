import { SignInFormClient } from "./_components/SignInFormClient"

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <SignInFormClient className={className} {...props} />;
}
