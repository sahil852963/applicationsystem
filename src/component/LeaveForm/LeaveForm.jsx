import "./LeaveForm.css";
import { useState } from "react";
import axios from "axios";

export const LeaveForm = () => {
  const initialFormData = {
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.end_date < formData.start_date) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setLoading(true);
    try {
      const url = "https://demo.netmente.com/leaveapplication/backend/";
      const response = await axios.post(url, formData);
      setMessage("Leave submitted successfully!");
      setFormData(initialFormData); 
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit leave. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="leave-form" onSubmit={handleSubmit}>
      <label htmlFor="input-leave-type">Leave Type</label>
      <select
        name="leave_type"
        id="input-leave-type"
        value={formData.leave_type}
        onChange={handleChange}
        required
      >
        <option value="">Select Leave Type</option>
        <option value="short">Short Leave</option>
        <option value="full_day">Full Day Leave</option>
        <option value="half">Half Day Leave</option>
        <option value="restricted">Restricted Leave</option>
      </select>

      <label htmlFor="input-start-date">Start Date</label>
      <input
        type="date"
        id="input-start-date"
        name="start_date"
        value={formData.start_date}
        onChange={handleChange}
        min={today}
        required
      />

      <label htmlFor="input-end-date">End Date</label>
      <input
        type="date"
        id="input-end-date"
        name="end_date"
        value={formData.end_date}
        onChange={handleChange}
        min={formData.start_date || today}
        required
      />

      <label htmlFor="input-reason">Reason</label>
      <textarea
        id="input-reason"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        required
      />

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Submitting..." : "Submit Leave"}
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </form>
  );
};
