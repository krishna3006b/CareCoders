import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
} from "date-fns";

const appointments = [
    { date: "2025-05-15" },
    { date: "2025-05-20" },
    { date: "2025-05-21" },
];

export default function Calendar() {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState("week");
    const [selectedDate, setSelectedDate] = useState(new Date());

    const renderHeader = () => (
        <div className="flex justify-between items-center p-4 bg-white shadow-sm rounded-t-md">
            <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
                <button
                    className={`text-sm px-3 py-1 rounded cursor-pointer ${viewMode === "week" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                    onClick={() => setViewMode("week")}
                >
                    Week
                </button>
                <button
                    className={`text-sm px-3 py-1 rounded cursor-pointer ${viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                    onClick={() => setViewMode("month")}
                >
                    Month
                </button>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const date = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-xs font-medium text-center text-gray-500">
                    {format(addDays(date, i), "EEE")}
                </div>
            );
        }
        return <div className="grid grid-cols-7 bg-gray-50 py-2">{days}</div>;
    };

    const renderCells = () => {
        const calendar = [];
        const start = viewMode === "month" ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate);
        const end = viewMode === "month" ? endOfWeek(endOfMonth(currentDate)) : endOfWeek(currentDate);

        let date = start;

        while (date <= end) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                const currentDay = date;
                const formattedDate = format(currentDay, "yyyy-MM-dd");
                const isToday = isSameDay(currentDay, new Date());
                const isSelected = isSameDay(currentDay, selectedDate);
                const hasAppointment = appointments.some(appt => appt.date === formattedDate);

                // Check if the current day is in the same month as the selected month
                const isInCurrentMonth = isSameMonth(currentDay, currentDate);

                let baseClass = "relative flex items-center justify-center h-14 cursor-pointer";
                let circleClass = "w-9 h-9 flex items-center justify-center";

                if (isSelected) {
                    circleClass += " bg-blue-500 text-white rounded-full";
                } else if (viewMode === "week" && isToday) {
                    circleClass += " bg-blue-100 text-black rounded-full";
                }

                // Apply a faded style if the day is not part of the current month
                if (!isInCurrentMonth) {
                    circleClass += " text-gray-300"; // You can change the text color or opacity to make it faded
                }

                week.push(
                    <div key={formattedDate} className={baseClass} onClick={() => setSelectedDate(currentDay)}>
                        <div className={circleClass}>
                            {format(currentDay, "d")}
                        </div>
                        {hasAppointment && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                    </div>
                );
                date = addDays(date, 1);
            }
            calendar.push(
                <div key={date} className="grid grid-cols-7">
                    {week}
                </div>
            );
        }
        return calendar;
    };

    return (
        <div className="w-full mx-auto border border-gray-200 rounded-md overflow-hidden bg-white">
            {renderHeader()}
            {renderDays()}
            <div>{renderCells()}</div>
        </div>
    );
}