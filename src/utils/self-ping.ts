import axios from "axios";
import cron from "node-cron";

let pingEvery7Minutes = true;
let cronTask: cron.ScheduledTask | null = null;

export function schedulePing() {
  if (!process.env.API_URL) {
    return;
  }
  if (cronTask) {
    cronTask.stop(); // Stop the current task if it exists
  }
  const interval = pingEvery7Minutes ? "*/7 * * * *" : "*/14 * * * *";
  cronTask = cron.schedule(
    interval,
    () => {
      pingServer();
      pingEvery7Minutes = !pingEvery7Minutes; // Toggle for the next execution
    },
    {
      scheduled: true,
    }
  );
}

function pingServer() {
  const url = `${process.env.API_URL}/api/health`;
  axios
    .get(url)
    .then((response) => {
      console.log("Server pinged successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error pinging server:", error);
    });
}
