import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const OWNER_NICK = "Jerry Zou";
const MAX_DIALOGUE_GAP_MS = 14 * 24 * 60 * 60 * 1000;

// 这些评论不是紧邻的“访客 -> 博主”结构，但从上下文可以明确看出
// 它们是在延续前一轮对话。值为直接父评论 ID。
const semanticParentOverrides = new Map([
  ["3235735070", "3235735069"],
  ["3235735103", "3235735104"],
  ["3235735150", "3235735147"],
  ["3235735157", "3235735154"],
  ["3235735176", "3235735174"],
  ["3235735054", "3235735045"],
  ["3235735343", "3235735344"],
  ["3235735308", "3235735306"],
  ["3235735049", "3235735034"],
  ["3235735395", "3235735397"],
  ["3235735429", "3235735435"],
  ["3235735414", "3235735432"],
  ["3235735464", "3235735467"],
  ["3235735481", "3235735483"],
]);

function usage() {
  console.error(
    "用法：node scripts/plan-twikoo-comment-recovery.mjs <筛选后的 Disqus XML> <输出 JSON>",
  );
  process.exitCode = 1;
}

function firstMatch(source, pattern) {
  return source.match(pattern)?.[1] ?? "";
}

function decodeXmlText(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function stripMarkup(value) {
  return decodeXmlText(
    value
      .replace(/^<!\[CDATA\[/, "")
      .replace(/\]\]>$/, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function parsePosts(xml) {
  return [...xml.matchAll(/<post dsq:id="([^"]+)">([\s\S]*?)<\/post>/g)].map(
    ([, id, body]) => ({
      id,
      threadId: firstMatch(body, /<thread dsq:id="([^"]+)"\s*\/>/),
      parentId: firstMatch(body, /<parent dsq:id="([^"]+)"\s*\/>/),
      created: Date.parse(firstMatch(body, /<createdAt>([^<]+)<\/createdAt>/)),
      nick: decodeXmlText(firstMatch(body, /<name>([\s\S]*?)<\/name>/)),
      username: decodeXmlText(
        firstMatch(body, /<username>([^<]+)<\/username>/),
      ),
      comment: stripMarkup(firstMatch(body, /<message>([\s\S]*?)<\/message>/)),
      legacy: /<id>wp_id=/.test(body),
    }),
  );
}

function validatePosts(posts) {
  const byId = new Map();
  for (const post of posts) {
    if (byId.has(post.id)) throw new Error(`Disqus 评论 ID 重复：${post.id}`);
    if (!post.threadId) throw new Error(`评论 ${post.id} 缺少 thread`);
    if (!Number.isFinite(post.created))
      throw new Error(`评论 ${post.id} 的 createdAt 无效`);
    if (!post.nick) throw new Error(`评论 ${post.id} 缺少作者名称`);
    byId.set(post.id, post);
  }

  for (const post of posts) {
    if (!post.parentId) continue;
    const parent = byId.get(post.parentId);
    if (!parent) throw new Error(`评论 ${post.id} 的父评论不存在`);
    if (parent.threadId !== post.threadId)
      throw new Error(`评论 ${post.id} 与父评论不在同一 thread`);
    if (parent.created > post.created)
      throw new Error(`评论 ${post.id} 的父评论晚于回复`);
  }

  for (const post of posts) rootId(post, byId, new Map());
}

function groupBy(items, key) {
  const grouped = new Map();
  for (const item of items) {
    const value = key(item);
    if (!grouped.has(value)) grouped.set(value, []);
    grouped.get(value).push(item);
  }
  return grouped;
}

function rootId(comment, byId, inferred) {
  let current = comment;
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    const parentId = inferred.get(current.id)?.pid || current.parentId;
    if (!parentId) return current.id;
    current = byId.get(parentId);
  }
  throw new Error(`评论 ${comment.id} 的父子关系存在循环或缺失`);
}

function addRelation(comment, parent, byId, inferred, source) {
  if (!parent || comment.threadId !== parent.threadId) {
    throw new Error(`评论 ${comment.id} 的候选父评论不在同一 thread`);
  }
  if (parent.created > comment.created) {
    throw new Error(`评论 ${comment.id} 的候选父评论晚于回复`);
  }
  inferred.set(comment.id, {
    id: comment.id,
    pid: parent.id,
    rid: rootId(parent, byId, inferred),
    source,
    gapHours: Number(
      ((comment.created - parent.created) / 3_600_000).toFixed(1),
    ),
    nick: comment.nick,
    parentNick: parent.nick,
    comment: comment.comment,
    parentComment: parent.comment,
  });
}

function inferRelations(posts) {
  const byId = new Map(posts.map((post) => [post.id, post]));
  const inferred = new Map();
  const threads = groupBy(posts, (post) => post.threadId);

  for (const comments of threads.values()) {
    comments.sort((left, right) => left.created - right.created);
    for (let index = 1; index < comments.length; index += 1) {
      const comment = comments[index];
      const previous = comments[index - 1];
      if (!comment.legacy || comment.parentId) continue;
      const semanticParentId = semanticParentOverrides.get(comment.id);
      if (semanticParentId) {
        addRelation(
          comment,
          byId.get(semanticParentId),
          byId,
          inferred,
          "semantic-follow-up",
        );
        continue;
      }
      const gap = comment.created - previous.created;
      if (gap > MAX_DIALOGUE_GAP_MS) continue;

      if (comment.nick === OWNER_NICK && previous.nick !== OWNER_NICK) {
        addRelation(comment, previous, byId, inferred, "adjacent-owner-reply");
        continue;
      }

      if (comment.nick !== OWNER_NICK && previous.nick === OWNER_NICK) {
        const root = byId.get(rootId(previous, byId, inferred));
        if (root?.nick === comment.nick) {
          addRelation(
            comment,
            previous,
            byId,
            inferred,
            "adjacent-visitor-follow-up",
          );
        }
      }
    }
  }

  return [...inferred.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

function planAvatars(posts) {
  const usernamesByNick = new Map();
  for (const post of posts) {
    if (!post.username) continue;
    if (!usernamesByNick.has(post.nick))
      usernamesByNick.set(post.nick, new Set());
    usernamesByNick.get(post.nick).add(post.username);
  }

  return posts
    .map((post) => {
      let username = post.username;
      let source = "disqus-registered-user";
      const matchingUsernames = usernamesByNick.get(post.nick);
      if (!username && matchingUsernames?.size === 1) {
        username = [...matchingUsernames][0];
        source = "exact-nickname-match";
      }
      if (!username) return null;
      return {
        id: post.id,
        avatar: `https://disqus.com/api/users/avatars/${encodeURIComponent(username)}.jpg`,
        username,
        nick: post.nick,
        source,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
}

const [inputPath, outputPath, ...options] = process.argv.slice(2);
if (!inputPath || !outputPath || options.length > 0) {
  usage();
} else {
  const xml = readFileSync(inputPath, "utf8");
  const posts = parsePosts(xml);
  if (posts.length === 0) throw new Error("没有找到 Disqus 评论");
  validatePosts(posts);
  const relations = inferRelations(posts);
  const avatars = planAvatars(posts);
  const plan = {
    generatedAt: new Date().toISOString(),
    input: {
      path: inputPath,
      sha256: createHash("sha256").update(xml).digest("hex"),
      comments: posts.length,
    },
    policy: {
      ownerNick: OWNER_NICK,
      maxDialogueGapDays: MAX_DIALOGUE_GAP_MS / 86_400_000,
      note: "relations 是推测结果；写入云数据库前必须人工确认范围",
    },
    summary: {
      legacyComments: posts.filter((post) => post.legacy).length,
      inferredRelations: relations.length,
      semanticOverrides: relations.filter(
        (relation) => relation.source === "semantic-follow-up",
      ).length,
      avatarUpdates: avatars.length,
      directDisqusAvatars: avatars.filter(
        (avatar) => avatar.source === "disqus-registered-user",
      ).length,
      exactNicknameAvatarMatches: avatars.filter(
        (avatar) => avatar.source === "exact-nickname-match",
      ).length,
    },
    relations,
    avatars,
  };
  writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, {
    flag: "wx",
  });
  console.log(JSON.stringify(plan.summary, null, 2));
  console.log(`恢复计划已生成：${outputPath}`);
}
