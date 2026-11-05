const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const { query } = require('./db');
const { asyncRoute, HttpError, sendData } = require('./http');

const COOKIE_NAME = 'sicc_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const REMEMBER_TTL_SECONDS = 30 * 24 * 60 * 60;

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }
  return process.env.JWT_SECRET;
}

function publicProfile(profile) {
  const { password_hash, ...safeProfile } = profile;
  return safeProfile;
}

function setSessionCookie(res, token, maxAgeSeconds) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  });
}

async function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next(new HttpError(401, 'Please sign in to continue.'));

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const profiles = await query('SELECT * FROM profiles WHERE id = ? LIMIT 1', [payload.sub]);
    const profile = profiles[0];
    if (!profile || !profile.is_active) {
      res.clearCookie(COOKIE_NAME, { path: '/' });
      return next(new HttpError(401, 'Your account is inactive or no longer exists.'));
    }

    req.profile = publicProfile(profile);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.clearCookie(COOKIE_NAME, { path: '/' });
      return next(new HttpError(401, 'Your session has expired. Please sign in again.'));
    }
    next(error);
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      return next(new HttpError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}

function createAuthRouter() {
  const router = express.Router();

  router.post('/login', asyncRoute(async (req, res) => {
    const identifier = String(req.body?.identifier || '').trim();
    const password = String(req.body?.password || '');
    if (!identifier || !password) throw new HttpError(400, 'Enter your username or email and password.');

    const profiles = await query(
      'SELECT * FROM profiles WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1',
      [identifier, identifier],
    );
    const profile = profiles[0];
    if (!profile || !profile.is_active || !(await bcrypt.compare(password, profile.password_hash))) {
      throw new HttpError(401, 'Invalid username/email or password.');
    }

    const rememberMe = req.body?.rememberMe !== false;
    const expiresIn = rememberMe ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
    const token = jwt.sign({ sub: profile.id }, getJwtSecret(), { expiresIn });
    setSessionCookie(res, token, expiresIn);
    return sendData(res, { user: { id: profile.id, email: profile.email }, profile: publicProfile(profile) });
  }));

  router.get('/me', authenticate, (req, res) => {
    sendData(res, {
      user: { id: req.profile.id, email: req.profile.email },
      profile: req.profile,
    });
  });

  router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    sendData(res, { success: true });
  });

  return router;
}

module.exports = { authenticate, createAuthRouter, getJwtSecret, publicProfile, requireRoles };
