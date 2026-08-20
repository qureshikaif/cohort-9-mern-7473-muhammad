import { expect } from 'chai';
import { createServer, type Server } from 'node:http';
import { io as connect, type Socket } from 'socket.io-client';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { initSocket, getIO } from '../../src/sockets/index.js';
import { createUser, resetDatabase } from './helpers.js';

interface NotePayload {
  id: string;
  title?: string;
}

function nextEvent(socket: Socket, event: string, ms = 1500): Promise<NotePayload | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);

    socket.once(event, (payload: NotePayload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function connectAs(url: string, token: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = connect(url, { auth: { token }, transports: ['websocket'] });

    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });
}

describe('socket note events (integration)', () => {
  let server: Server;
  let url: string;

  before((done) => {
    server = createServer(createApp());
    initSocket(server);

    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      url = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after(async () => {
    getIO().close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  });

  beforeEach(resetDatabase);

  function createNote(token: string, title: string): Promise<Response> {
    return fetch(`${url}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, content: '' }),
    });
  }

  it('no token means no connection', async () => {
    const failure = await new Promise<string>((resolve) => {
      const socket = connect(url, { transports: ['websocket'] });
      socket.on('connect_error', (error: Error) => {
        socket.close();
        resolve(error.message);
      });
    });

    expect(failure).to.contain('Authentication token required');
  });

  it('a bad token is refused', async () => {
    const failure = await new Promise<string>((resolve) => {
      const socket = connect(url, { auth: { token: 'nonsense' }, transports: ['websocket'] });
      socket.on('connect_error', (error: Error) => {
        socket.close();
        resolve(error.message);
      });
    });

    expect(failure).to.contain('Invalid or expired token');
  });

  it('the author gets note:created', async () => {
    const { accessToken } = await createUser();
    const socket = await connectAs(url, accessToken);

    const received = nextEvent(socket, 'note:created');
    await createNote(accessToken, 'Written elsewhere');

    const note = await received;
    socket.close();

    expect(note?.title).to.equal('Written elsewhere');
  });

  it('note:deleted carries the id', async () => {
    const { accessToken } = await createUser();
    const socket = await connectAs(url, accessToken);

    const created = await createNote(accessToken, 'Short lived');
    const { note } = (await created.json()) as { note: NotePayload };

    const received = nextEvent(socket, 'note:deleted');
    await fetch(`${url}/api/notes/${note.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect((await received)?.id).to.equal(note.id);
  });

  it('one user does not get another users note', async () => {
    const mine = await createUser();
    const theirs = await createUser();

    const mySocket = await connectAs(url, mine.accessToken);
    const eavesdrop = nextEvent(mySocket, 'note:created');

    await createNote(theirs.accessToken, 'Not for you');

    const leaked = await eavesdrop;
    mySocket.close();

    expect(leaked).to.equal(null);
  });
});
