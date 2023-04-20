import { exec, spawn } from "child_process";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import { performance } from "perf_hooks";

const DEPLOY_TYPE = process.argv[2] || "no-tests-cache";
const NUM_OF_RUNS = parseInt(process.argv[3]) || 100;
const START_RUN = parseInt(process.argv[4]) || 1;
let data = [];

try {
  const buffer = readFileSync(`deploy_${DEPLOY_TYPE}.json`);
  data = JSON.parse(buffer);
} catch {
  data = [];
}

function getInternetSpeed() {
  return new Promise((resolve, reject) => {
    let internetSpeed = null;

    exec("speedtest-cli --json", (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(null);
      }

      if (stderr) {
        console.error(stderr);
        reject(null);
      }

      if (stdout) {
        try {
          const data = JSON.parse(stdout);

          if (data) {
            internetSpeed = data.download / 1e6;
            resolve(internetSpeed);
          }
        } catch {
          reject(null);
        }
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
  for (let i = START_RUN; i <= NUM_OF_RUNS; i++) {
    console.log(`Running deploy ${i} of ${NUM_OF_RUNS}`);
    await runDeploy(i);
  }
}

runDeploys()
  .then(() => console.log("All deploys completed"))
  .catch((err) => console.error(err));
