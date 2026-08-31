import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';
import { AppShell } from '../src/components/AppShell';

const session = {
  user: { id: 'a1b2c3', name: 'Kaif Qureshi', email: 'kaif@example.com', role: 'USER' },
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
};

function renderShell() {
  localStorage.setItem('notes-app.session', JSON.stringify(session));

  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<h1>Your notes</h1>} />
            <Route path="login" element={<h1>Sign in</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('has the three links', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
  });

  it('renders whatever the route puts inside', () => {
    renderShell();

    expect(screen.getByText('Your notes')).toBeInTheDocument();
  });

  it('collapsing hides the label text but keeps the link', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('expanding brings the text back', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));

    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('remembers that it was collapsed', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(localStorage.getItem('notes-app.sidebar')).toBe('collapsed');
  });

  it('starts collapsed if that is what was saved', () => {
    localStorage.setItem('notes-app.sidebar', 'collapsed');
    renderShell();

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });
});

describe('UserMenu', () => {
  it('shows the initials and the name', () => {
    renderShell();

    expect(screen.getByText('KQ')).toBeInTheDocument();
    expect(screen.getByText('Kaif Qureshi')).toBeInTheDocument();
  });

  it('opens on click and shows the email', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: /Kaif Qureshi/ }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('kaif@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Your profile' })).toBeInTheDocument();
  });

  it('escape shuts it', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: /Kaif Qureshi/ }));
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking away shuts it', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: /Kaif Qureshi/ }));
    await userEvent.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('signing out clears the session and goes to login', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    } as Response);

    renderShell();

    await userEvent.click(screen.getByRole('button', { name: /Kaif Qureshi/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(await screen.findByText('Sign in')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('notes-app.session')).toBeNull());
  });

  it('signs out even when the logout call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    renderShell();

    await userEvent.click(screen.getByRole('button', { name: /Kaif Qureshi/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(await screen.findByText('Sign in')).toBeInTheDocument();
  });
});
