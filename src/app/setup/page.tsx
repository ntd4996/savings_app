"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import { NumericFormat } from "react-number-format";

interface SetupForm {
  startDate: string;
  endDate: string;
  targetAmount: string;
}

export default function Setup() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupForm>();
  const router = useRouter();

  const onSubmit = async (data: SetupForm) => {
    try {
      const response = await fetch("/api/sheets/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: data.startDate,
          endDate: data.endDate,
          targetAmount: parseInt(data.targetAmount.replace(/,/g, "")),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save setup");
      }

      // Đợi router refresh để cập nhật trạng thái
      router.refresh();
      // Đợi một chút để đảm bảo dữ liệu đã được cập nhật
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Chuyển trang
      await router.push("/");
    } catch (error) {
      console.error("Setup error:", error);
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
            Thiết lập kế hoạch tiết kiệm
          </h1>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Ngày bắt đầu
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200" />
                <input
                  type="date"
                  id="startDate"
                  {...register("startDate", { required: "Vui lòng chọn ngày bắt đầu" })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-600 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Ngày kết thúc
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200" />
                <input
                  type="date"
                  id="endDate"
                  {...register("endDate", { required: "Vui lòng chọn ngày kết thúc" })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-600 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="targetAmount"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Mục tiêu (VND)
              </label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200" />
                <Controller
                  name="targetAmount"
                  control={control}
                  rules={{
                    required: "Vui lòng nhập số tiền mục tiêu",
                    validate: {
                      min: (value) => {
                        const num = parseInt(value.replace(/,/g, ""));
                        return num >= 1000000 || "Số tiền tối thiểu là 1,000,000 VND";
                      },
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <NumericFormat
                      value={value}
                      onValueChange={(values) => {
                        onChange(values.value);
                      }}
                      thousandSeparator=","
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-600 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ví dụ: 100,000,000"
                    />
                  )}
                />
              </div>
              {errors.targetAmount && (
                <p className="mt-1 text-sm text-red-400">{errors.targetAmount.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Hoàn tất"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
