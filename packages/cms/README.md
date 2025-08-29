# Sanity CMS for Leather

## Getting started

Run the sanity studio locally with `pnpm dev`.

Installing the [Sanity VSCode Extension](https://marketplace.visualstudio.com/items?itemName=sanity-io.vscode-sanity) is recommended and allows you to run queries in your editor.

## Working in this package

This package has two primary components.

1. Sanity Studio: A studio configuration which defines the content models available to create via [Sanity Studio](https://www.sanity.io/docs/studio). This is not externally available (not exported as a package) and is meant to be updated when we generate new structured data types to be edited and made available for consumption.
2. CMS Client: A Sanity client interface for exposing Sanity queries to our clients. This leverages type generation process to build a client with type safe queries.

### Sanity Studio

The Studio can be run locally using `pnpm dev`. Add content models via `./schemaTypes`.

Content models can also be migrated using [Sanity CLI](https://www.sanity.io/learn/course/handling-schema-changes-confidently/writing-a-content-migration).

Schemas for content models are added in `./schemaTypes`. Add a schema you would like and test it locally by navigating to the Sanity Studio.

### CMS Client

## Development

You can run `pnpm dev` to concurrently run and rebuild Sanity Studio as you add `schemaTypes`. This will also rebuild the types for all of the exported client code.

If you want to add new queries add them to `src/queries` and the types will be generated. You can test queries by either running them in VSCode via the Sanity plugin or by navigating to the Sanity Studio in a browser and running queries in the "vision" tab.

Queries use Sanity's query language called Groq - [documentation here](https://www.sanity.io/docs/content-lake/query-cheat-sheet).

## Consuming

### Exports

This package exports `index.ts` and everything in `./client/**`. The queries and their types can be used in our applications.

### Usage

To use the queries import the client and the query you would like to use.

`import { client, QUERY_YOU_WANT } from @leather-io/cms`

You can use the query by calling:

`const result = await client.fetch(QUERY_YOU_WANT)`

## Deploying Sanity Studio

Sanity Studio and updates to it will be deployed when we merge to `origin/dev`.

## Notes

There is the abilty to build and generate a GraphQL client as well. I haven't gone down this path yet, but we may want to explore it down the line.
