import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>
        Go Home
      </Link>
    </div>
  );
};
