import { expect } from 'chai';
import {
  createNoteSchema,
  listNotesSchema,
  noteIdSchema,
  updateNoteSchema,
} from '../src/validators/note.validator.js';

describe('createNoteSchema', () => {
  it('content defaults to an empty string', () => {
    const parsed = createNoteSchema.parse({ title: 'Groceries' });

    expect(parsed.content).to.equal('');
  });

  it('trims the title', () => {
    const parsed = createNoteSchema.parse({ title: '  Groceries  ' });

    expect(parsed.title).to.equal('Groceries');
  });

  it('title cannot be just spaces', () => {
    const result = createNoteSchema.safeParse({ title: '   ' });

    expect(result.success).to.equal(false);
  });
});

describe('updateNoteSchema', () => {
  it('title on its own is fine', () => {
    expect(updateNoteSchema.safeParse({ title: 'New title' }).success).to.equal(true);
  });

  it('content on its own is fine', () => {
    expect(updateNoteSchema.safeParse({ content: '<p>body</p>' }).success).to.equal(true);
  });

  it('rejects an empty update', () => {
    const result = updateNoteSchema.safeParse({});

    expect(result.success).to.equal(false);
  });
});

describe('noteIdSchema', () => {
  it('accepts a uuid', () => {
    const result = noteIdSchema.safeParse({ id: '11111111-1111-1111-1111-111111111111' });

    expect(result.success).to.equal(true);
  });

  it('rejects a bad id', () => {
    const result = noteIdSchema.safeParse({ id: '42' });

    expect(result.success).to.equal(false);
  });
});

describe('listNotesSchema', () => {
  it('defaults for an empty query', () => {
    const parsed = listNotesSchema.parse({});

    expect(parsed.page).to.equal(1);
    expect(parsed.limit).to.equal(20);
  });

  it('page and limit arrive as strings', () => {
    const parsed = listNotesSchema.parse({ page: '3', limit: '5' });

    expect(parsed.page).to.equal(3);
    expect(parsed.limit).to.equal(5);
  });

  it('limit cannot go over 50', () => {
    const result = listNotesSchema.safeParse({ limit: '5000' });

    expect(result.success).to.equal(false);
  });
});
