import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import express from 'express';
import http from 'http';
import typeDefs from './graphQL/typeDefs/index'
import resolvers from './graphQL/resolvers/index'
import { makeExecutableSchema } from '@graphql-tools/schema'
import * as dotenv from 'dotenv'
import { GraphQLContext, Session } from './utils/types'

async function main() {
  dotenv.config()
  const app = express();
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const corsParams = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  }

  // Context params
  const prisma = new PrismaClient()

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    context: async ({ req, res }): Promise<GraphQLContext> => {
      const session = await getSession({ req }) as Session
      
      return { session, prisma }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,
    cors: corsParams,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: '/'
  });

  // Modified server startup
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

}

main().catch((err) => console.log('error'))