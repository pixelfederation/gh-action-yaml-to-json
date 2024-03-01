import * as core from "@actions/core";
import YAML from "yaml";
import * as fs from "fs";
import { JSONPath } from "jsonpath-plus";

export async function readYamlValuesFile(
  directory: string,
  valuesFilePath: string,
): Promise<Object> {
  if (directory.endsWith("/")) {
    directory = directory.slice(0, -1);
  }
  if (valuesFilePath.startsWith("/")) {
    valuesFilePath = valuesFilePath.substring(1);
  }
  const valuesYaml = await fs.promises.readFile(
    `${directory}/${valuesFilePath}`,
    {
      encoding: "utf8",
    },
  );
  let valuesYamlParsed: string = "";
  valuesYaml.split(/\r?\n/).forEach((line) => {
    //check if there is a hash and not hash as string with single and double quotes
    if (
      line.includes("#") &&
      !new RegExp('".*#.*"', "").test(line) &&
      !new RegExp("'.*#.*'", "").test(line)
    ) {
      line = line.replace(new RegExp("#.*$", "g"), "");
    }
    //maybe remove all empty line
    valuesYamlParsed += `${line}\n`;
  });
  let valuesFileJson = {};
  try {
    valuesFileJson = YAML.parse(valuesYamlParsed);
  } catch (err) {
    throw new Error(err);
  }
  return valuesFileJson;
}

(async () => {
  try {
    const file: string = core.getInput("file", { required: true });
    const dir: string = core.getInput("directory", { required: true });
    const validate_keys: string[] = core.getMultilineInput("validate_keys", {
      required: false,
    });
    const json = await readYamlValuesFile(dir, file);
    let failed: boolean = false;
    for (const key of validate_keys) {
      const results = JSONPath({ path: key, json });
      for (const res of results) {
        if (!res) {
          core.setFailed(`Validating faild on key '${key}'`);
          break;
        }
      }
      if (results.length == 0) {
        failed = true;
        core.setFailed(`Validating faild on key '${key}'`);
        break;
      }
    }
    if (!failed) {
      core.setOutput("content", JSON.stringify(json));
    }
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
})();
