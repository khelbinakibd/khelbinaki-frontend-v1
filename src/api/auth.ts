import axiosInstance from "./axiosInstance";
import type { VerifyOtpData } from "../types/api.types";

// Register
export const userCreate =(data:object)=>{
   console.log(data);
   const res=axiosInstance.post("/auth/register",data);
   console.log(res);
   return res;
}


// Verify OTP
export const verifyOtp = async ({ email, otp }: Pick<VerifyOtpData, "email" | "otp">) => {
  console.log(email,otp);
  const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
  console.log(res);
  return res.data;
};
