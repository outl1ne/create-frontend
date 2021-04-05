import helmet from 'helmet';
import crypto from 'crypto';

export const defaultOpts = {
  hsts: {
    includeSubDomains: false,
  },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'font-src': ["'self'", __DEVELOPMENT__ && 'localhost:*', 'fonts.gstatic.com'].filter(Boolean),
      'img-src': ["'self'", __DEVELOPMENT__ && 'localhost:*', '*', 'data:'].filter(Boolean),
      'media-src': ["'self'", __DEVELOPMENT__ && 'localhost:*', '*', 'data:'].filter(Boolean),
      'default-src': ["'self'", __DEVELOPMENT__ && 'localhost:*', __DEVELOPMENT__ && 'ws://localhost:*'].filter(
        Boolean
      ),
      'script-src': [
        "'self'",
        __DEVELOPMENT__ && 'localhost:*',
        (_, res) => `'nonce-${res.locals.cspNonce}'`,
        'www.google-analytics.com',
        'ajax.googleapis.com',
        'https://www.googletagmanager.com',
      ].filter(Boolean),
      'style-src': ["'self'", "https: 'unsafe-inline'", 'fonts.googleapis.com'],
      'connect-src': [
        "'self'",
        __DEVELOPMENT__ && 'localhost:*',
        __DEVELOPMENT__ && 'ws://localhost:*',
        'https://www.google-analytics.com',
      ].filter(Boolean),
    },
  },
};

/**
 * Wrapper around helmet that provides defaults that work in local development, and generates a nonce for CSP
 * https://helmetjs.github.io/
 *
 * @param {object | function} opts - Options that get passed to helmet. If a function is passed, it receives the default options as an argument, and should return the options object.
 */
export default function getHelmetMiddleware(opts = defaultOpts) {
  const helmetMiddleware = helmet(typeof opts === 'function' ? opts({ ...defaultOpts }) : opts);

  return (req, res, next) => {
    if (!res.locals.cspNonce) {
      res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
    }

    return helmetMiddleware(req, res, next);
  };
}
