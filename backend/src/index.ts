import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { PrismaClient } from "@prisma/client"
import { json } from "body-parser"
import cors from "cors"
import * as dotenv from "dotenv"
import express from "express"
import { PubSub } from "graphql-subscriptions"
import { useServer } from "graphql-ws/lib/use/ws"
import http from "http"
import { getSession } from "next-auth/react"
import { WebSocketServer } from "ws"
import resolvers from "./graphQL/resolvers/index"
import typeDefs from "./graphQL/typeDefs/index"
import { GraphQLContext, Session, SubscriptionContext } from "./utils/types"

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

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
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

  const corsParams = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }

  // More required logic for integrating with Express
  await server.start()

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsParams),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const session = await getSession({ req })

        return { session: session as Session, prisma, pubsub }
      },
    })
  )

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  )
  console.log(`Server is now running on http://localhost:4000/graphql`)
}

main().catch((err) => console.log("error"))
