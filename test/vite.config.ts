import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permet au serveur d'écouter sur toutes les interfaces réseau
    port: 5173, // Assurez-vous que le port est correct
  },
});
