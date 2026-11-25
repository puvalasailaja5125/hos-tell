import Link from "next/link";
import ResetForm from "@/components/reset-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      {typeof token === "string" && token ? (
        <ResetForm token={token} />
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardDescription>This reset link is missing or incomplete.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/forgot-password" className={buttonVariants()}>
              Request a new link
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}