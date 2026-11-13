"use client";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Spinner } from "./ui/spinner";
import Link from "next/link";
import { POST } from "@/app/api/[...nextauth]/route";
import { json } from "zod";

export function LoginForm({ className, ...props }) {
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: POST,
        body: JSON.parse(inputValue),
      });

      if (!res.ok)
        toast.add({
          title: "Login gagal",
          description: res.message,
          type: "error",
        });

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Login gagal",
        description: error.message,
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className={"flex justify-center items-center"}>
          <Image
            src={"/logo.webp"}
            width={300}
            height={300}
            className="w-48 h-48 object-cover"
          />
          <CardTitle>Selamat Datang di Goding!</CardTitle>
          <CardDescription>Buat akun Goding kamu untuk kursus</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Nama</FieldLabel>
                <Input
                  id="nama"
                  type="text"
                  placeholder="John Doe"
                  value={inputValue.nama}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, nama: e.target.value })
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={inputValue.email}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, email: e.target.value })
                  }
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={inputValue.password}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, password: e.target.value })
                  }
                  required
                />
              </Field>
              <Field>
                <Button disabled={isLoading ? true : false} type="submit">
                  {isLoading ? <Spinner /> : "Masuk"}
                </Button>
                <FieldDescription className="text-center">
                  Belum punya akun? <Link href="/signup">Buat disini</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
