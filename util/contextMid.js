const { JWT_SECRET } = require('../config/env.json')
const jwt = require('jsonwebtoken')

module.exports = async context => {
  if (context.req && context.req.headers.authorization) {
    const token = context.req.headers.authorization.split('Bearer ')[1];

    try {
      const decodedToken = await jwt.verify(token, JWT_SECRET);
      context.user = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }
  
  return context;
};
