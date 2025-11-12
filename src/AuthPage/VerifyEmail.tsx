/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";
import { verifyOtpSchema } from "../lib/validation";
import type { VerifyOtpData } from "../types/api.types";

const VerifyEmail: React.FC = () => {
  const { verifyOtp, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

const form = useForm<VerifyOtpData>({
  resolver: zodResolver(verifyOtpSchema),
  defaultValues: {
    email: sessionStorage.getItem("otp-email") || "",
    otp: "",
  },
});

  const onSubmit = (data: VerifyOtpData) => {
    setErrorMsg("");
    verifyOtp(data, {
      onSuccess: () => form.reset(),
      onError: (err: any) =>
        setErrorMsg(err?.message || "Invalid or expired code."),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Verify Your Email
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-green-600 outline-none text-center tracking-widest text-lg" type="email" {...form.register("email")} />

          <input
            type="text"
            maxLength={6}
            placeholder="Enter verification code"
            {...form.register("otp")}
            className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-green-600 outline-none text-center tracking-widest text-lg"
          />
          {form.formState.errors.otp && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.otp.message}
            </p>
          )}

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded font-semibold transition shadow-md ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
            }`}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
