/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import * as z from "zod";
import api from "../../lib/api";

// Validation rules
const adminSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(/^\d{11}$/, "Phone must be 11 digits"),
});

type AdminFormData = z.infer<typeof adminSchema>;

const CreateAdminForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [createdAdminId, setCreatedAdminId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const onSubmit = async (data: AdminFormData) => {
    try {
      console.log('📤 Creating admin with data:', data);
      const res = await api.post("admin/users/admin", data);
      
      console.log('✅ Admin created response:', res.data);
      
      // Extract admin ID from response
      const adminId = res.data.adminId || res.data.user?._id;
      
      if (!adminId) {
        console.error('❌ No admin ID in response:', res.data);
        toast.error("Admin created but ID not found in response");
        return;
      }

      setCreatedAdminId(adminId);
      toast.success(res.data.message || "Admin created successfully!");
      
      // Show the admin ID prominently
      toast.success(`Admin ID: ${adminId}`, {
        duration: 10000,
        action: {
          label: "Copy",
          onClick: () => {
            navigator.clipboard.writeText(adminId);
            toast.success("Admin ID copied!");
          }
        }
      });

      reset();
    } catch (err: any) {
      console.error('❌ Error creating admin:', err);
      const errorMessage = err.response?.data?.message || "Failed to create admin";
      toast.error(errorMessage);
    }
  };

  const copyAdminId = () => {
    if (createdAdminId) {
      navigator.clipboard.writeText(createdAdminId);
      setCopied(true);
      toast.success("Admin ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create New Admin
        </h2>

        {/* Show created admin ID prominently */}
        {createdAdminId && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl">
            <p className="text-sm font-semibold text-emerald-800 mb-2">
              ✅ Admin Created Successfully!
            </p>
            <p className="text-xs text-emerald-700 mb-2">
              Copy this ID to assign the admin to a turf:
            </p>
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-emerald-300">
              <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                {createdAdminId}
              </code>
              <button
                type="button"
                onClick={copyAdminId}
                className="flex-shrink-0 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCreatedAdminId(null)}
              className="mt-3 text-xs text-emerald-600 hover:text-emerald-800 underline"
            >
              Create Another Admin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              {...register("name")}
              className={`w-full px-5 py-3 border-2 rounded-xl outline-none text-sm transition ${
                errors.name
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-200 focus:ring-emerald-100 focus:border-emerald-400"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={`w-full px-5 py-3 border-2 rounded-xl outline-none text-sm transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-200 focus:ring-emerald-100 focus:border-emerald-400"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
              className={`w-full px-5 py-3 border-2 rounded-xl outline-none text-sm pr-12 transition ${
                errors.password
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-200 focus:ring-emerald-100 focus:border-emerald-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="text"
              placeholder="Phone (11 digits)"
              {...register("phone")}
              className={`w-full px-5 py-3 border-2 rounded-xl outline-none text-sm transition ${
                errors.phone
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-200 focus:ring-emerald-100 focus:border-emerald-400"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold text-white shadow-md transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminForm;
