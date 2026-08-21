import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const twikooPackage = join(repoRoot, "astro/node_modules/twikoo/package.json");
const twikooBundle = join(
  repoRoot,
  "astro/node_modules/twikoo/dist/twikoo.all.min.js",
);
const supportedVersion = "1.7.19";
const expectedReplacements = 2;
const legacyCall = "this.$tcb.auth.getCurrenUser()";
const currentCall = "this.$tcb.auth.getCurrentUser()";
const legacyLoginCheck = 'this.isLogin="CUSTOM"===e.loginType';
const compatibleLoginCheck =
  'this.isLogin=!!e&&(Array.isArray(e.providers)?e.providers.some(e=>"custom"===e.id):"CUSTOM"===e.loginType)';
const legacyAnonymousLogin = ".anonymousAuthProvider().signIn()";
const currentAnonymousLogin = ".signInAnonymously()";
const legacyCustomLogin =
  "await this.$tcb.auth.customAuthProvider().signIn(t.result.ticket)";
const currentCustomLogin =
  "this.$tcb.auth.setCustomSignFunc(()=>Promise.resolve(t.result.ticket)),await this.$tcb.auth.signInWithCustomTicket()";

const { version } = JSON.parse(readFileSync(twikooPackage, "utf8"));
if (version !== supportedVersion) {
  throw new Error(
    `Twikoo ${version} is not supported by this auth patch; expected ${supportedVersion}.`,
  );
}

const source = readFileSync(twikooBundle, "utf8");
let patched = source;

function replaceExpected(
  original,
  replacement,
  label,
  expectedCount = expectedReplacements,
) {
  const originalCount = patched.split(original).length - 1;

  if (originalCount === expectedCount) {
    patched = patched.replaceAll(original, replacement);
    console.log(`Patched ${expectedCount} Twikoo ${label}.`);
    return;
  }

  if (originalCount === 0) {
    const replacementCount = patched.split(replacement).length - 1;
    if (replacementCount >= expectedCount) {
      console.log(`Twikoo ${label} patch is already applied.`);
      return;
    }
    throw new Error(
      `Twikoo ${label} patch target was not found. Check the locked Twikoo version before continuing.`,
    );
  }

  throw new Error(
    `Expected ${expectedCount} Twikoo ${label} targets, found ${originalCount}.`,
  );
}

replaceExpected(legacyCall, currentCall, "CloudBase auth calls");
replaceExpected(
  legacyLoginCheck,
  compatibleLoginCheck,
  "admin login checks",
);
replaceExpected(
  legacyAnonymousLogin,
  currentAnonymousLogin,
  "anonymous login calls",
);
replaceExpected(
  legacyCustomLogin,
  currentCustomLogin,
  "custom login call",
  1,
);

if (patched !== source) {
  writeFileSync(twikooBundle, patched);
}
