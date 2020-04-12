import "dotenv/config";
import * as path from "path";
import { BasicAddonClass } from "../addons";
import { ServeAddonOptions, serveAddons } from "../server";
import { loadAddons } from "./load-addons";
import { StartArgs } from "./types";

const tryGetServeOpts = (onPath: string): ServeAddonOptions | null => {
  try {
    const requiredFile = require(onPath);
    const exportedValues = { default: requiredFile, ...requiredFile };
    const opts = Object.values(exportedValues).filter(
      (val): val is ServeAddonOptions => {
        if (val instanceof ServeAddonOptions) {
          return true;
        }
        return false;
      }
    );
    return opts[0];
  } catch {}

  return null;
};

const main = async () => {
  const argv: StartArgs = JSON.parse(process.argv[2]);

  const userDefinedOptions = tryGetServeOpts(
    path.resolve(process.cwd(), ".watched.js")
  );

  let addons: BasicAddonClass[];
  try {
    addons = await loadAddons(argv.files);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  serveAddons(addons, { ...userDefinedOptions, ...argv.opts });
};

main();