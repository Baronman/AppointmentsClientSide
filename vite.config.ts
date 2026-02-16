import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "AppointmentsClientSide";

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
});