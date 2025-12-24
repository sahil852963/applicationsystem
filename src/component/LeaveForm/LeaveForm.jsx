import Select from "react-select";
import { useContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../context/AuthContext";
import "./LeaveForm.css";
import { showToast } from "../FlashMessage.js"

export const LeaveForm = () => {

	const formatDate = (dateObj) => {
		const istDate = new Date(dateObj.getTime() + 5.5 * 60 * 60 * 1000);
		return istDate.toISOString().split("T")[0];
	};

	const leaveModeOptions = [
		{ value: "single", label: "Single Leave" },
		{ value: "multiple", label: "Multiple Leaves" },
		{ value: "restricted", label: "Restricted" },
	];

	const leaveTypeOptions = [
		{ value: "full_day", label: "Full Day" },
		{ value: "half_day", label: "Half Day" },
		{ value: "short_leave", label: "Short Leave" },
	];

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const initialState = {
		leaveMode: "single",
		currentDay: {
			date: formatDate(today),
			leave_type: "full_day",
			session: "",
		},
		addedLeaves: [],
		reason: "",
		loading: false,
	};

	const reducerFunction = (state, action) => {
		switch (action.type) {
			case "SET_LEAVE_MODE":
				return {
					...state,
					leaveMode: action.payload,
					currentDay: {
						...state.currentDay,
						date:
							action.payload === "restricted"
								? null
								: formatDate(new Date()),
					},
				};



			case "SET_CURRENT_DAY":
				return { ...state, currentDay: { ...state.currentDay, ...action.payload } };

			case "ADD_LEAVE":
				return { ...state, addedLeaves: [...state.addedLeaves, action.payload] };

			case "DELETE_LEAVE":
				return {
					...state,
					addedLeaves: state.addedLeaves.filter(l => l.date !== action.payload),
				};

			case "SET_REASON":
				return { ...state, reason: action.payload };

			case "SET_LOADING":
				return { ...state, loading: action.payload };

			case "RESET_FORM":
				return {
					...state,
					currentDay: initialState.currentDay,
					addedLeaves: [],
					reason: "",
				};

			default:
				return state;
		}
	};

	const { userEmail, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const [state, dispatch] = useReducer(reducerFunction, initialState);
	const { leaveMode, currentDay, addedLeaves, reason, loading } = state;

	const addMonths = (date, months) =>
		new Date(date.getFullYear(), date.getMonth() + months, date.getDate());

	const maxDate = addMonths(today, 1);

	const restrictedDates = [
		"2026-04-03",
		"2025-09-04",
		"2025-10-29",
	].filter((d) => new Date(d) >= today);

	const restrictedDateObjects = restrictedDates.map(d => {
		const dt = new Date(d);
		dt.setHours(0, 0, 0, 0);
		return dt;
	});


	// Logout user
	const handleLogoutClick = () => {
		logout();
		navigate("/");
	};

	// Handle Leave Type in case of multiple Leaves
	const handleLeaveTypeChange = (e) => {
		if (leaveMode === "restricted") return;
		const type = e.target.value;

		dispatch({
			type: "SET_CURRENT_DAY",
			payload: { leave_type: type, session: type === "half_day" || type === "short_leave" ? currentDay.session : "" },
		});

	};

	// Handle morning/evening session change
	const handleSessionChange = (e) => {
		dispatch({
			type: "SET_CURRENT_DAY",
			payload: { session: e.target.value },
		});
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


	// Add multiple days in case of multiple Leaves. Add btn functionality
	const handleAddDay = () => {
		if (
			(currentDay.leave_type === "half_day" || currentDay.leave_type === "short_leave") &&
			!currentDay.session
		) {
			showToast("Please select a session", "error");
			return;
		}

		if (addedLeaves.some((l) => l.date === currentDay.date)) {
			showToast("This date is already added", "error");
			return;
		}

		if (currentDay.leave_type === "short_leave") {
			const prevDate = getPreviousDate(currentDay.date);
			const nextDate = getNextDate(currentDay.date);

			const conflict = addedLeaves.find((l) => {
				if (
					l.leave_type === "short_leave" &&
					l.date === prevDate &&
					l.session === "evening" &&
					currentDay.session === "morning"
				) {
					return true;
				}

				if (
					l.leave_type === "short_leave" &&
					l.date === nextDate &&
					l.session === "morning" &&
					currentDay.session === "evening"
				) {
					return true;
				}

				return false;
			});

			if (conflict) {
				showToast(
					"Short leave requires a gap. You cannot take short leave on consecutive sessions.",
					"error"
				);

				return;

			}
		}

		dispatch({ type: "ADD_LEAVE", payload: currentDay });

		dispatch({
			type: "SET_CURRENT_DAY",
			payload: { date: formatDate(today), leave_type: "full_day", session: "" },
		});

	};


	// Delete day from multiple leaves. Delete btn functionality
	const handleDeleteDay = (date) => {
		dispatch({ type: "DELETE_LEAVE", payload: date });
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (reason.trim() === "") {
			showToast("Please add Reason for Leave", "warning");
			return;
		}

		if (!currentDay.date && leaveMode === "restricted") {
			showToast("Select date for restricted leave", "error");
			return;
		}


		if (leaveMode === "multiple" && addedLeaves.length === 0) {
			showToast("Please add at least one leave day", "warning");
			return;
		}


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
			dispatch({ type: "SET_LOADING", payload: true });
			const token = localStorage.getItem("token");

			await axios.post(`${process.env.REACT_APP_API_URL}/send`, payload, {
				headers: { Authorization: `Bearer ${token}` },
			});

			showToast("Leave submitted successfully!", "success");
			dispatch({ type: "RESET_FORM" });
			dispatch({ type: "SET_REASON", payload: "" })
		} catch {
			showToast("Failed to submit leave.", "error");
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

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
					<form onSubmit={handleSubmit} className="leave-form text-start">
						{/* Leave Mode */}
						<div className="mb-3">
							<label className="form-label">Leave Mode</label>
							<Select
								options={leaveModeOptions}
								value={leaveModeOptions.find(opt => opt.value === leaveMode)}
								onChange={(selected) =>
									dispatch({
										type: "SET_LEAVE_MODE",
										payload: selected.value,
									})
								}
								placeholder="Select Leave Mode"
								isSearchable={false}
								classNamePrefix="react-select"
							/>
						</div>

						{/* Date Picker */}
						<div className="mb-3">
							<DatePicker
								inline
								selected={
									leaveMode === "restricted"
										? null
										: new Date(currentDay.date)
								}
								minDate={today}
								maxDate={maxDate}
								dateFormat="yyyy-MM-dd"
								filterDate={(date) => {
									const dateOnly = new Date(date);
									dateOnly.setHours(0, 0, 0, 0);
									const dateStr = formatDate(dateOnly);

									if (leaveMode === "restricted") {
										if (dateOnly < today) return false;

										return restrictedDates.includes(dateStr);
									}

									const day = dateOnly.getDay();
									const isWeekend = day === 0 || day === 6;
									const isAdded = addedLeaves.some((l) => l.date === dateStr);

									return !isWeekend && !isAdded;
								}}
								onChange={(date) => {
									if (!date) return;
									dispatch({
										type: "SET_CURRENT_DAY",
										payload: { date: formatDate(date) },
									});
								}}
							/>

						</div>

						{/* Leave Type */}
						{leaveMode !== "restricted" && (
							<div className="mb-3">
								<label className="form-label">Leave Type</label>
								<Select
									options={leaveTypeOptions}
									value={leaveTypeOptions.find(o => o.value === currentDay.leave_type)}
									onChange={(selected) =>
										dispatch({
											type: "SET_CURRENT_DAY",
											payload: { leave_type: selected.value },
										})
									}
								/>
							</div>
						)}

						{/* Session */}
						{leaveMode !== "restricted" &&
							(currentDay.leave_type === "half_day" ||
								currentDay.leave_type === "short_leave") && (
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
												<td>{l.leave_type.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</td>
												<td>{l.session.replace(/\b\w/g, c => c.toUpperCase()) || "-"}</td>
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
								placeholder="Reason for leave . . ."
								rows="3"
								value={reason}
								onChange={(e) =>
									dispatch({ type: "SET_REASON", payload: e.target.value })
								}
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
