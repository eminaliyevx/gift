import defaultAxios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const axios = defaultAxios.create({
  baseURL: "/api",
});

axios.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

export default axios;
