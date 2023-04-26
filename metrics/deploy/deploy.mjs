import { exec, spawn } from "child_process";
import { appendFile, readFile, writeFile } from "fs/promises";
import os from "os";
import { performance } from "perf_hooks";

const DEPLOY_TYPE = process.argv[2] || "no-tests-cache";
const NUM_OF_RUNS = parseInt(process.argv[3]) || 100;
const START_RUN = parseInt(process.argv[4]) || 1;
const data = await readExistingData();

(async function () {
  for (let i = START_RUN; i <= NUM_OF_RUNS; i++) {
    console.log(`Deploying ${i} of ${NUM_OF_RUNS}`);
    await deploy(i);
  }
})()
  .then(() => console.log("All deploys completed"))
  .catch((error) => console.error(error));

async function readExistingData() {
  try {
    const buffer = await readFile(`deploy_${DEPLOY_TYPE}.json`);
    const data = JSON.parse(buffer);

    return data;
  } catch {
    return [];
  }
}

function getInternetSpeed() {
  return new Promise((resolve, reject) => {
    exec("speedtest-cli --json", (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }

      if (stderr) {
        reject(stderr);
      }

      if (stdout) {
        try {
          const data = JSON.parse(stdout);

          if (data) {
            const internetSpeed = data.download / 1e6;

            resolve(internetSpeed);
          } else {
            reject(new Error("Failed to resolve internet speed"));
          }
        } catch {
          reject(new Error("Failed to parse standard output"));
        }
      } else {
        reject(new Error("Failed to receive standard output"));
      }
    });
  });
}

function deploy(num) {
  return new Promise(async (resolve, reject) => {
    let internetSpeed;

    if (DEPLOY_TYPE.includes("no-cache")) {
      try {
        internetSpeed = await getInternetSpeed();
      } catch (error) {
        console.error(error);
      }
    }

    const start = performance.now();
    const child = spawn("npm", ["run", `deploy:${DEPLOY_TYPE}`]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
      console.error(data);
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
          writeFile(`deploy_${DEPLOY_TYPE}.json`, JSON.stringify(data));
          appendFile(`deploy_${DEPLOY_TYPE}.log`, log);

          resolve(num);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
