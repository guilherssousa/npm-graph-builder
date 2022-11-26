import npa from "npm-package-arg";
import guessVersion from "./lib/guess-version";

import { Graph } from "ngraph.graph";

import {
  RegistryResponse,
  RegistryVersion,
  CustomRegistry,
  Registry,
} from "./types";

type BuildGraphProps = {
  fetcher: <JSON = any>(url: string) => Promise<JSON>;
  url?: string;
};

type CreateNpmDependenciesGraphProps = {
  packageName: string;
  graph: Graph;
  version?: string;
};

type QueueItem = {
  name: string;
  version: string;
  parent: string | null;
};

function buildGraph({
  fetcher,
  url = "http://registry.npmjs.org/",
}: BuildGraphProps) {
  if (!url.endsWith("/"))
    throw new Error("registry url is supposed to end with /");

  let progress: (length: number) => void;
  const cache = Object.create(null);

  return {
    createNpmDependenciesGraph: createNpmDependenciesGraph,
    notifyProgress: function (callback: (length: number) => void) {
      progress = callback;
    },
  };

  function createNpmDependenciesGraph({
    packageName,
    graph,
    version = "latest",
  }: CreateNpmDependenciesGraphProps) {
    if (!packageName) throw new Error("Initial package name is required");
    if (!graph) throw new Error("Graph data structure is required");

    const queue: QueueItem[] = [];
    const processed = Object.create(null);

    queue.push({
      name: packageName,
      version: version,
      parent: null,
    });

    return processQueue(graph);

    async function processQueue(graph: Graph): Promise<Graph<any, any>> {
      if (typeof progress === "function") {
        progress(queue.length);
      }

      const work = queue.pop() as QueueItem;

      const cached = cache[getCacheKey(work)];

      if (cached) {
        return processRegistryResponse(cached);
      }

      if (isRemote(work.version)) {
        return processRegistryResponse({ data: {} });
      }

      const escapedName = npa(work.name).escapedName;

      if (!escapedName && isHttp(work.name)) {
        return fetcher(work.name).then((res: { data: CustomRegistry }) => {
          if (res.data) {
            // TODO: Validate pkg json
            const pkgJSON = res.data;
            pkgJSON._id = pkgJSON.name + "@" + pkgJSON.version;
            const versions = {};

            // @ts-ignore-error
            versions[pkgJSON.version] = pkgJSON;

            return processRegistryResponse({
              data: Object.assign({}, { versions: versions }),
            });
          }
          throw new Error("Unexpected response");
        });
      }

      if (!escapedName) {
        throw new Error("TODO: Escaped name is missing for " + work.name);
      }

      return fetcher(url + escapedName).then(processRegistryResponse);

      async function processRegistryResponse(
        res: RegistryResponse
      ): Promise<Graph<any, any>> {
        cache[getCacheKey(work)] = res;
        traverseDependencies(work, res.data as Registry);

        if (queue.length) {
          // continue building the graph
          return await processQueue(graph);
        }

        return graph;
      }
    }

    function getCacheKey(work: QueueItem) {
      const packageIsRemote = isRemote(work.version);
      const cacheKey = work.name;
      return packageIsRemote ? cacheKey + work.version : cacheKey;
    }

    function traverseDependencies(work: QueueItem, packageJson: Registry) {
      let pkg: Registry | RegistryVersion;
      let version: string;
      let id: string;

      if (isRemote(work.version)) {
        version = "";
        pkg = packageJson as Registry;
        id = work.version;
      } else {
        version = guessVersion(work.version, packageJson);
        pkg = packageJson.versions[version] as RegistryVersion;
        id = pkg._id;
      }

      // TODO: here is a good place to address https://github.com/anvaka/npmgraph.an/issues/4

      graph.beginUpdate();

      graph.addNode(id, pkg);

      if (work.parent && !graph.hasLink(work.parent, id)) {
        graph.addLink(work.parent, id);
      }

      graph.endUpdate();

      const dependencies = pkg?.dependencies;

      if (processed[id]) {
        // no need to enqueue this package again - we already downloaded it before
        return;
      }
      processed[id] = true;

      if (dependencies) {
        Object.keys(dependencies).forEach(addToQueue);
      }

      function addToQueue(name: string) {
        queue.push({
          name: name,
          version: dependencies[name],
          parent: id,
        });
      }
    }
  }
}

function isHttp(version: string) {
  return typeof version === "string" && version.match(/^https?:\/\//);
}

function isRemote(version: string): boolean {
  return (
    typeof version === "string" &&
    (version.indexOf("git") === 0 ||
      version.indexOf("http") === 0 ||
      version.indexOf("file") === 0)
  );
}

export default buildGraph;
