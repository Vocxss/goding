import { LoginForm } from "@/components/loginForm";

import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-bold text-2xl">
            <Image
              src={"/logo.webp"}
              alt="Logo"
              width={800}
              height={800}
              className="w-12 object-cover"
            />
          Goding
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
