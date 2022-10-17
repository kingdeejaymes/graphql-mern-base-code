//const { projects, clients } = require('../sampleData');

// Mongoose Models
const Project = require('../models/Project');
const Client = require('../models/Client');

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
} = require("graphql");

const { query } = require('express');

const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString},
        description: { type: GraphQLString},
        status: { type: GraphQLString},
        client: {
            type: ClientType,
            resolve(parent, args) {
                //return clients.find(client => client.id === parent.clientId);
                return Client.findById(parent.clientId)
            }
        }
    })
});

const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString},
        email: { type: GraphQLString},
        phone: { type: GraphQLString},
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // Search All Projects
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args) {
                //return projects; // from sampleData.js
                return Project.find();
            }
        },
        // Search project by ID
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID }},
            resolve (parent, args) {
                //return projects.find(project => project.id === args.id); // from sampleData.js
                return Project.findById(args.id);
            }
        },
        // Search All Clients
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find();
            }
        },
        // Search client by ID
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID }},
            resolve (parent, args) {
                // return clients.find(client => client.id === args.id); // 
                return Client.findById(args.id);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});