import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "~/_components/auth/AuthShell";
import { authAppearance } from "~/_components/auth/authAppearance";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp appearance={authAppearance} />
    </AuthShell>
  );
}
