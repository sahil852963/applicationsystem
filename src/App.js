import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import "./App.css";
import { ProtectedRoute } from "./component/ProtectedRoute";
import { PublicRoute } from "./component/PublicRoute";
import { LeaveForm } from "./component/LeaveForm/LeaveForm.jsx";
import { Register } from "./component/Authentication/Register/Register.jsx";
import { ResetPassword } from "./component/Authentication/ResetPassword/ResetPassword.jsx";
import { ForgotPassword } from "./component/Authentication/ForgotPassword/ForgotPassword.jsx";
import { Login } from "./component/Authentication/Login/Login.jsx";
import { Home } from "./pages/Home.jsx";
import { AuthContext, AuthProvider } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/send-mail" element={<ProtectedRoute><LeaveForm /></ProtectedRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<Home />} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
