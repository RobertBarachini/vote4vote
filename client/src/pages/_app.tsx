import { ChakraProvider } from '@chakra-ui/react'

import theme from '../theme'
import { AppProps } from 'next/app'
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache'
import { MeDocument, MeQuery, LoginMutation, RegisterMutation, LogoutMutation } from 'src/generated/graphql'

function typedUpdateQuery<Result, Query>(
	cache: Cache,
	query: QueryInput,
	result: any,
	fn: (r: Result, q: Query) => Query
) {
	return cache.updateQuery(query, (data) => fn(result, data as any) as any)
}

const client = createClient({	
	// TODO fix this to work in VM and on host
	url: process.env.NEXT_PUBLIC_SERVER_URL ? process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:4000/graphql',
	fetchOptions: {
		credentials: 'include',
		// mode: 'cors',
	},
	exchanges: [
		dedupExchange,
		cacheExchange({
			updates: {
				Mutation: {
					logout: (_result, args, cache, info) => {
						typedUpdateQuery<LogoutMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							// { me: null },
							// () => ({ me: null })
							_result,
							() => ({me: null})
						)
					},
					login: (_result, args, cache, info) => {
						console.log('Login mutation called', _result, args, cache, info);
						typedUpdateQuery<LoginMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								if (result.login?.errors) {
									return query;
								} else {
									return {
										me: result.login?.user,
									};
								}
							}
						);
					},
					register: (_result, args, cache, info) => {
						console.log('Login mutation called', _result, args, cache, info);
						typedUpdateQuery<RegisterMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								if (result.register?.errors) {
									return query;
								} else {
									return {
										me: result.register?.user,
									};
								}
							}
						);
					}
				},
			}
		}),
		fetchExchange
	]

})

function MyApp({ Component, pageProps }: AppProps) {
  return (
		<Provider value={client}>
			<ChakraProvider resetCSS theme={theme}>
				<Component {...pageProps} />
			</ChakraProvider>
		</Provider>
  )
}

export default MyApp
