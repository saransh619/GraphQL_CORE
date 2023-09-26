const express = require("express");
let userList = require("./mock-data.json");
const {graphqlHTTP} = require("express-graphql");
const {
    GraphQLID,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull
} = require("graphql");
const app = express();
// user schema creation
const userType = new GraphQLObjectType({
    name: "UserType",
    fields: {
        id: {
            type: GraphQLID
        },
        name: {
            type: GraphQLString
        },
        email: {
            type: GraphQLString
        },
        message: {
            type: GraphQLString
        }
    }
});
const query = new GraphQLObjectType({
    name: "query",
    fields: {
        users: {
            type: new GraphQLList(userType),
            resolve() {
                return userList
            }
        },
        user: {
            type: userType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID),
                },
            },
            resolve(parent, args) {
                return userList.find((user) => user.id === parseInt(args.id))
            }
        }
    
}});
//mutation
const mutation = new GraphQLObjectType({
    name: "mutations",
    fields: {
        //adding a user
        addUser: {
            type: userType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                email: {
                    type: new GraphQLNonNull(GraphQLString)
                }, 
                message:{
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(parent, {
                name,
                email,
                message
            }) {
                const newUser = {
                    name,
                    email,
                    message,
                    id: Date.now()
                }
                userList.push(newUser)
                return {
                    ...newUser,
                    message: "user added successully"
                }
            }
        },
        deleteUser: {
            type: userType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve(parent, {
                id
            }) {
                const user = userList.find((u) => u.id === parseInt(id));
                if (!user) throw new Error(`User with id: ${id} not found`)
                userList = userList.filter(u => u.id !== parseInt(id))
                return user
            }
        },
        updateUser: {
            type: userType,
            args: {
                id: {
                    type: GraphQLID
                },
                name: {
                    type: GraphQLString
                },
                email: {
                    type: GraphQLString
                },
                message:{
                    type: GraphQLString
                }
            },
            resolve(parent, {
                id,
                name,
                email,
                message
            }) {
                const user = userList.find(u => u.id === parseInt(id));
                if (!user) throw new Error(`User with id: ${id} not found`);
                user.email = email;
                user.name = name;
                user.message = message
                return user
            }
        }
    }
})
const schema = new GraphQLSchema({
    query,
    mutation
});
// middleware
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))
// server
app.listen(8000, () => {
    console.log('listening on server 8000');
})






