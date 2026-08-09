import { TextDecoder, TextEncoder } from 'node:util';

// jsdom ships neither, and react-router reads TextEncoder while it is being
// imported. This runs in setupFiles so it lands before any test module loads.
Object.assign(globalThis, { TextEncoder, TextDecoder });
