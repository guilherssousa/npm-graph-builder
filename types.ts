interface RegistryResponse {
  data: Registry | {};
}

interface Registry {
  _id?: string;
  name?: string;
  versions: {
    [version: string]: RegistryVersion;
  };
  dependencies: {
    [name: string]: string;
  };
  "dist-tags": {
    latest: string;
  };
}

interface CustomRegistry {
  _id?: string;
  name: string;
  version: string;
}

interface RegistryVersion {
  name: string;
  version: string;
  _id: string;
  dependencies: {
    [name: string]: string;
  };
}

export type EventKey = string | number | Symbol;
// define basic function that is allowed for event listeners
export type EventCallback = (...args: any[]) => void;

export interface EventedType {
  on: (eventName: EventKey, callback: EventCallback, ctx?: any) => this;
  off: (eventName?: EventKey, callback?: EventCallback) => this;
  fire: (eventName: EventKey, ...args: any[]) => this;
}

export type NodeId = string | number;
export type LinkId = string;

export interface Link<Data = any> {
  id: LinkId;

  fromId: NodeId;

  toId: NodeId;

  data: Data;
}
export interface Node<Data = any> {
  id: NodeId;

  links: Set<Link<any>> | null;

  data: Data;
}

interface Graph<NodeData = any, LinkData = any> {
  addNode: (node: NodeId, data?: NodeData) => Node<NodeData>;

  addLink: (from: NodeId, to: NodeId, data?: LinkData) => Link<LinkData>;

  removeLink: (link: Link<LinkData>) => boolean;

  removeNode: (nodeId: NodeId) => boolean;

  getNode: (nodeId: NodeId) => Node<NodeData> | undefined;

  hasNode: (nodeId: NodeId) => Node<NodeData> | undefined;

  getLink: (fromNodeId: NodeId, toNodeId: NodeId) => Link<LinkData> | undefined;

  hasLink: (fromNodeId: NodeId, toNodeId: NodeId) => Link<LinkData> | undefined;

  getNodesCount: () => number;

  getNodeCount: () => number;

  getLinksCount: () => number;

  getLinkCount: () => number;

  getLinks: (nodeId: NodeId) => Set<Link<LinkData>> | null;

  forEachNode: (
    callbackPerNode: (node: Node<NodeData>) => void | undefined | null | boolean
  ) => void;

  forEachLink: (
    callbackPerLink: (link: Link<LinkData>) => void | undefined | boolean
  ) => void;

  forEachLinkedNode: (
    nodeId: NodeId,
    callbackPerNode: (node: Node<NodeData>, link: Link<LinkData>) => void,
    oriented: boolean
  ) => void;

  beginUpdate: () => void;

  endUpdate: () => void;

  clear: () => void;
}

export { RegistryResponse, RegistryVersion, CustomRegistry, Registry, Graph };
