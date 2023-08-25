const {ApolloServer, gql} = require('apollo-server');
const { sequelize } = require('./models/index')
const contextMid = require('./util/contextMid')


// The GraphQL schema
const typeDefs = require('./graphql/typeDefs')

// A map of functions which return data for the schema.
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMid
});

server.listen().then(({url})=>{
  console.log(`🚀 Server ready at ${url}`)
  
  sequelize
    .authenticate()
    .then(()=>console.log('Database connected'))
    .catch((err)=>console.log(err))
})

