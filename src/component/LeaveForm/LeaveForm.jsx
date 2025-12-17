import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../context/AuthContext";
import "./LeaveForm.css";

export const LeaveForm = () => {
	const { userEmail, logout } = useContext(AuthContext);
	const navigate = useNavigate();


	// ---- Helpers ----
	const formatDate = (dateObj) => {
		const istDate = new Date(dateObj.getTime() + 5.5 * 60 * 60 * 1000);
		return istDate.toISOString().split("T")[0];
	};

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const addMonths = (date, months) =>
		new Date(date.getFullYear(), date.getMonth() + months, date.getDate());

	const maxDate = addMonths(today, 1);

	const restrictedDates = [
		"2025-03-10",
		"2025-03-15",
		"2025-05-22",
		"2025-12-28",
	].filter((d) => new Date(d) >= today);

	const restrictedDateObjects = restrictedDates.map(d => {
		const dt = new Date(d);
		dt.setHours(0, 0, 0, 0);
		return dt;
	});

	// ---- State ----
	const [leaveMode, setLeaveMode] = useState("single");
	const [currentDay, setCurrentDay] = useState({
		date: formatDate(today),
		leave_type: "full_day",
		session: "",
	});
	const [addedLeaves, setAddedLeaves] = useState([]);
	const [reason, setReason] = useState("");
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState("success");
	const [loading, setLoading] = useState(false);

	// ---- Handlers ----
	const handleLogoutClick = () => {
		logout();
		navigate("/");
	};

	const handleLeaveTypeChange = (e) => {
		if (leaveMode === "restricted") return;
		const type = e.target.value;

		setCurrentDay({
			...currentDay,
			leave_type: type,
			session: type === "half" || type === "short" ? currentDay.session : "",
		});
	};

	const handleSessionChange = (e) => {
		setCurrentDay({ ...currentDay, session: e.target.value });
	};

	const getNextDate = (dateStr) => {
		const d = new Date(dateStr);
		d.setDate(d.getDate() + 1);
		d.setHours(0, 0, 0, 0);
		return formatDate(d);
	};

	const getPreviousDate = (dateStr) => {
		const d = new Date(dateStr);
		d.setDate(d.getDate() - 1);
		d.setHours(0, 0, 0, 0);
		return formatDate(d);
	};


	const handleAddDay = () => {
		// session required for short / half
		if (
			(currentDay.leave_type === "half" || currentDay.leave_type === "short") &&
			!currentDay.session
		) {
			return alert("Select session");
		}

		// duplicate date check
		if (addedLeaves.some((l) => l.date === currentDay.date)) {
			return alert("Date already added");
		}

		if (currentDay.leave_type === "short") {
			const prevDate = getPreviousDate(currentDay.date);
			const nextDate = getNextDate(currentDay.date);

			const conflict = addedLeaves.find((l) => {
				// Case 1: yesterday evening short → today morning short
				if (
					l.leave_type === "short" &&
					l.date === prevDate &&
					l.session === "evening" &&
					currentDay.session === "morning"
				) {
					return true;
				}

				// Case 2: today evening short → tomorrow morning short
				if (
					l.leave_type === "short" &&
					l.date === nextDate &&
					l.session === "morning" &&
					currentDay.session === "evening"
				) {
					return true;
				}

				return false;
			});

			if (conflict) {
				return alert(
					"Short leave requires a gap. You cannot take short leave on consecutive sessions."
				);
			}
		}

		// ✅ add leave
		setAddedLeaves([...addedLeaves, { ...currentDay }]);

		// reset
		setCurrentDay({
			date: formatDate(today),
			leave_type: "full_day",
			session: "",
		});
	};


	const handleDeleteDay = (date) => {
		setAddedLeaves(addedLeaves.filter((l) => l.date !== date));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (leaveMode === "multiple" && addedLeaves.length === 0)
			return alert("Add at least one leave day");

		const payload = {
			email: userEmail,
			leave_mode: leaveMode,
			leaves:
				leaveMode === "restricted"
					? [{ date: currentDay.date, leave_type: "restricted", session: "" }]
					: leaveMode === "single"
						? [currentDay]
						: addedLeaves,
			reason,
		};

		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			await axios.post(`${process.env.REACT_APP_API_URL}/send`, payload, {
				headers: { Authorization: `Bearer ${token}` },
			});

			setMessage("Leave submitted successfully!");
			setMessageType("success");
			setAddedLeaves([]);
			setReason("");
		} catch {
			setMessage("Failed to submit leave.");
			setMessageType("error");
		} finally {
			setLoading(false);
		}
	};

	// ---- JSX ----
	return (
		<div className="container-fluid px-3 px-md-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-10 col-lg-8">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h1 className="mb-0">Leave Application System</h1>
						<button className="btn btn-danger" onClick={handleLogoutClick}>
							Logout
						</button>
					</div>
					{message && (
						<div
							className={`alert alert-dismissible fade show mt-3 d-flex align-items-center ${messageType === "success" ? "alert-success" : "alert-danger"
								}`}
							role="alert"
							style={{ margin: "0 auto" }}
						>
							<span>{message}</span>
							<button
								type="button"
								className="btn-close"
								aria-label="Close"
								onClick={() => setMessage("")}
							></button>
						</div>
					)}



					<form onSubmit={handleSubmit} className="leave-form text-start">
						{/* Leave Mode */}
						<div className="mb-3">
							<label className="form-label">Leave Mode</label>
							<select
								className="form-select"
								value={leaveMode}
								onChange={(e) => setLeaveMode(e.target.value)}
							>
								<option value="single">Single Leave</option>
								<option value="multiple">Multiple Leave</option>
								<option value="restricted">Restricted</option>
							</select>
						</div>

						{/* Date Picker */}
						<div className="mb-3">
							<label className="form-label">Select Date</label>
							<DatePicker
								inline
								selected={new Date(currentDay.date)}
								minDate={today}
								maxDate={maxDate}
								dateFormat="yyyy-MM-dd"
								filterDate={(date) => {
									const dateOnly = new Date(date);
									dateOnly.setHours(0, 0, 0, 0);
									const dateStr = formatDate(dateOnly);

									// 🔒 RESTRICTED MODE
									if (leaveMode === "restricted") {
										// block past dates
										if (dateOnly < today) return false;

										// allow ONLY restricted dates
										return restrictedDates.includes(dateStr);
									}

									// 🔓 NORMAL MODE
									const day = dateOnly.getDay();
									const isWeekend = day === 0 || day === 6;
									const isAdded = addedLeaves.some((l) => l.date === dateStr);

									return !isWeekend && !isAdded;
								}}
								onChange={(date) => {
									if (!date) return;
									setCurrentDay({ ...currentDay, date: formatDate(date) });
								}}
							/>

						</div>

						{/* Leave Type */}
						{leaveMode !== "restricted" && (
							<div className="mb-3">
								<label className="form-label">Leave Type</label>
								<select
									className="form-select"
									value={currentDay.leave_type}
									onChange={handleLeaveTypeChange}
								>
									<option value="full_day">Full Day</option>
									<option value="half">Half Day</option>
									<option value="short">Short Leave</option>
								</select>
							</div>
						)}

						{/* Session */}
						{leaveMode !== "restricted" &&
							(currentDay.leave_type === "half" ||
								currentDay.leave_type === "short") && (
								<div className="mb-3">
									<label className="form-label">Session</label>
									<div className="d-flex gap-3">
										<div className="form-check">
											<input
												type="radio"
												className="form-check-input"
												value="morning"
												id="input-morning"
												checked={currentDay.session === "morning"}
												onChange={handleSessionChange}
											/>
											<label className="form-check-label" htmlFor="input-morning">Morning</label>
										</div>
										<div className="form-check">
											<input
												type="radio"
												className="form-check-input"
												id="input-evening"
												value="evening"
												checked={currentDay.session === "evening"}
												onChange={handleSessionChange}
											/>
											<label className="form-check-label" htmlFor="input-evening">Evening</label>
										</div>
									</div>
								</div>
							)}

						{leaveMode === "multiple" && (
							<button
								type="button"
								className="btn btn-secondary mb-3"
								onClick={handleAddDay}
							>
								Add Day
							</button>
						)}

						{/* Multiple Leave Table */}
						{leaveMode === "multiple" && addedLeaves.length > 0 && (
							<div className="table-responsive mb-3">
								<table className="table table-bordered">
									<thead>
										<tr>
											<th>Date</th>
											<th>Leave Type</th>
											<th>Session</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{addedLeaves.map((l) => (
											<tr key={l.date}>
												<td>{l.date}</td>
												<td>{l.leave_type}</td>
												<td>{l.session || "-"}</td>
												<td>
													<button
														type="button"
														className="btn btn-danger btn-sm"
														onClick={() => handleDeleteDay(l.date)}
													>
														Delete
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}


						{/* Reason */}
						<div className="mb-3">
							<label className="form-label">Reason</label>
							<textarea
								className="form-control"
								rows="3"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								required
							/>
						</div>

						<button className="btn btn-primary" disabled={loading}>
							{loading ? "Submitting..." : "Submit Leave"}
						</button>

					</form>
				</div>
			</div>
		</div>
	);
};
