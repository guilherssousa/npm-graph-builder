# NPM Graph Builder

A Typescript rewrite of [npmgraphbuilder](https://github.com/anvaka/npmgraphbuilder) by anvaka. Builds graph of npm dependencies from npm registry. A graph is an instance of [ngraph.graph](https://github.com/anvaka/ngraph.graph).

## Installing

With your favorite package manager:

```bash
npm install npm-graph-builder
pnpm install npm-graph-builder
yarn add npm-graph-builder
```

## Demo

As the original package, it is not bound to any particular HTTP client. So it requires any HTTP client or library to be injected to the constructor:

```typescript
import Graph from "ngraph.graph";
import graphBuilderConstructor from "npm-graph-builder";

const graphBuilder = graphBuilderConstructor({
  fetcher: httpClient /* any HTTP client */,
  url: "https://registry.npmjs.org/" /* npm registry URL */,
});

graphBuilder
  .createNpmDependenciesGraph({
    packageName: "browserify",
    graph: Graph(),
  })
  .then(function (graph) {
    console.log("Done.");
    console.log("Nodes count: ", graph.getNodesCount());
    console.log("Edges count: ", graph.getLinksCount());
  })
  .fail(function (err) {
    console.error("Failed to build graph: ", err);
  });
```

Here `httpClient` is a `function(url) {}` that returns a promise.

A demo of `httpClient` using [Axios](https://github.com/axios/axios):

```typescript
async function httpClient(url: string) {
  return await axios.get(url);
}
```

## License

This repository and its code is licensed under the [MIT license](LICENSE).
