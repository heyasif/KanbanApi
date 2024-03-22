const Access = (...allowedRoles) => async (req, res, next) => {
  if (allowedRoles.includes(req.role)) {
    next()
  } else {
    res.status(403).json({ Message: `${req.role} is not allowed` })
  }
}

module.exports = Access
