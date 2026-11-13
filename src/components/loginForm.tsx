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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Spinner } from "./ui/spinner";
import { toast } from "./ui/toast";
export function LoginForm({ className, ...props }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok)
      toast.add({
        title: "Login gagal",
        description: result.errors,
        type: "error",
      });

    setIsLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className={"flex justify-center items-center"}>
          <CardTitle>Selamat Datang di Goding!</CardTitle>
          <CardDescription>Buat akun Goding kamu untuk kursus</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Nama</FieldLabel>
                    <Input
                      {...field}
                      id="nama"
                      type="text"
                      placeholder="gibranxgaming@gmail.com"
                      autoComplete="off"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
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
                    <Input {...field} id="password" type="password" required />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
