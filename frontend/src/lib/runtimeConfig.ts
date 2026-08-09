// Vite replaces import.meta.env at build time. Keeping that read in its own
// module means the API client stays importable by Jest, which runs the source
// without a bundler and cannot parse import.meta.
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';
