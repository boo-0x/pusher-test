import {
    ApolloClient,
    gql,
    HttpLink,
    InMemoryCache,
  } from "@apollo/client/core";
require("dotenv").config();

const gqlClient = new ApolloClient({
    link: new HttpLink({uri: process.env.GRAPHQL_API, fetch}),
    cache: new InMemoryCache()
});

export const queryTokenHolder = async (token: string, address: string) => {
    const query = gql`
        query {
            tokenHolderById(id: "${token}-${address}") {
                balance
                timestamp
            }
        }
    `;
    try {
        const result = await gqlClient.query({ query, fetchPolicy: 'no-cache' });
        return result.data["tokenHolderById"];
    } catch (error) {
        console.log(error);
    }
}