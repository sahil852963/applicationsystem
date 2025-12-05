import { useNavigate } from "react-router-dom";
import "./Home.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const Home = () => {
  const { token, logout } = useContext(AuthContext);   // get token state from AuthContext
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");  // redirect to home after logout
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Leave Application System</h1>

      <div className="home-buttons">
        {!token && (
          <>
            <button onClick={handleRegisterClick}>Register</button>
            <button onClick={handleLoginClick}>Login</button>
          </>
        )}

        {token && <button onClick={handleLogoutClick}>Logout</button>}
      </div>
    </div>
  );
};
