/**
 * Adjusted from https://github.com/npm/npm-remote-ls
 *
 * Copyright (c) 2014, npm, Inc. and Contributors
 */

import semver from "semver";
import { Registry } from "../types";

function guessVersion(versionString: string, packageJson: Registry): string {
  if (versionString === "latest") versionString = "*";

  const availableVersions = Object.keys(packageJson.versions);
  let version = semver.maxSatisfying(availableVersions, versionString, true);

  // check for prerelease-only versions
  if (
    !version &&
    versionString === "*" &&
    availableVersions.every(function (av) {
      return new semver.SemVer(av, true).prerelease.length;
    })
  ) {
    // just use latest then
    version = packageJson["dist-tags"] && packageJson["dist-tags"].latest;
  }

  if (!version)
    throw Error(
      "could not find a satisfactory version for string " + versionString
    );
  else return version;
}

export default guessVersion;
