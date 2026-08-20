import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePublishedAt } from "../src/lib/dates.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const postsDir = join(root, "_posts");

function sourceDate(filename: string): string {
  const source = readFileSync(join(postsDir, filename), "utf8");
  const match = source.match(/^date:\s*(.+)$/m);
  if (!match) throw new Error(`${filename} 缺少 date`);
  return match[1].trim();
}

function expectedPublishedAt(raw: string): Date {
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2}):(\d{2}) ([+-]\d{4})$/,
  );
  if (!match) {
    throw new Error(`源日期格式超出测试约定：${raw}`);
  }
  const [, year, month, day, hour, minute, second, zone] = match;
  const offset = `${zone.slice(0, 3)}:${zone.slice(3)}`;
  return new Date(
    `${year}-${month}-${day}T${hour.padStart(2, "0")}:${minute}:${second}${offset}`,
  );
}

assert.equal(
  parsePublishedAt("2014-11-13 2:15:10 +0800").toISOString(),
  "2014-11-12T18:15:10.000Z",
);
assert.equal(
  parsePublishedAt("2016-04-24 0:20:00 +0800").toISOString(),
  "2016-04-23T16:20:00.000Z",
);
assert.throws(() => parsePublishedAt("2014-11-13 2:15:10 +0800 extra"));
assert.throws(() => parsePublishedAt("not-a-date"));
assert.throws(() => parsePublishedAt("2014-11-13 24:00:00 +0800"));

const files = readdirSync(postsDir).filter((name) => name.endsWith(".md"));
assert.equal(files.length, 51, "应覆盖全部 51 篇文章的日期");

for (const filename of files) {
  const raw = sourceDate(filename);
  assert.equal(
    parsePublishedAt(raw).toISOString(),
    expectedPublishedAt(raw).toISOString(),
    `${filename} 的发布时间应与 front matter 一致`,
  );
}

console.log(`Date contract passed (${files.length} posts).`);
