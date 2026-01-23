"use client";
import React, { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Toast from "./ui/Toast";
import { validatePasswordStrength } from "@/lib/validators/authSchemas";

type Props = {
  mode: "register" | "login";
  role?: "worker" | "business";
  onSuccess?: (data: any) => void;
};

export default function AuthForm({ mode, role, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordValidation = validatePasswordStrength(password);
  const showPasswordRequirements = mode === "register" && passwordTouched;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      const body: any = { email, password };
      if (mode === "register") body.role = role;
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");

      setToast({
        type: "success",
        message:
          mode === "register"
            ? "Account created successfully!"
            : "Signed in successfully!",
      });

      // Delay navigation to show success message
      setTimeout(() => {
        onSuccess?.(json);
      }, 1000);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <div className="relative">
            <Input
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordTouched(true)}
              type={showPassword ? "text" : "password"}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? (
                /* Hide password */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                  <path d="M9.9 4.2A9.1 9.1 0 0112 4c5 0 9 4 10 8a10.2 10.2 0 01-3.2 4.8" />
                  <path d="M6.2 6.2A10.2 10.2 0 002 12c1 4 5 8 10 8a9.1 9.1 0 004.8-1.4" />
                </svg>
              ) : (
                /* Show password */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {showPasswordRequirements && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Password must contain:
              </p>
              <ul className="space-y-1">
                <PasswordRequirement
                  met={password.length >= 8}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={/[A-Z]/.test(password)}
                  text="One uppercase letter (A-Z)"
                />
                <PasswordRequirement
                  met={/[a-z]/.test(password)}
                  text="One lowercase letter (a-z)"
                />
                <PasswordRequirement
                  met={/[0-9]/.test(password)}
                  text="One number (0-9)"
                />
                <PasswordRequirement
                  met={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
                  text="One special character (!@#$%...)"
                />
              </ul>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Please wait...
            </span>
          ) : mode === "register" ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </>
  );
}

// Password Requirement Component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <svg
          className="w-4 h-4 text-green-500 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className={met ? "text-green-700" : "text-gray-600"}>{text}</span>
    </li>
  );
}
