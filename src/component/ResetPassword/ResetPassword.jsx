import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export const ResetPassword = () => {
	const [password, setPassword] = useState("");
	const { token } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		await axios.post(`${process.env.REACT_APP_API_URL}/reset-password/${token}`, { password });
		navigate("/login");
	};

	return (
		<form className="reset-container" onSubmit={handleSubmit}>
			<h2>Reset Password</h2>
			<input
				type="password"
				placeholder="New password"
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button type="submit">Update Password</button>
		</form>
	);
};
