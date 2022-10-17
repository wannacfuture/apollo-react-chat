import { PrismaClient } from "@prisma/client"
import { getSession } from "next-auth/react"
import { ApolloServer } from "apollo-server-express"
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core"
import express from "express"
import http from "http"
import typeDefs from "./graphQL/typeDefs/index"
import resolvers from "./graphQL/resolvers/index"
import { makeExecutableSchema } from "@graphql-tools/schema"
import * as dotenv from "dotenv"
import { GraphQLContext, Session } from "./utils/types"
import { WebSocketServer } from "ws"

import { useServer } from "graphql-ws/lib/use/ws"
import { SubscriptionContext } from "./utils/types"
import { PubSub } from "graphql-subscriptions"

async function main() {
  dotenv.config()
  const app = express()
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app)

  // Create our WebSocket server using the HTTP server we just set up.
  // https://www.apollographql.com/docs/apollo-server/data/subscriptions/

  const wsServer = new WebSocketServer({
    server: httpServer,

    path: "/graphql/subscriptions",
  })

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  // Context params
  const prisma = new PrismaClient()

  // https://www.apollographql.com/docs/apollo-server/data/subscriptions/#the-pubsub-class
  const pubsub = new PubSub()

  // Save the returned server's info so we can shutdown this server later
  // To enable access of
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: SubscriptionContext): Promise<GraphQLContext> => {
        if (ctx.connectionParams && ctx.connectionParams.session) {
          const { session } = ctx.connectionParams

          return { session, prisma, pubsub }
        }
        // if user is not signed in
        return { session: null, prisma, pubsub }
      },
    },
    wsServer
  )

  const corsParams = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    context: async ({ req, res }): Promise<GraphQLContext> => {
      const session = (await getSession({ req })) as Session

      return { session, prisma, pubsub }
    },
    plugins: [
      // Proper shutdown for the HTTP server.

      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  // More required logic for integrating with Express
  await server.start()
  server.applyMiddleware({
    app,
    cors: corsParams,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: "/",
  })

  // Modified server startup
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  )
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

main().catch((err) => console.log("error"))
