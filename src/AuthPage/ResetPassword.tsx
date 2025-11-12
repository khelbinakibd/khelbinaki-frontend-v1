import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router";

import { resetPasswordSchema } from "../lib/validation";
import type { ResetPasswordData } from "../types/api.types";
import { useAuth } from "../Hooks/useAuth";

export function ResetPassword() {
  const { resetPassword, isLoading } = useAuth();
  const { token } = useParams<{ token: string }>();
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: ResetPasswordData) => {
		console.log("Reset password data being submitted:", data);

		if (token) {
			resetPassword({ token, password: data.password });
		}
	};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              {...register("password")}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={ isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            }`}
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
