import { useContext, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./LeaveForm.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { RestrictedCalendar } from "../";

export const LeaveForm = () => {
	const { userEmail, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const initialFormData = {
		leave_type: "",
		date: "",
		time: "",
		reason: "",
		email: userEmail,
	};

	const [formData, setFormData] = useState(initialFormData);

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const handleChange = (e) => {
		const { name, value } = e.target;
		console.log(name, value)

		document.getElementById("input-date").classList.remove("d-none");

		if (name === 'leave_type') {
			if (value === 'short' || value === 'half') {
				document.getElementById("input-Time").classList.remove("d-none");
			} else {

				document.getElementById("input-Time").classList.add("d-none");
				setFormData(prev => ({ ...prev, leave_type: value, time: "" }));
				return;
			}
		}


		setFormData({ ...formData, [name]: value });

		// setFormData(prev => ({ ...prev, [name]: value }));

	};

	const handleLogoutClick = () => {
		logout();
		navigate("/");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// if (formData.end_date < formData.date) {
		// 	alert("End Date cannot be before Start Date");
		// 	return;
		// }

		setLoading(true);
		try {
			const token = localStorage.getItem("token");

			const url = `${process.env.REACT_APP_API_URL}/send`;
			const response = await axios.post(url, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

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
		<>
			<h1 className="text-center mb-4">Leave Application System</h1>

			<button className="btn btn-danger mb-3" onClick={handleLogoutClick}>
				Logout
			</button>

			<form className="leave-form text-start" onSubmit={handleSubmit}>
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
					</select>
				</div>

				<div id="input-date" className="text-center mb-3 d-none">
					<RestrictedCalendar
						leaveType={formData.leave_type}
						value={null}
						minDate={today}
						onChange={(date) =>
							setFormData((prev) => ({
								...prev,
								date: format(date, "yyyy-MM-dd"),
							}))
						}
					/>
				</div>

				<div id="input-Time" className="mb-3 d-none">
					<label className="form-label d-block mb-2">Time</label>

					<div className="d-flex align-items-center gap-4">

						<div className="form-check form-check-inline">
							<input
								type="radio"
								name="time"
								value="morning"
								onChange={handleChange} // <-- important
								checked={formData.time === "morning"} // <-- controlled input
								className="form-check-input"
								id="short-leave-morning"
							/>
							<label className="form-check-label" htmlFor="short-leave-morning">Morning</label>
						</div>

						<div className="form-check form-check-inline">
							<input
								type="radio"
								name="time"
								value="evening"
								onChange={handleChange} // <-- important
								checked={formData.time === "evening"} // <-- controlled input
								className="form-check-input"
								id="short-leave-evening"
							/>
							<label className="form-check-label" htmlFor="short-leave-evening">Evening</label>
						</div>

					</div>
				</div>


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
