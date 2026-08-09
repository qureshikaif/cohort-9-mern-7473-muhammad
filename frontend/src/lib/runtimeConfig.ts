// kept separate because jest cannot parse import.meta
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';

// Socket.IO cannot go through the Vite proxy's websocket upgrade cleanly in dev,
// so it connects to the API origin directly.
export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';
