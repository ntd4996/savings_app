"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { FaPiggyBank, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import { calculateSavings, formatCurrency } from "@/utils/savings";
import SavingsModal from "@/components/SavingsModal";
import {
  saveSavingsData,
  getSavedDays,
  deleteSavingsData,
} from "@/utils/googleSheets";

interface SavingsDay {
  day: number;
  date: Date;
  amount: number;
}

interface SavingsData {
  dailySavings: SavingsDay[];
  k: number;
  firstDayAmount: number;
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<SavingsData | null>(null);
  const [selectedDay, setSelectedDay] = useState<SavingsDay | null>(null);
  const [savedDays, setSavedDays] = useState<number[]>([]);
  const [startDateStr, setStartDateStr] = useState<string>("");
  const [endDateStr, setEndDateStr] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<number>(0);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/sheets/user-config");
        if (!response.ok) throw new Error("Failed to fetch config");

        const config = await response.json();
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);

        setStartDateStr(format(start, "dd/MM/yyyy"));
        setEndDateStr(format(end, "dd/MM/yyyy"));
        setTargetAmount(config.targetAmount);

        const calculatedData = calculateSavings(
          config.targetAmount,
          start,
          end
        );
        setData(calculatedData);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };

    setIsClient(true);
    fetchConfig();
  }, []);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedDaysFromSheet = await getSavedDays();
        setSavedDays(savedDaysFromSheet);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    loadSavedData();
  }, []);

  const handleDayClick = (day: SavingsDay) => {
    setSelectedDay(day);
  };

  const handleSave = async () => {
    if (selectedDay) {
      try {
        await saveSavingsData({
          day: selectedDay.day,
          date: format(selectedDay.date, "dd/MM/yyyy"),
          amount: selectedDay.amount,
          saved: true,
        });

        const newSavedDays = [...savedDays, selectedDay.day];
        setSavedDays(newSavedDays);
        setSelectedDay(null);
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        // Thêm xử lý lỗi ở đây (ví dụ: hiển thị thông báo)
      }
    }
  };

  const handleDelete = async () => {
    if (selectedDay) {
      try {
        await deleteSavingsData(selectedDay.day);
        const newSavedDays = savedDays.filter((day) => day !== selectedDay.day);
        setSavedDays(newSavedDays);
        setSelectedDay(null);
      } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error);
        // Thêm xử lý lỗi ở đây (ví dụ: hiển thị thông báo)
      }
    }
  };

  if (!isClient || !data?.dailySavings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  const totalSaved = savedDays.reduce((total, day) => {
    const savedDay = data.dailySavings.find((d) => d.day === day);
    return total + (savedDay?.amount || 0);
  }, 0);

  const remainingAmount = targetAmount - totalSaved;
  const remainingDays = data?.dailySavings.length || 0;
  const dailyNeeded = Math.round((targetAmount / remainingDays) / 1000) * 1000;

  return (
    <div className="min-h-screen w-screen p-4 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="h-full w-full flex flex-col gap-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-100">
            <FaPiggyBank className="inline-block mr-2 mb-1" />
            Ứng Dụng Tiết Kiệm Lũy Tiến
          </h1>
        </motion.div>

        {/* Thông tin tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <h2 className="font-semibold flex items-center text-slate-200">
              <FaCalendarAlt className="mr-2" />
              Ngày bắt đầu
            </h2>
            <p className="mt-1 text-slate-300">{startDateStr}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <h2 className="font-semibold flex items-center text-slate-200">
              <FaCalendarAlt className="mr-2" />
              Ngày kết thúc
            </h2>
            <p className="mt-1 text-slate-300">{endDateStr}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <h2 className="font-semibold flex items-center text-slate-200">
              <FaMoneyBillWave className="mr-2" />
              Mục tiêu
            </h2>
            <p className="mt-1 text-slate-300">
              {formatCurrency(targetAmount)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <h2 className="font-semibold flex items-center text-slate-200">
              <FaPiggyBank className="mr-2" />
              Đã tiết kiệm
            </h2>
            <p className="mt-1 text-slate-300">{formatCurrency(totalSaved)}</p>
          </motion.div>
        </div>

        {/* Tổng kết */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <p className="text-sm text-slate-400">Còn lại cần tiết kiệm</p>
            <p className="text-xl font-bold text-slate-200">
              {formatCurrency(remainingAmount)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <p className="text-sm text-slate-400">Trung bình mỗi ngày</p>
            <p className="text-xl font-bold text-slate-200">
              {formatCurrency(dailyNeeded)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <p className="text-sm text-slate-400">Số ngày đã tiết kiệm</p>
            <p className="text-xl font-bold text-emerald-400">
              {savedDays.length} ngày
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-700/50 backdrop-blur p-3 rounded-xl hover:bg-slate-700/70 transition-colors"
          >
            <p className="text-sm text-slate-400">Số ngày chưa tiết kiệm</p>
            <p className="text-xl font-bold text-slate-400">
              {data.dailySavings.length - savedDays.length} ngày
            </p>
          </motion.div>
        </div>

        {/* Danh sách ngày tiết kiệm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-slate-800/50 backdrop-blur rounded-xl shadow-lg p-4"
        >
          <div className="flex flex-col overflow-y-auto max-h-content-plan">
            <h2 className="text-lg font-bold mb-3 text-slate-200">
              Kế hoạch tiết kiệm theo ngày
            </h2>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-auto p-3">
              {data.dailySavings.map((day) => (
                <motion.div
                  key={day.day}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-2 rounded-lg cursor-pointer border transition-all max-h-[150px] place-content-center ${
                    savedDays.includes(day.day)
                      ? "bg-emerald-900/50 border-emerald-700 hover:bg-emerald-900/70"
                      : "bg-slate-700/50 border-slate-600 hover:bg-slate-700/70"
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-200">
                      {format(day.date, "dd/MM/yyyy")}
                    </div>
                    <div className="text-xs text-slate-400">Ngày {day.day}</div>
                    <div className="mt-1 text-sm font-bold text-emerald-400">
                      {formatCurrency(day.amount)}
                    </div>
                    <div className="mt-1">
                      {savedDays.includes(day.day) ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-200">
                          Đã tiết kiệm
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                          Chưa tiết kiệm
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {selectedDay && (
        <SavingsModal
          isOpen={!!selectedDay}
          closeModal={() => setSelectedDay(null)}
          day={selectedDay}
          onSave={handleSave}
          onDelete={handleDelete}
          isSaved={savedDays.includes(selectedDay.day)}
        />
      )}
    </div>
  );
}
