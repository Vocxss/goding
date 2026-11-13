'use client'
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
import { signUpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Spinner } from "./ui/spinner";
import { toast } from "./ui/toast";
import { FieldError } from "@base-ui/react";

export function SignUpForm({ ...props }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      user_name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
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
    <div className={cn("flex flex-col gap-6")} {...props}>
      <Card>
        <CardHeader className={"flex flex-col justify-center items-center"}>
          <CardTitle>Selamat Datang di Goding!</CardTitle>
          <CardDescription>Buat akun Goding kamu untuk kursus</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Controller
                name="full_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="full_name">Nama Lengkap</FieldLabel>
                    <Input
                      {...field}
                      id="full_name"
                      type="text"
                      placeholder="Gibran Rakabuming Raka"
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
                name="user_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="user_name">Username</FieldLabel>
                    <Input
                      {...field}
                      id="user_name"
                      type="text"
                      placeholder="gibrangaming"
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
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          title="Show Password"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Eye /> : <EyeClosed />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button disabled={isLoading ? true : false} type="submit">{isLoading ? <Spinner/> : "Masuk"}</Button>
                <FieldDescription className="text-center">
                  Sudah punya akun? <Link href="/login">Masuk disini</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
