function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  next();
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session.usuario) {
    return res.redirect('/dashboard');
  }

  next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
