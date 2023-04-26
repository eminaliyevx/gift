import { spawn } from "child_process";
import { appendFile, readFile, writeFile } from "fs/promises";
import os from "os";
import { performance } from "perf_hooks";

const NUM_OF_RUNS = parseInt(process.argv[2]) || 100;
const START_RUN = parseInt(process.argv[3]) || 1;
const data = await readExistingData();

(async function () {
  for (let i = START_RUN; i <= NUM_OF_RUNS; i++) {
    console.log(`Testing ${i} of ${NUM_OF_RUNS}`);
    await test(i);
  }
})()
  .then(() => console.log("All tests completed"))
  .catch((error) => console.error(error));

async function readExistingData() {
  try {
    const buffer = await readFile("test.json");
    const data = JSON.parse(buffer);

    return data;
  } catch {
    return [];
  }
}

function test(num) {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    const child = spawn("npm", ["run", "test"]);

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
          writeFile("test.json", JSON.stringify(data));
          appendFile("test.log", log);

          resolve(num);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
