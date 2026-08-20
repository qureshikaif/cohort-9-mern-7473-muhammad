// kept separate because jest cannot parse import.meta
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';
