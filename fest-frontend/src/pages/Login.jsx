import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AnimatedPerson from "./AnimatedPerson";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem("email", email);

      if (res.data.next === "otp") navigate("/verify");
      else if (res.data.next === "setup") navigate("/setup");
    } catch {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="float-circle c1" />
      <div className="float-circle c2" />
      <div className={`auth-card ${entered ? "enter" : ""}`}>
        <AnimatedPerson
          mode={
            focus === "password"
              ? "password"
              : focus === "email"
              ? "email"
              : "idle"
          }
        />
        <h2 className="auth-title">Welcome back</h2>
        <div className="auth-subtitle">
          Sign in to access the Fest Admin dashboard
        </div>

        <input
          className="auth-input input-1"
          placeholder="Email"
          value={email ?? ""}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocus("email")}
          onBlur={() => setFocus("")}
        />
        <div className="input-underline" />

        <input
          className="auth-input input-2"
          type="password"
          placeholder="Password"
          value={password ?? ""}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocus("password")}
          onBlur={() => setFocus("")}
        />
        <div className="input-underline" />

        <button
          className={`primary-btn ${loading ? "loading" : ""}`}
          onClick={login}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
