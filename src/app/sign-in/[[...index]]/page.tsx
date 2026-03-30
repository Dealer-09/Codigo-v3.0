import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "~/_components/auth/AuthShell";
import { authAppearance } from "~/_components/auth/authAppearance";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn appearance={authAppearance} />
    </AuthShell>
  );
}
