import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        email,
        code
      });
      localStorage.setItem("email", email);
      navigate("/setup");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="center">
      <h2>Register</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Registration Code" onChange={e => setCode(e.target.value)} />
      <button onClick={register}>Register</button>
      <p onClick={() => navigate("/")}>Already registered? Login</p>
    </div>
  );
}
