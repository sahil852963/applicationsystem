import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = () => {
  const { login } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3500/api/login", {
        email,
        password,
      });

      if (res) {
        login(res.data.token);
        navigate("/send-mail");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Something went wrong. Try again!";
      setError(message);

      console.error(err.response.data);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="login-error">{error}</p>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
