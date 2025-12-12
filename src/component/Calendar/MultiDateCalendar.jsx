import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./MultiDateCalendar.css";

export const MultiDateCalendar = ({ date, onChange, minDate }) => {
  const [selectedDates, setSelectedDates] = useState(
    Array.isArray(date) ? date.map((d) => new Date(d)) : []
  );

  // Reset calendar if date prop changes type
  useEffect(() => {
    if (!Array.isArray(date)) return;
    const newDates = date.map((d) => new Date(d));
    const isSame =
      newDates.length === selectedDates.length &&
      newDates.every((d, i) => d.getTime() === selectedDates[i]?.getTime());
    if (!isSame) setSelectedDates(newDates);
  }, [date]);

  const handleChange = (dates) => {
    setSelectedDates(dates ?? []);
    onChange((dates ?? []).map((d) => d.toISOString()));
  };

  return (
    <DatePicker
      inline
      selectsMultiple
      selectedDates={selectedDates}
      onChange={handleChange}
      shouldCloseOnSelect={false}
      disabledKeyboardNavigation
      minDate={minDate ? new Date(minDate) : null}
    />
  );
};
