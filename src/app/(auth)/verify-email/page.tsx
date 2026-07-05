"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      });
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-sm text-center">
        <div className={`text-4xl mb-4 ${status === "success" ? "text-green-500" : status === "error" ? "text-red-500" : "text-zinc-400"}`}>
          {status === "loading" ? "⏳" : status === "success" ? "✅" : "❌"}
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Email Verification</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailContent /></Suspense>;
}
