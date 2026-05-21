import type { Language, Story, Tier } from '../types';
import { countWords } from './words';

interface GenerateOpts {
  apiKey: string;
  language: Language;
  tier: Tier;
}

const LANG_NAME: Record<Language, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
};

const TIER_GUIDANCE: Record<Tier, { wordCount: string; complexity: string }> = {
  1: {
    wordCount: '50 to 80 words total, in 2 short paragraphs',
    complexity:
      'use very common, decodable words; short sentences (4–8 words); concrete, sensory vocabulary; no idioms; present or simple past tense',
  },
  2: {
    wordCount: '80 to 130 words total, in 2 or 3 paragraphs',
    complexity:
      'use mostly common words with 1–2 slightly richer ones; sentences of 6–12 words; one or two compound sentences are fine; concrete imagery and a small surprise or twist',
  },
  3: {
    wordCount: '130 to 200 words total, in 3 paragraphs',
    complexity:
      'use a varied but still age-appropriate vocabulary; sentences of 8–15 words; some descriptive language and clear narrative arc with beginning/middle/end',
  },
};

export async function generateStory({ apiKey, language, tier }: GenerateOpts): Promise<Story> {
  const guide = TIER_GUIDANCE[tier];

  const prompt = `You are writing a short reading-practice story for a 7-year-old child (Grade 2) reading aloud at home.

Write the story in ${LANG_NAME[language]}. The child's native language is English, so for French/Spanish, lean toward vocabulary a Grade-2-equivalent ${LANG_NAME[language]} learner would know.

Story requirements:
- ${guide.wordCount}
- ${guide.complexity}
- Wholesome, gentle theme (no violence, no scary content, no consumer brands)
- A real beginning, middle, and end — not just a description
- Use a child-friendly main character with a name appropriate to the language
- Avoid words with numbers, abbreviations, or symbols (write everything out)

Then write exactly 2 comprehension questions. Each question must:
- Be a clear, specific factual or inferential question about the story
- Be answerable from the text alone
- Have 3 multiple-choice options with exactly one correct answer
- Indicate the correct option index (0, 1, or 2)

Return STRICT JSON only, no markdown fences, in this shape:

{
  "title": "Story title in ${LANG_NAME[language]}",
  "paragraphs": ["First paragraph.", "Second paragraph.", ...],
  "comprehension": [
    {"q": "Question 1?", "options": ["A", "B", "C"], "correctIndex": 0},
    {"q": "Question 2?", "options": ["A", "B", "C"], "correctIndex": 0}
  ]
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.content?.[0]?.text ?? '';
  const jsonText = extractJson(content);
  const parsed = JSON.parse(jsonText);

  if (!parsed.title || !Array.isArray(parsed.paragraphs) || !Array.isArray(parsed.comprehension)) {
    throw new Error('AI returned malformed story');
  }

  const story: Story = {
    id: `ai-${language}-${Date.now()}`,
    language,
    tier,
    title: String(parsed.title),
    paragraphs: parsed.paragraphs.map((p: any) => String(p)),
    wordCount: countWords(parsed.paragraphs.map((p: any) => String(p))),
    comprehension: parsed.comprehension.map((c: any) => ({
      q: String(c.q),
      options: c.options.map((o: any) => String(o)),
      correctIndex: Number(c.correctIndex) | 0,
    })),
    source: 'ai',
  };
  return story;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}
