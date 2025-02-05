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

export function calculateSavings(
  targetAmount: number,
  startDate: Date,
  endDate: Date
): SavingsData {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Công thức tính lũy tiến:
  // Số tiền ngày đầu = x
  // Số tiền tăng mỗi ngày = k
  // Tổng = x + (x+k) + (x+2k) + ... + (x+(n-1)k) = nx + k(n(n-1)/2)
  // Trong đó n là số ngày
  // targetAmount = nx + k(n(n-1)/2)
  // Chọn x = 10,000 (số tiền ngày đầu)
  const firstDayAmount = 10000;
  
  // Từ công thức trên, tính được k:
  // k = 2(targetAmount - n*x)/(n*(n-1))
  const k = Math.ceil(
    (2 * (targetAmount - days * firstDayAmount)) / (days * (days - 1))
  );

  const dailySavings: SavingsDay[] = [];
  let totalCalculated = 0;

  for (let day = 1; day <= days; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day - 1);
    
    // Công thức: amount = x + (day-1)*k
    const amount = Math.max(
      10000,
      Math.round((firstDayAmount + (day - 1) * k) / 1000) * 1000
    );
    
    totalCalculated += amount;
    
    dailySavings.push({
      day,
      date,
      amount,
    });
  }

  // Điều chỉnh số tiền ngày cuối để đảm bảo tổng đúng bằng targetAmount
  if (totalCalculated !== targetAmount) {
    const diff = targetAmount - totalCalculated;
    const lastDay = dailySavings[dailySavings.length - 1];
    lastDay.amount += diff;
  }

  return {
    dailySavings,
    k,
    firstDayAmount,
  };
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
