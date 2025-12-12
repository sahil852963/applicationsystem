import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RestrictedCalendarSingle.css";

export const RestrictedCalendarSingle = ({ leaveType, value, onChange, minDate }) => {

	const allowedDates = [
		new Date("2025-03-10"),
		new Date("2025-03-15"),
		new Date("2025-05-22"),
		new Date("2025-12-28"),
	];

	const isSameDay = (d1, d2) =>
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate();

	const minMid = minDate ? new Date(minDate) : null;

	const selectedDate =
		value instanceof Date ? value : value ? new Date(value) : null;

	const isPast = (date) => {
		if (!minMid) return false;
		return date < minMid;
	};

	const isAllowed = (date) => {
		if (isPast(date)) return false;

		if (leaveType === "restricted") {
			return allowedDates.some((d) => isSameDay(d, date));
		}

		return true;
	};

	const highlightAllowedDates = (date) => {
		if (isPast(date)) return "disabled-date";

		if (leaveType === "restricted") {
			return allowedDates.some((d) => isSameDay(d, date))
		}
		return "";
	};

	return (
		<DatePicker
			selected={selectedDate}
			onChange={(date) => onChange(date)}
			inline
			filterDate={isAllowed}
			dayClassName={highlightAllowedDates}
			minDate={minMid}
		/>
	);
};
