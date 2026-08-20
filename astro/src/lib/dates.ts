export function displayDate(value: string): string {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? value;
}

export function parsePublishedAt(value: string): Date {
  const match = value
    .trim()
    .match(
      /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?(?:\s*(Z|[+-]\d{2}:?\d{2}))?$/,
    );
  if (!match) {
    throw new Error(`无法解析日期：${value}`);
  }

  const day = match[1];
  const hour = Number(match[2] ?? "0");
  const minute = Number(match[3] ?? "0");
  const second = Number(match[4] ?? "0");
  if (
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    Number.isNaN(second)
  ) {
    throw new Error(`无法解析日期：${value}`);
  }

  let offset = match[5] ?? "+08:00";
  if (offset === "Z") {
    offset = "+00:00";
  } else if (/^[+-]\d{4}$/.test(offset)) {
    offset = `${offset.slice(0, 3)}:${offset.slice(3)}`;
  }

  const clock = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  const publishedAt = new Date(`${day}T${clock}${offset}`);
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error(`无法解析日期：${value}`);
  }
  return publishedAt;
}
