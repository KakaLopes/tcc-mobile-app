import axios from "axios";

const api = axios.create({
  baseURL: "https://tcc-backend-jornada-production.up.railway.app",
});

export default api;