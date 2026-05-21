export interface TokenizedWord {
  raw: string;
  clean: string;
  start: number;
  end: number;
  paragraphIndex: number;
  indexInParagraph: number;
}

const PUNCT_RE = /[‘’“”"',.;:!?¿¡()\[\]—–-]/g;

export function normalizeWord(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(PUNCT_RE, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeStory(paragraphs: string[]): TokenizedWord[] {
  const out: TokenizedWord[] = [];
  paragraphs.forEach((p, pi) => {
    const matches = Array.from(p.matchAll(/\S+/g));
    matches.forEach((m, idx) => {
      const raw = m[0];
      const clean = normalizeWord(raw);
      if (!clean) return;
      out.push({
        raw,
        clean,
        start: m.index ?? 0,
        end: (m.index ?? 0) + raw.length,
        paragraphIndex: pi,
        indexInParagraph: idx,
      });
    });
  });
  return out;
}

export function countWords(paragraphs: string[]): number {
  return tokenizeStory(paragraphs).length;
}
