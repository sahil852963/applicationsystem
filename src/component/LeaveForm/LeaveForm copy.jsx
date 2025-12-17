import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LeaveForm.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { RestrictedCalendarSingle, MultiDateCalendar } from "../";

export const LeaveForm = () => {

	const { userEmail, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const initialFormData = {
		leave_type: "",
		date: today.toISOString(),
		time: "",
		reason: "",
		email: userEmail,
	};

	const [formData, setFormData] = useState(initialFormData);
	const [showTime, setShowTime] = useState(false);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");


	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "leave_type") {
			if (value === "short" || value === "half") {
				setShowTime(true);
			} else {
				setShowTime(false);
			}

			if (value === "multi") {
				setFormData((prev) => ({
					...prev,
					leave_type: value,
					date: [], 
					time: "",
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					leave_type: value,
					date: today.toISOString(),
					time: "",
				}));
			}
			return; 
		}

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};


	const handleLogoutClick = () => {
		logout();
		navigate("/");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setLoading(true);
		try {
			const token = localStorage.getItem("token");

			const url = `${process.env.REACT_APP_API_URL}/send`;
			await axios.post(url, formData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			setMessage("Leave submitted successfully!");
			setFormData(initialFormData);
			setShowTime(false);
		} catch (error) {
			console.error(error);
			setMessage("Failed to submit leave. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="text-center mb-4">Leave Application System</h1>

			<button className="btn btn-danger mb-3" onClick={handleLogoutClick}>
				Logout
			</button>

			<form className="leave-form text-start" onSubmit={handleSubmit}>
				{/* Leave Type */}
				<div className="mb-3">
					<label className="form-label">Leave Type</label>
					<select
						name="leave_type"
						className="form-select"
						value={formData.leave_type}
						onChange={handleChange}
						required
					>
						<option value="">Select Leave Type</option>
						<option value="short">Short Leave</option>
						<option value="full_day">Full Day Leave</option>
						<option value="half">Half Day Leave</option>
						<option value="restricted">Restricted Leave</option>
						<option value="multi">Multiple Leave</option>
					</select>
				</div>

				<div className="text-center mb-3">
					{formData.leave_type === "multi" ? (
						<MultiDateCalendar
							date={Array.isArray(formData.date) ? formData.date : []}
							minDate={today}
							onChange={(dates) =>
								setFormData((prev) => ({ ...prev, date: dates }))
							}
						/>
					) : (
						// <RestrictedCalendarSingle
						// 	value={formData.date ? new Date(formData.date) : null}
						// 	minDate={today}
						// 	onChange={(date) =>
						// 		setFormData((prev) => ({ ...prev, date: date.toISOString() }))
						// 	}
						// />
						<RestrictedCalendarSingle
							leaveType={formData.leave_type}
							value={formData.date}
							minDate={today}
							onChange={(date) => {
								if (formData.leave_type === "multi") {
									setFormData((prev) => ({
										...prev,
										date: date.map((d) => d.toISOString()),
									}));
								} else {
									setFormData((prev) => ({
										...prev,
										date: date.toISOString(),
									}));
								}
							}}
						/>
					)}
				</div>



				{/* Time Select */}
				{showTime && (
					<div className="mb-3">
						<label className="form-label d-block mb-2">Time</label>

						<div className="d-flex align-items-center gap-4">
							<div className="form-check form-check-inline">
								<input
									type="radio"
									name="time"
									value="morning"
									onChange={handleChange}
									checked={formData.time === "morning"}
									className="form-check-input"
									id="short-leave-morning"
								/>
								<label className="form-check-label" htmlFor="short-leave-morning">
									Morning
								</label>
							</div>

							<div className="form-check form-check-inline">
								<input
									type="radio"
									name="time"
									value="evening"
									onChange={handleChange}
									checked={formData.time === "evening"}
									className="form-check-input"
									id="short-leave-evening"
								/>
								<label className="form-check-label" htmlFor="short-leave-evening">
									Evening
								</label>
							</div>
						</div>
					</div>
				)}

				{/* Reason */}
				<div className="mb-3">
					<label className="form-label">Reason</label>
					<textarea
						name="reason"
						className="form-control"
						rows="3"
						value={formData.reason}
						onChange={handleChange}
						required
					></textarea>
				</div>

				<button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
					{loading ? "Submitting..." : "Submit Leave"}
				</button>

				{message && <p className="text-center mt-3">{message}</p>}
			</form>
		</>
	);
};
