import { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";

export const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post(`${process.env.REACT_APP_API_URL}/forgot-password`, { email });
			setMessage(res.data.message);
		} catch (err) {
			setMessage("Failed to send email");
		}
	};

	return (
		<form className="forgot-container" onSubmit={handleSubmit}>
			<h2>Forgot Password</h2>
			<input type="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} />
			<button type="submit">Send Reset Link</button>
			<p>{message}</p>
		</form>
	);
};
