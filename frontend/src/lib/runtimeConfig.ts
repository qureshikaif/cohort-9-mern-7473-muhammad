export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';

// the websocket upgrade does not go through the vite proxy, so it hits the api directly
export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8080';
