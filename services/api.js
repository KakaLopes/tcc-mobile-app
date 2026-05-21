import axios from "axios";

const api = axios.create({
  baseURL: "https://neil-suitable-collect-simulation.trycloudflare.com",
});

export default api;