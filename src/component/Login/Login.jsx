import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { showToast } from "../FlashMessage.js"

export const Login = () => {
	const { login } = useContext(AuthContext);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		
		e.preventDefault();
		try {
			setLoading(true);
			const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
				email,
				password,
			});

			if (res) {
				login(res.data.token, res.data.user.email);
				navigate("/send-mail");
			}
		} catch (err) {
			setLoading(false);
			const message =
				err.response?.data?.message ||
				err.response?.data ||
				"Something went wrong. Try again!";
				showToast(message, "error");
			
			console.error(err.response?.data);
		}
	};

	return (
		<div className="login-wrapper">
			<h1 className="text-center mb-4 login-title">Leave Application System</h1>
			<div className="card shadow-lg p-4 login-card">
					<h4 className="text-center mb-4">Login</h4>

					<form onSubmit={handleSubmit}>

						<div className="mb-3">
							<label className="form-label text-start w-100">Email</label>
							<input
								type="email"
								className="form-control"
								placeholder="Enter email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="mb-3">
							<label className="form-label text-start w-100">Password</label>
							<input
								type="password"
								className="form-control"
								placeholder="Enter password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<button className="btn btn-primary w-100 mt-2" disabled={loading}>
							{loading ? "Loading..." : "Login"}
						</button> 
					</form>
			</div>
		</div>
	);
};
