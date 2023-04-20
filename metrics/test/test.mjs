import { spawn } from "child_process";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import { performance } from "perf_hooks";

const NUM_OF_RUNS = parseInt(process.argv[2]) || 100;
const START_RUN = parseInt(process.argv[3]) || 1;
let data = [];

try {
  const buffer = readFileSync("test.json");
  data = JSON.parse(buffer);
} catch {
  data = [];
}

function runTest(num) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const child = spawn("npm", ["run", "test"]);

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
        });

        const log = `
          ===============================
          Test run: ${num}
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
          ===============================
        `;

        try {
          writeFileSync("test.json", JSON.stringify(data));
          appendFileSync("test.log", log);

          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

async function runTests() {
  for (let i = START_RUN; i <= NUM_OF_RUNS; i++) {
    console.log(`Running test ${i} of ${NUM_OF_RUNS}`);
    await runTest(i);
  }
}

runTests()
  .then(() => console.log("All tests completed"))
  .catch((err) => console.error(err));
