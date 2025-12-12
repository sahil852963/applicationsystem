import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RestrictedCalendar.css";

export const RestrictedCalendar = ({ leaveType, value, onChange, minDate }) => {
  const allowedDates = [10, 15, 22, 28];

  const minMid = minDate ? new Date(minDate) : null;

  const selectedDate =
    value instanceof Date ? value : value ? new Date(value) : null;
  const isPast = (date) => {
    if (!minMid) return false;
    const dayMid = date;
    return dayMid < minMid; 
  };

  const isAllowed = (date) => {
    if (isPast(date)) return false;

    if (leaveType === "restricted") {
      return allowedDates.includes(date.getDate());
    }

    return true; 
  };

  const highlightAllowedDates = (date) => {
    if (isPast(date)) return "disabled-date";

    if (leaveType === "restricted") {
      return allowedDates.includes(date.getDate()) ? "allowed-date" : "disabled-date";
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
