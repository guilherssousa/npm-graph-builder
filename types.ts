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

export { RegistryResponse, RegistryVersion, CustomRegistry, Registry };
