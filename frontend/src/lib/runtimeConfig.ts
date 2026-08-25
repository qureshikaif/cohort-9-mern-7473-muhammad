export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';

// websockets skip the vite proxy
export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8080';
