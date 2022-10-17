import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import { theme } from "../chakra/theme"
import { Session } from "next-auth"
import { ApolloProvider } from "@apollo/client"
import { client } from "../graphQL/apollo-client"
import { Toaster } from "react-hot-toast"

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={pageProps.session}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
          <Toaster />
        </ChakraProvider>
      </SessionProvider>
    </ApolloProvider>
  )
}

export default MyApp
