import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext.js";
import "./Register.css";

export const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
        name,
        email,
        password,
      });
      if (res) {
        login(res.data.token);
        navigate("/send-mail");
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || "";
      const fieldErrors = {};

      if (backendMessage.includes("name"))
        fieldErrors.name = "Name is required";
      if (backendMessage.includes("email"))
        fieldErrors.email = "Email is required";

      // Custom message for duplicate email
      if (
        backendMessage.includes("Email already registered") ||
        backendMessage.includes("duplicate key")
      ) {
        fieldErrors.email = "Email already registered";
      }

      if (backendMessage.includes("password"))
        fieldErrors.password = "Password is required";

      setErrors(fieldErrors);
      console.error(backendMessage);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="error-text">{errors.name}</p>}

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <p className="error-text">{errors.email}</p>
        {/* {errors.email && <p className="error-text">{errors.email}</p>} */}

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};
