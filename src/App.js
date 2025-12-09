import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import "./App.css";
import { ProtectedRoute, PublicRoute, LeaveForm, Register, ResetPassword, ForgotPassword, Login } from "./component";
import { Home } from "./pages/Home.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { AuthContext, AuthProvider } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
	const { token } = useContext(AuthContext);
	return token ? children : <Navigate to="/login" />;
};

function App() {
	return (
		<div className="App">
			<AuthProvider>
				{/* <BrowserRouter> */}
				<BrowserRouter basename="/leaveapplication">
					<Routes>
						<Route path="/send-mail" element={<ProtectedRoute><LeaveForm /></ProtectedRoute>} />
						<Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
						{/* <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} /> */}
						{/* <Route path="/" element={<Home />} /> */}
						<Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
						<Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</div>
	);
}

export default App;
