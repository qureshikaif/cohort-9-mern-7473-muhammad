import { expect } from 'chai';
import type { NextFunction, Request, Response } from 'express';
import { authenticate, authorize } from '../src/middlewares/index.js';
import { ApiError } from '../src/utils/ApiError.js';
import { signAccessToken } from '../src/utils/jwt.js';

const fakeRes = {} as Response;
const doNothing = (() => {}) as NextFunction;

describe('authenticate', () => {
  const token = signAccessToken({ sub: 'user-1', role: 'USER' });

  it('should call next when the header says Bearer', () => {
    const req = { headers: { authorization: 'Bearer ' + token } } as Request;
    let nextWasCalled = false;

    authenticate(req, fakeRes, (() => {
      nextWasCalled = true;
    }) as NextFunction);

    expect(nextWasCalled).to.equal(true);
  });

  it('should put the user on the request', () => {
    const req = { headers: { authorization: 'Bearer ' + token } } as Request;

    authenticate(req, fakeRes, doNothing);

    expect(req.user?.sub).to.equal('user-1');
    expect(req.user?.role).to.equal('USER');
  });

  it('works with lowercase bearer', () => {
    const req = { headers: { authorization: 'bearer ' + token } } as Request;
    let called = false;
    authenticate(req, fakeRes, (() => {
      called = true;
    }) as NextFunction);
    expect(called).to.equal(true);
  });

  it('BEARER also works', () => {
    const req = { headers: { authorization: 'BEARER ' + token } } as Request;
    let called = false;
    authenticate(req, fakeRes, (() => {
      called = true;
    }) as NextFunction);
    expect(called).to.equal(true);
  });

  it('no header', () => {
    const req = { headers: {} } as Request;

    expect(() => authenticate(req, fakeRes, doNothing)).to.throw(ApiError);
  });

  it('empty header', () => {
    const req = { headers: { authorization: '' } } as Request;
    let code = 0;

    try {
      authenticate(req, fakeRes, doNothing);
    } catch (err) {
      if (err instanceof ApiError) code = err.statusCode;
    }
    expect(code).to.equal(401);
  });

  it('Basic is not allowed', () => {
    const req = { headers: { authorization: 'Basic abc' } } as Request;
    expect(() => authenticate(req, fakeRes, doNothing)).to.throw(
      'Missing or malformed Authorization header'
    );
  });

  it('bearer with no token after it', () => {
    const req = { headers: { authorization: 'Bearer' } } as Request;
    let caught: unknown;

    try {
      authenticate(req, fakeRes, doNothing);
    } catch (e) {
      caught = e;
    }

    expect(caught).to.be.instanceOf(ApiError);
    expect((caught as ApiError).statusCode).to.equal(401);
  });

  it('bad token gives 401', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-jwt' } } as Request;
    let status = 0;
    try {
      authenticate(req, fakeRes, doNothing);
    } catch (err) {
      if (err instanceof ApiError) status = err.statusCode;
    }
    expect(status).to.equal(401);
  });
});

describe('authorize', () => {
  it('should let an admin through when ADMIN is required', () => {
    const req = { headers: {}, user: { sub: 'user-1', role: 'ADMIN' } } as Request;
    let nextWasCalled = false;

    authorize('ADMIN')(req, fakeRes, (() => {
      nextWasCalled = true;
    }) as NextFunction);

    expect(nextWasCalled).to.equal(true);
  });

  it('throws 403 when a normal user asks for an admin route', () => {
    const req = { headers: {}, user: { sub: 'user-1', role: 'USER' } } as Request;
    let code = 0;

    try {
      authorize('ADMIN')(req, fakeRes, doNothing);
    } catch (err) {
      if (err instanceof ApiError) code = err.statusCode;
    }

    expect(code).to.equal(403);
  });

  it('user with no role at all', () => {
    const req = { headers: {}, user: { sub: 'user-1' } } as Request;

    expect(() => authorize('ADMIN')(req, fakeRes, doNothing)).to.throw('Insufficient permissions');
  });

  it('throws 401 when nobody is logged in', () => {
    const req = { headers: {} } as Request;
    expect(() => authorize('ADMIN')(req, fakeRes, doNothing)).to.throw('Unauthorized');
  });

  it('should let any logged in user through when no role is given', () => {
    const req = { headers: {}, user: { sub: 'user-1', role: 'USER' } } as Request;
    let nextWasCalled = false;

    authorize()(req, fakeRes, (() => {
      nextWasCalled = true;
    }) as NextFunction);

    expect(nextWasCalled).to.equal(true);
  });

  it('should allow either of two roles', () => {
    const req = { headers: {}, user: { sub: 'user-1', role: 'USER' } } as Request;
    let called = false;
    authorize('ADMIN', 'USER')(req, fakeRes, (() => {
      called = true;
    }) as NextFunction);
    expect(called).to.equal(true);
  });
});
