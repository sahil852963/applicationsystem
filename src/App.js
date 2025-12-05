import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import "./App.css";
import { ProtectedRoute } from "./component/ProtectedRoute";
import { PublicRoute } from "./component/PublicRoute";
import { LeaveForm } from "./component/LeaveForm/LeaveForm.jsx";
import { Register } from "./component/Authentication/Register/Register.jsx";
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
