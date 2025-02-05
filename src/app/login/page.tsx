"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";

interface LoginForm {
  username: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch("/api/sheets/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize sheet");
      }

      localStorage.setItem("savings_user", data.username);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-700/50 backdrop-blur rounded-xl p-8 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-slate-200 text-center mb-6">
            Đăng nhập
          </h1>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Tên người dùng
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200" />
                <input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "Vui lòng nhập tên người dùng",
                    minLength: {
                      value: 3,
                      message: "Tên người dùng phải có ít nhất 3 ký tự",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg !bg-slate-800/50 border border-slate-600 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập tên của bạn"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
