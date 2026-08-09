import '@testing-library/jest-dom';

beforeAll(() => {
  // Queried during render for the colour scheme and the reduced-motion setting.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  window.scrollTo = () => {};
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});
