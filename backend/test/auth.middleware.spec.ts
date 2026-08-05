import { expect } from 'chai';
import type { NextFunction, Request, Response } from 'express';
import { authenticate, authorize } from '../src/middlewares/index.js';
import { ApiError } from '../src/utils/ApiError.js';
import { signAccessToken } from '../src/utils/jwt.js';

const res = {} as Response;
const noop = (() => {}) as NextFunction;

function reqWith(authorization?: string): Request {
  return { headers: authorization === undefined ? {} : { authorization } } as Request;
}

/** Runs fn and reports the ApiError status it threw, or undefined if it did not throw. */
function statusFrom(fn: () => void): number | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error instanceof ApiError ? error.statusCode : -1;
  }
}

describe('authenticate', () => {
  const token = signAccessToken({ sub: 'user-1', role: 'USER' });

  it('accepts the Bearer scheme in any case', () => {
    for (const scheme of ['Bearer', 'bearer', 'BEARER', 'BeArEr']) {
      const req = reqWith(`${scheme} ${token}`);
      let passed = false;

      authenticate(req, res, (() => {
        passed = true;
      }) as NextFunction);

      expect(passed, scheme).to.equal(true);
      expect(req.user?.sub, scheme).to.equal('user-1');
    }
  });

  it('rejects a missing or malformed header with 401', () => {
    for (const header of [undefined, '', 'Basic abc', 'Bearer', 'Bearer ']) {
      expect(statusFrom(() => authenticate(reqWith(header), res, noop)), String(header)).to.equal(
        401
      );
    }
  });

  it('rejects a token that fails verification with 401', () => {
    expect(statusFrom(() => authenticate(reqWith('Bearer not-a-real-jwt'), res, noop))).to.equal(
      401
    );
  });
});

describe('authorize', () => {
  function reqAs(role?: string): Request {
    return { headers: {}, user: role ? { sub: 'user-1', role } : undefined } as Request;
  }

  it('lets a matching role through', () => {
    let passed = false;
    authorize('ADMIN')(reqAs('ADMIN'), res, (() => {
      passed = true;
    }) as NextFunction);
    expect(passed).to.equal(true);
  });

  it('rejects a non-matching role with 403', () => {
    expect(statusFrom(() => authorize('ADMIN')(reqAs('USER'), res, noop))).to.equal(403);
  });

  it('rejects an unauthenticated request with 401', () => {
    expect(statusFrom(() => authorize('ADMIN')(reqAs(), res, noop))).to.equal(401);
  });

  it('requires only authentication when no roles are given', () => {
    let passed = false;
    authorize()(reqAs('USER'), res, (() => {
      passed = true;
    }) as NextFunction);
    expect(passed).to.equal(true);
  });
});
