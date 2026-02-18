import axios from "axios";

const api = axios.create({
  baseURL: "/api", // через прокси
});

export default api;
