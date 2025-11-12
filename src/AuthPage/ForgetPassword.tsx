/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../Hooks/useAuth";
import { forgotPasswordSchema } from "../lib/validation";
import type { ForgotPasswordData } from "../types/api.types";
import { Link } from "react-router";

const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

 	const onSubmit = (data: ForgotPasswordData) => {
		console.log("Forgot password data being submitted:", data);
		forgotPassword(data);
	};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">
        <Link to="/">
        <img
          src="/khelbiNakiLogo.png"
          alt="Logo"
          className="w-28 h-28 mx-auto object-contain mb-6"
        /></Link>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            }`}
          >
            { isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
