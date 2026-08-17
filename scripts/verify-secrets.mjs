import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const repositoryFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  {
    encoding: "utf8",
  },
)
  .split("\0")
  .filter(Boolean);

const signatures = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bgh[opurs]_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
];

const findings = [];

for (const file of repositoryFiles) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  if (signatures.some((signature) => signature.test(content))) {
    findings.push(file);
  }
}

if (findings.length > 0) {
  console.error(`Possible committed secret found in: ${findings.join(", ")}`);
  process.exit(1);
}

console.log(`Secret signature check passed (${repositoryFiles.length} repository files).`);
