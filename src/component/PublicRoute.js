import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export const PublicRoute = ({ children }) => {
	const { token, logout } = useContext(AuthContext);

	let isValid = false;

	if (token) {
		try {
			const decoded = jwtDecode(token);
			const now = Date.now() / 1000; 
			if (decoded.exp > now) {
				isValid = true; 
			} else {
				logout();
			}
		} catch (err) {
			logout();
		}
	} else {
		logout();
	}

	if (isValid) {
		return <Navigate to="/send-mail" replace />;
	}

	return children;
};
