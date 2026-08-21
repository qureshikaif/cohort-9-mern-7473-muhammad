import '@testing-library/jest-dom';

beforeAll(() => {
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
  sessionStorage.clear();
  jest.restoreAllMocks();
});
