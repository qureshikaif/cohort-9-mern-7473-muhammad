import { expect } from 'chai';
import { ApiError } from '../src/utils/ApiError.js';

describe('ApiError', () => {
  it('notFound gives 404', () => {
    const err = ApiError.notFound('user not found');

    expect(err.statusCode).to.equal(404);
    expect(err.message).to.equal('user not found');
  });

  it('badRequest gives 400', () => {
    const err = ApiError.badRequest('bad request');

    expect(err.statusCode).to.equal(400);
    expect(err.message).to.equal('bad request');
  });

  it('unauthorized gives 401 with a default message', () => {
    const err = ApiError.unauthorized();

    expect(err.statusCode).to.equal(401);
    expect(err.message).to.equal('Unauthorized');
  });

  it('is a real Error and is operational', () => {
    const err = ApiError.notFound('user not found');

    expect(err).to.be.instanceOf(Error);
    expect(err.isOperational).to.equal(true);
  });

  it('can be built by hand with any status code', () => {
    const err = new ApiError(422, 'unprocessable');
    expect(err.statusCode).to.equal(422);
    expect(err.details).to.equal(undefined);
  });

  it('keeps the details object', () => {
    const err = new ApiError(422, 'unprocessable', { field: 'email' });

    expect(err.details).to.deep.equal({ field: 'email' });
  });
});
