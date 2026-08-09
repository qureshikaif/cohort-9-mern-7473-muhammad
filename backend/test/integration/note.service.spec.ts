import { expect } from 'chai';
import { prisma } from '../../src/config/prisma.js';
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from '../../src/services/note.service.js';
import { createUser, resetDatabase, statusFrom } from './helpers.js';

const defaults = { page: 1, limit: 20 };

describe('note service (integration)', () => {
  beforeEach(resetDatabase);
  after(() => prisma.$disconnect());

  it('creates a note and reads it back', async () => {
    const { user } = await createUser();

    const created = await createNote(user.id, { title: 'Groceries', content: '<p>Milk</p>' });
    const found = await getNote(user.id, created.id);

    expect(found.title).to.equal('Groceries');
    expect(found.content).to.equal('<p>Milk</p>');
  });

  describe('ownership', () => {
    it('hides another user notes from the list', async () => {
      const mine = await createUser();
      const theirs = await createUser();
      await createNote(mine.user.id, { title: 'Mine', content: '' });
      await createNote(theirs.user.id, { title: 'Theirs', content: '' });

      const result = await listNotes(mine.user.id, defaults);

      expect(result.total).to.equal(1);
      expect(result.items[0]?.title).to.equal('Mine');
    });

    it('reports another user note as 404 rather than 403', async () => {
      const mine = await createUser();
      const theirs = await createUser();
      const note = await createNote(theirs.user.id, { title: 'Theirs', content: '' });

      expect(await statusFrom(() => getNote(mine.user.id, note.id))).to.equal(404);
    });

    it('refuses an update from a non-owner and leaves the note untouched', async () => {
      const mine = await createUser();
      const theirs = await createUser();
      const note = await createNote(theirs.user.id, { title: 'Theirs', content: '' });

      const status = await statusFrom(() =>
        updateNote(mine.user.id, note.id, { title: 'Hijacked' })
      );

      expect(status).to.equal(404);
      expect((await getNote(theirs.user.id, note.id)).title).to.equal('Theirs');
    });

    it('refuses a delete from a non-owner and leaves the note in place', async () => {
      const mine = await createUser();
      const theirs = await createUser();
      const note = await createNote(theirs.user.id, { title: 'Theirs', content: '' });

      expect(await statusFrom(() => deleteNote(mine.user.id, note.id))).to.equal(404);
      expect(await prisma.note.count({ where: { id: note.id } })).to.equal(1);
    });
  });

  describe('updating and deleting', () => {
    it('applies a partial update and leaves the other field alone', async () => {
      const { user } = await createUser();
      const note = await createNote(user.id, { title: 'Draft', content: '<p>body</p>' });

      const updated = await updateNote(user.id, note.id, { title: 'Final' });

      expect(updated.title).to.equal('Final');
      expect(updated.content).to.equal('<p>body</p>');
    });

    it('removes the note for its owner', async () => {
      const { user } = await createUser();
      const note = await createNote(user.id, { title: 'Temporary', content: '' });

      await deleteNote(user.id, note.id);

      expect(await statusFrom(() => getNote(user.id, note.id))).to.equal(404);
    });

    it('reports 404 for an id that does not exist', async () => {
      const { user } = await createUser();
      const missing = '3f0c1e5a-9b8d-4c7e-8f2a-1d6b5c4e3a20';

      expect(await statusFrom(() => deleteNote(user.id, missing))).to.equal(404);
    });
  });

  describe('listing', () => {
    it('matches the search term against title and content, ignoring case', async () => {
      const { user } = await createUser();
      await createNote(user.id, { title: 'Sprint planning', content: '' });
      await createNote(user.id, { title: 'Recipe', content: '<p>Needs PLANNING ahead</p>' });
      await createNote(user.id, { title: 'Unrelated', content: '' });

      const result = await listNotes(user.id, { ...defaults, search: 'planning' });

      expect(result.total).to.equal(2);
    });

    it('paginates and reports the unpaginated total', async () => {
      const { user } = await createUser();
      for (const title of ['one', 'two', 'three']) {
        await createNote(user.id, { title, content: '' });
      }

      const page = await listNotes(user.id, { page: 2, limit: 2 });

      expect(page.items).to.have.lengthOf(1);
      expect(page.total).to.equal(3);
    });

    it('returns the most recently updated note first', async () => {
      const { user } = await createUser();
      const first = await createNote(user.id, { title: 'First', content: '' });
      await createNote(user.id, { title: 'Second', content: '' });

      await updateNote(user.id, first.id, { title: 'First, edited' });
      const result = await listNotes(user.id, defaults);

      expect(result.items[0]?.title).to.equal('First, edited');
    });
  });

  it('deletes a user notes along with the user', async () => {
    const { user } = await createUser();
    await createNote(user.id, { title: 'Goes with me', content: '' });

    await prisma.user.delete({ where: { id: user.id } });

    expect(await prisma.note.count({ where: { authorId: user.id } })).to.equal(0);
  });
});
