const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // yung tokens.token to make sure na user is part of token array, ddelete sya pag nglogout na
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})

    if(!user) {
      throw new Error()
    }
    // para kung sng device m lng gnmt ska sya mllogout 
    req.token = token
    req.user = user
    next()
  } catch(e) {
    res.status(401).send({error: 'Please authenticate'})
  }
}

module.exports = auth