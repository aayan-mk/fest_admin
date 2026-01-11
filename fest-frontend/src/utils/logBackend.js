import axios from "axios";

export async function logActivityToBackend(action) {
  const email = localStorage.getItem("email");
  if (email) {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/activity-log`, { email, action });
    } catch (e) {
      // Optionally handle error
    }
  }
}
