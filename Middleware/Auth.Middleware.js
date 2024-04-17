const jwt = require('jsonwebtoken')

const Access = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    console.log(token)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // console.log(decoded)

      if (decoded) {
        req.id = decoded.id
        // console.log(decoded.userID)

        next()
      }
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
  } else {
    return res.status(401).json({ Message: 'Authorization token missing or malformed' })
  }
}

module.exports = Access
