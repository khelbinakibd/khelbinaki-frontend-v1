import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../Hooks/useAuth";
import type { RegisterData } from "../types/api.types";
import { registerSchema } from "../lib/validation";
import bgImg from "../../src/assets/bgImg.jpg";


const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });




  
  const onSubmit = (data: RegisterData) => {
    console.log("Form data being submitted:", data);
    registerUser(data, {
      onSuccess: () => {
        reset();
      },
    });
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
       style={{
  backgroundImage: bgImg
    ? `url(${bgImg})`
    : `url("https://images6.alphacoders.com/749/749388.jpg")`,
}}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-green-700/30"></div>
      </div>

      {/* Centered Card Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex z-10">
        {/* Left Side (Form) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 lg:px-16 py-12">
         <a href="/">
          <img
            src="/khelbiNakiLogo.png"
            className="w-28 h-28 mx-auto object-contain"
            alt="Logo"
          /></a>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Create your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-gray-600 font-medium">Full Name</label>
              <input
                type="text"
                placeholder="User name"
                {...register("name")}
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-green-600 outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-600 font-medium">E-mail</label>
              <input
                type="email"
                placeholder="email"
                {...register("email")}
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-green-600 outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* phone */}
            <div>
              <label className="block text-gray-600 font-medium">Phone</label>
              <input
                type="number"
                placeholder="phone"
                {...register("phone")}
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-green-600 outline-none"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-600 font-medium">Password</label>
              <input
                type="password"
                placeholder="********"
                {...register("password")}
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-green-600 outline-none"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`w-full py-2.5 rounded font-semibold transition shadow-md ${
                isSubmitting || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
              }`}
            >
              {isSubmitting || isLoading ? "Signing Up..." : "SIGN UP"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-green-600 font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>

        {/* Right Side (Image Panel) */}
        <div
          className="hidden lg:flex w-1/2 bg-cover bg-center relative"
          style={{
  backgroundImage: bgImg
    ? `url("https://wallpapers.com/images/hd/soccer-4k-xd29kjrvbr5s4542.jpg")`
    : `url(${bgImg})`,
}}
        >
          <div className="absolute inset-0 bg-green-700/30"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
