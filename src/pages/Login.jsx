import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";

import { login } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import loginBg from "@/assets/login-bg.jpg";
import logo from "@/assets/logo-cignes.png";

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your email or phone number."),
  password: z.string().min(1, "Password is required."),
});

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setPending(true);
    setServerError(null);
    try {
      await login(values.identifier, values.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setServerError("Invalid username or password.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="absolute inset-0 lg:relative">
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 size-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative hidden h-full flex-col justify-between p-10 text-white lg:flex">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white p-1">
              <img src={logo} alt="" className="size-full object-contain" />
            </div>
            Cignes Academy
          </div>
          <div className="max-w-md">
            <p className="text-lg font-medium">Learn AI. Create Impact.</p>
            <p className="mt-1 text-sm text-white/70">
              Manage enquiries, enrollments, fees and events from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-border lg:hidden">
              <img src={logo} alt="" className="size-full object-contain" />
            </div>
            <CardTitle className="text-xl">Cignes Academy</CardTitle>
            <CardDescription>Sign in with your email or phone</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
              <FieldGroup>
                <Field data-invalid={!!errors.identifier || undefined}>
                  <FieldLabel htmlFor="identifier">Email or phone</FieldLabel>
                  <Input
                    id="identifier"
                    autoComplete="username"
                    aria-invalid={!!errors.identifier}
                    placeholder="you@cignes.academy or 9876543210"
                    {...register("identifier")}
                  />
                  {errors.identifier && <FieldError>{errors.identifier.message}</FieldError>}
                </Field>
                <Field data-invalid={!!errors.password || undefined}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={pending}>
                {pending && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
