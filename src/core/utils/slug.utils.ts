import { randomBytes } from 'node:crypto';

/**
 * URL-safe slug from human-readable text (church name, etc.).
 */
export function slugify(input: string): string {
  const s = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s;
}

/**
 * Picks a slug that does not yet exist, using `base` from {@link slugify} and numeric
 * suffixes, then a short random suffix if needed.
 */
export async function uniqueSlug(
  sourceLabel: string,
  exists: (slug: string) => Promise<boolean>,
  options?: { maxNumericSuffix?: number },
): Promise<string> {
  const maxNumeric = options?.maxNumericSuffix ?? 500;
  const base = slugify(sourceLabel) || 'church';

  if (!(await exists(base))) {
    return base;
  }

  for (let n = 2; n <= maxNumeric; n++) {
    const candidate = `${base}-${n}`;
    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  const suffix = randomBytes(4).toString('hex');
  return `${base}-${suffix}`;
}
