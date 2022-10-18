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
  GraphQLNonNull,
  GraphQLEnumType,
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

// Mutations
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add Client
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {

                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                });
                
                return client.save();
            }
        },
        // Delete Client
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                return Client.findByIdAndRemove(args.id);
            }
        },
        // Add Project
        addProject: {
            type: ProjectType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                status: { 
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': { value: 'Not Starter' },
                            'progress': { value: 'In Progress' },
                            'completed': { value: 'Completed' },
                        }
                    }),
                    defaultValue: 'Not Started'
                },
                clientId: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                });

                return project.save();
            }
        },
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Project.findByIdAndRemove(args.id);
            }
        },
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: { 
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            'new': { value: 'Not Starter' },
                            'progress': { value: 'In Progress' },
                            'completed': { value: 'Completed' },
                        }
                    })
                },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(
                    args.id, 
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status
                        },
                    },
                    {
                        new: true
                    }
                );
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});