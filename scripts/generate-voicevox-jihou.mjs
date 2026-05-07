import { promises as fs } from "node:fs";
import path from "node:path";

const voicevoxBaseUrl =
  process.env.VOICEVOX_BASE_URL ?? "http://127.0.0.1:50021";
const speakerId = Number(process.env.VOICEVOX_SPEAKER ?? "3");
const concurrency = Math.max(1, Number(process.env.JIHOU_CONCURRENCY ?? "6"));
const outputDir = path.join(process.cwd(), "public", "jihou");

function formatAnnouncement(hours, minutes) {
  return `${hours}時${minutes}分なのだ`;
}

function formatFileName(hours, minutes) {
  return `${String(hours).padStart(2, "0")}-${String(minutes).padStart(2, "0")}.wav`;
}

async function synthesize(text) {
  const audioQueryResponse = await fetch(
    `${voicevoxBaseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    {
      method: "POST",
    },
  );

  if (!audioQueryResponse.ok) {
    throw new Error(`audio_query failed with ${audioQueryResponse.status}`);
  }

  const audioQuery = await audioQueryResponse.json();
  const synthesisResponse = await fetch(
    `${voicevoxBaseUrl}/synthesis?speaker=${speakerId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(audioQuery),
    },
  );

  if (!synthesisResponse.ok) {
    throw new Error(`synthesis failed with ${synthesisResponse.status}`);
  }

  return Buffer.from(await synthesisResponse.arrayBuffer());
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const jobs = [];

  for (let hours = 0; hours < 24; hours += 1) {
    for (let minutes = 0; minutes < 60; minutes += 1) {
      const text = formatAnnouncement(hours, minutes);
      const fileName = formatFileName(hours, minutes);
      jobs.push({
        hours,
        minutes,
        text,
        fileName,
      });
    }
  }

  const manifest = new Array(jobs.length);
  let nextJobIndex = 0;

  async function worker() {
    while (true) {
      const jobIndex = nextJobIndex;
      nextJobIndex += 1;

      const job = jobs[jobIndex];
      if (!job) {
        return;
      }

      const { hours, minutes, text, fileName } = job;
      const filePath = path.join(outputDir, fileName);
      const audio = await synthesize(text);

      await fs.writeFile(filePath, audio);
      manifest[jobIndex] = {
        hours,
        minutes,
        text,
        file: `/jihou/${fileName}`,
      };

      console.log(`generated ${fileName} (${text})`);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker()),
  );

  await fs.writeFile(
    path.join(outputDir, "manifest.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        voicevoxBaseUrl,
        speakerId,
        concurrency,
        entries: manifest,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`done: ${manifest.length} files into ${outputDir}`);
}

await main();
