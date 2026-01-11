import { addLog } from "../utils/activityLog";

export function logActivityFromEmail(action) {
  const email = localStorage.getItem("email");
  if (email) {
    addLog(`${email} ${action}`);
  }
}
