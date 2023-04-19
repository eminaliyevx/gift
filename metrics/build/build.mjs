import { spawn } from "child_process";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import { performance } from "perf_hooks";

const NUM_OF_RUNS = 100;
let data;

const BUILD_TYPE = process.argv[2] || "no-tests";

try {
  const buffer = readFileSync(`build_${BUILD_TYPE}.json`);
  data = JSON.parse(buffer);
} catch {
  data = [];
}

function runBuild(num) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const child = spawn("npm", ["run", `build:${BUILD_TYPE}`]);

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
      const time = end - start;

      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        data.push({
          time: time,
          type: os.type(),
          arch: os.arch(),
          model: os.cpus()[0].model,
          speed: os.cpus()[0].speed,
        });

        const log = `
          ===============================
          Build run: ${num}
          ===============================
          Standard output
          ===============================
          ${stdout}
          ===============================
          Standard error
          ===============================
          ${stderr}
          ===============================
          Completed in ${time / 1000} seconds
          ===============================
          OS name: ${os.type()}
          OS CPU architecture: ${os.arch()}
          CPU model: ${os.cpus()[0].model}
          CPU speed: ${os.cpus()[0].speed}
          ===============================
        `;

        try {
          writeFileSync(`build_${BUILD_TYPE}.json`, JSON.stringify(data));
          appendFileSync(`build_${BUILD_TYPE}.log`, log);

          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

async function runBuilds() {
  for (let i = 1; i <= NUM_OF_RUNS; i++) {
    console.log(`Running build ${i} of ${NUM_OF_RUNS}`);
    await runBuild(i);
  }
}

runBuilds()
  .then(() => console.log("All builds completed"))
  .catch((err) => console.error(err));
