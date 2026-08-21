import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';
import { LoginPage } from '../src/pages/LoginPage';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Your notes</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const session = {
  user: { id: 'u1', name: 'Kaif', email: 'kaif@example.com', role: 'USER' },
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
};

describe('LoginPage', () => {
  it('renders the form', () => {
    renderLogin();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('does not call the api when the form is empty', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs in and goes to the dashboard', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => session,
    } as Response);

    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'kaif@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'long-enough-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Your notes')).toBeInTheDocument();
    expect(localStorage.getItem('notes-app.session')).toContain('access-1');
  });

  it('shows the error for a wrong password', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid email or password' }),
    } as Response);

    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'kaif@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(localStorage.getItem('notes-app.session')).toBeNull();
    expect(screen.queryByText('Your notes')).not.toBeInTheDocument();
  });

  it('shows an error when the api is down', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'kaif@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'long-enough-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });
});
