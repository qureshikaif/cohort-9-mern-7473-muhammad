import { expect } from 'chai';
import { ApiError } from '../src/utils/ApiError.js';

describe('ApiError', () => {
  it('builds a 404 error via the notFound helper', () => {
    const err = ApiError.notFound('user not found');
    expect(err).to.be.instanceOf(ApiError);
    expect(err.statusCode).to.equal(404);
    expect(err.message).to.equal('user not found');
    expect(err.isOperational).to.equal(true);
  });

  it('carries a custom status code and details', () => {
    const err = new ApiError(422, 'unprocessable', { field: 'email' });
    expect(err.statusCode).to.equal(422);
    expect(err.details).to.deep.equal({ field: 'email' });
  });
});
