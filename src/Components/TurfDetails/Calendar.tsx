import { useEffect, useMemo, useState } from "react";

export interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const Calendar = ({ selected, onSelect, className = "", disabled }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(() => startOfDay(selected));
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    setCurrentDate(startOfDay(selected));
  }, [selected]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    if (firstDayWeek > 0) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonthLastDay - i),
          isCurrentMonth: false,
        });
      }
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => date1.toDateString() === date2.toDateString();

  const isPast = (date: Date) => startOfDay(date) < today;

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
          type="button"
        >
          &larr;
        </button>
        <h3 className="font-semibold text-gray-800">
          {currentDate.toLocaleDateString("en-CA", { year: "numeric", month: "long" })}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
          type="button"
        >
          &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isDisabled = isPast(day.date) || disabled?.(day.date) === true;
          const isSelected = isSameDay(selected, day.date);
          const isTodayDate = isSameDay(day.date, today);

          return (
            <button
              key={`${day.date.getTime()}-${index}`}
              onClick={() => !isDisabled && day.isCurrentMonth && onSelect(day.date)}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${!day.isCurrentMonth ? "text-gray-300" : ""}
                ${isSelected ? "bg-green-600 text-white" : ""}
                ${isTodayDate && !isSelected ? "bg-blue-100 text-blue-600 font-semibold" : ""}
                ${isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                ${day.isCurrentMonth && !isDisabled && !isSelected ? "text-gray-700" : ""}
              `}
              type="button"
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
