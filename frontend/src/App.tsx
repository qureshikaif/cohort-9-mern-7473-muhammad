import { useState } from 'react';
import Login from './Login';
import Notes from './Notes';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') ?? '');

  function login(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken('');
  }

  return (
    <div className="desk-glow min-h-screen px-5 py-10">
      {token ? <Notes token={token} onLogout={logout} /> : <Login onLogin={login} />}
    </div>
  );
}
