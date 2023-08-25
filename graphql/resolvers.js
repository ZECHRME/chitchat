const { User , Message } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError, AuthenticationError } = require('apollo-server');
const { JWT_SECRET } = require('../config/env.json')
const { Op }=require('sequelize')
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if(!user) throw new AuthenticationError('Unauthenticated')
        
        let users = await User.findAll({
          attributes: ['username', 'email', 'createdAt'],
          where: {username: {[Op.ne]: user.username}}
        })

        let allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [['createdAt', 'DESC']],
        })

        users = users.map(otherUser => {
          const latestMessage = allUserMessages.find(
            m => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        })


        return users
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    login: async (_, args) => {
      const { username , password } = args
      let errors = {}

      try {

        if (username.trim() == '') errors.email = 'email must not be empty'
        if (password == '') errors.password = 'password must not be empty'

        const user = await User.findOne({
          where: { username }
        })

        if (!user) {
          errors.username = 'email not found'
          throw new UserInputError('username not found', { errors })
        }

        const correctPassword = await bcrypt.compare(password, user.password)

        if (!correctPassword) {
          errors.password = 'password is incorrect'
          throw new AuthenticationError('password not matching', { errors })
        }

        const token = jwt.sign(
          { username },
          JWT_SECRET,
          { expiresIn: 60 * 60 }
        );

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        }

      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getMessages: async (parent,{ from },{ user }) =>{
      try {
        if(!user) throw new AuthenticationError('unauthen')

        const otherUser = await User.findOne({
          where:{ username : from }
        })

        if(!otherUser) throw new AuthenticationError('unauthen')
      
        const usernames = [user.username , otherUser.username]

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usernames},
            to: { [Op.in]: usernames},
          },
          order: [['createdAt','DESC']]
        })

        const formattedMessages = messages.map(message => ({
          ...message.dataValues,
          createdAt: new Date(message.createdAt).toISOString(), // Convert to ISO string
        }));

        return formattedMessages;

      } catch (err) {
        console.log(err)
      }
    }
  },
  Mutation: {
    register: async (_, args,) => {
      let { username, email, password, confirmPassword } = args
      let errors = {}


      try {
        //validate
        
        if (username.trim() == '') errors.username = 'username is empty'
        if (email.trim() == '') errors.email = 'Email is empty'
        if (password.trim() == '') errors.password = 'password is empty'
        if (confirmPassword.trim() == '') errors.confirmPassword = 'confirmPassword is empty'
        if (password != confirmPassword) errors.confirmPassword = 'passwords must be same'

        //username exists
        const userByusername = await User.findOne({ where: { username } })
        if (userByusername) errors.username = 'username is taken'

        const userByemail = await User.findOne({ where: { email } })
        if (userByemail) errors.email = 'email is taken'

        


        if (Object.keys(errors).length > 0) {
          throw errors
        }


        //hashpass
        password = await bcrypt.hash(password, 4)

        //create user
        const user = await User.create({
          username, email, password
        })


        //return user
        return user


      } catch (err) {
        console.log(err)
        if (err.name === 'SequelizeValiationError') {
          err.errors.forEach(e => errors[e.path] = e.message)
        }
        throw new UserInputError('wrong inp', { errors: err })
      }
    },

    sendMessage: async (parent, { to, content }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');
    
        const receiver = await User.findOne({ where: { username: to } });
    
        if (!receiver) {
          throw new UserInputError('User not found');
        }
    
        if(receiver.username ==user.username ) throw new UserInputError('do not txt urself')

        if (content.trim() === '') throw new UserInputError('No message content');
    
        const message = await Message.create({
          from: user.username, // Set the 'from' field to the authenticated user's username
          to,
          content,
        });

        pubsub.publish('NEW_MESSAGE', { newMessage: message });
    
        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },    
  },

  Subscription: {
    newMessage: { 
      subscribe: () => pubsub.asyncIterator('NEW_MESSAGE')
    }
  }
}