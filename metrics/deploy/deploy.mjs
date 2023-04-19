import { spawn } from "child_process";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import { performance } from "perf_hooks";

const NUM_OF_RUNS = 2;
let data = [];

const DEPLOY_TYPE = process.argv[2] || "no-tests-cache";

try {
  const buffer = readFileSync(`deploy_${DEPLOY_TYPE}.json`);
  data = JSON.parse(buffer);
} catch {
  data = [];
}

function getInternetSpeed() {
  return new Promise((resolve, reject) => {
    const child = spawn("speedtest-cli", ["--json"]);
    let internetSpeed = null;

    child.stdout.on("data", (data) => {
      internetSpeed = JSON.parse(data).download / 1e6;
    });

    child.stderr.on("data", (_data) => {
      internetSpeed = null;
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(null);
      } else {
        resolve(internetSpeed);
      }
    });
  });
}

function runDeploy(num) {
  return new Promise(async (resolve, reject) => {
    const internetSpeed = DEPLOY_TYPE.includes("no-cache")
      ? await getInternetSpeed()
      : undefined;

    const start = performance.now();
    const child = spawn("npm", ["run", `deploy:${DEPLOY_TYPE}`]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
    });

    child.on("close", (code) => {
      const end = performance.now();
      const time = (end - start) / 1000;

      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        data.push({
          time,
          type: os.type(),
          arch: os.arch(),
          model: os.cpus()[0].model,
          speed: os.cpus()[0].speed,
          internetSpeed,
        });

        const log = `
          ===============================
          Deploy run: ${num}
          ===============================
          Standard output
          ===============================
          ${stdout}
          ===============================
          Standard error
          ===============================
          ${stderr}
          ===============================
          Completed in ${time} seconds
          ===============================
          OS name: ${os.type()}
          OS CPU architecture: ${os.arch()}
          CPU model: ${os.cpus()[0].model}
          CPU speed: ${os.cpus()[0].speed}
          ${internetSpeed ? `Internet speed: ${internetSpeed} Mbps` : ""}
          ===============================
        `;

        try {
          writeFileSync(`deploy_${DEPLOY_TYPE}.json`, JSON.stringify(data));
          appendFileSync(`deploy_${DEPLOY_TYPE}.log`, log);

          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

async function runDeploys() {
  for (let i = 1; i <= NUM_OF_RUNS; i++) {
    console.log(`Running deploy ${i} of ${NUM_OF_RUNS}`);
    await runDeploy(i);
  }
}

runDeploys()
  .then(() => console.log("All deploys completed"))
  .catch((err) => console.error(err));
