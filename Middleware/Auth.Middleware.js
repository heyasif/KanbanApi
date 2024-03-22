const jwt = require('jsonwebtoken')
const { UserModel } = require('../Model/User.Model')

const Access = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY)
      const existingUser = await UserModel.findById(decoded.userID)

      if (!existingUser) {
        return res.status(401).json({ Message: 'User not found' })
      }

      req.id = decoded.userID
      req.role = existingUser.role

      next()
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
  } else {
    return res.status(401).json({ Message: 'Authorization token missing or malformed' })
  }
}

module.exports = Access
