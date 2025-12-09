import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [userEmail, setUserEmail] = useState(JSON.parse(localStorage.getItem("userEmail")));

	const login = (authToken, userEmail) => {
		setToken(authToken);
		setUserEmail(userEmail);

		localStorage.setItem("token", authToken);
		localStorage.setItem("userEmail", JSON.stringify(userEmail));
	};

	const logout = () => {
		setToken(null);
		setUserEmail(null);

		localStorage.removeItem("token");
		localStorage.removeItem("userEmail");
	};

	return (
		<AuthContext.Provider value={{ token, userEmail, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
