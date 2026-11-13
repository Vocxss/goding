'use client'
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { Spinner } from "./ui/spinner"

export function LoginForm({
  className,
  ...props
}) {
  const [input, setInput] = useState({
    email: "",
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async(e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await signIn("credentials", {
        email: input.email,
        password: input.password
      })

      if (!res.ok) toast.add({title: "Login gagal", description: res.message, type: "error"})

      setIsLoading(false)
    } catch (error) {
      console.error(error)
      toast.add({title: "Login gagal", description: error.message, type: "error"})
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className={"flex justify-center items-center"}>
          <Image src={"/logo.webp"} width={300} height={300} className="w-48 h-48 object-cover"/>
          <CardTitle>Selamat Datang Kembali!</CardTitle>
          <CardDescription>
            Masukkan akun Goding kamu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Lupa password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button disabled={isLoading ? true : false} type="submit">{isLoading ? <Spinner/> : "Masuk"}</Button>
                <FieldDescription className="text-center">
                  Sudah punya akun? <Link href="/login">Masuk</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
