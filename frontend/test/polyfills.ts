import { TextDecoder, TextEncoder } from 'node:util';

// jsdom has neither and react-router needs TextEncoder on import
Object.assign(globalThis, { TextEncoder, TextDecoder });
