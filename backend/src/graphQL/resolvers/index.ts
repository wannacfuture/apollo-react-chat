import userResolvers from "./user"
import conversatioResolvers from "./conversation"
import merge from "lodash.merge"

/**
 * Resolver can be either: query resolver, mutation resolver, subscription resolver
 */

const resolvers = merge({}, userResolvers, conversatioResolvers)

export default resolvers
