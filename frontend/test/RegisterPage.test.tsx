import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';
import { RegisterPage } from '../src/pages/RegisterPage';

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  it('shows the field hints', () => {
    renderRegister();

    expect(screen.getByText('2 to 80 characters')).toBeInTheDocument();
    expect(screen.getByText('You will sign in with this')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('shows an error after leaving a field empty', async () => {
    renderRegister();

    await userEvent.click(screen.getByLabelText('Email'));
    await userEvent.tab();

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });

  it('complains about a half typed email', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText('Email'), 'kaif@');
    await userEvent.tab();

    expect(await screen.findByText('That does not look like an email')).toBeInTheDocument();
  });

  it('does not post an invalid form', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    renderRegister();

    await userEvent.type(screen.getByLabelText('Name'), 'K');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
