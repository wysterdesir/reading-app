import { useMemo, useState } from 'react';
import type { SessionResult, Story } from '../types';
import { useProgress } from '../state/ProgressContext';

interface Props {
  result: SessionResult;
  story: Story;
  onReread: () => void;
  onNewStory: () => void;
  onHome: () => void;
}

const PRAISE = [
  'Beautiful reading.',
  'Look at all those words.',
  'Steady and clear — well done.',
  'You stuck with it. That matters.',
  'Your voice carried the story.',
  'Wonderful, all the way through.',
];

export function Result({ result, story, onReread, onNewStory, onHome }: Props) {
  const { progress, recordSession } = useProgress();
  const hasComp = story.comprehension.length > 0;
  const [step, setStep] = useState<'comp' | 'done'>(hasComp ? 'comp' : 'done');
  const [answers, setAnswers] = useState<number[]>([]);

  const prevBest = progress.personalBests[story.id];
  const submitted = step === 'done';
  const accent = story.accent ?? 'var(--accent)';
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], []);

  const recordWith = (correct: number) => {
    recordSession({
      ...result,
      compCorrect: correct,
      compTotal: story.comprehension.length,
    });
  };

  const handleAnswer = (choiceIdx: number) => {
    const next = [...answers, choiceIdx];
    setAnswers(next);
    if (next.length >= story.comprehension.length) {
      const correct = next.reduce(
        (n, a, i) => n + (a === story.comprehension[i].correctIndex ? 1 : 0),
        0
      );
      recordWith(correct);
      setStep('done');
    }
  };

  const skip = () => {
    recordWith(0);
    setStep('done');
  };

  if (step === 'comp') {
    const idx = answers.length;
    const q = story.comprehension[idx];
    return (
      <div className="screen stack">
        <div className="row between">
          <button className="ghost" onClick={onHome}>← Home</button>
          <div className="muted">Quick check</div>
          <div style={{ width: 70 }} />
        </div>
        <div className="card stack" style={{ borderLeft: `4px solid ${accent}` }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            Question {idx + 1} of {story.comprehension.length}
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{q.q}</div>
          <div className="comp-q">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <button className="ghost" onClick={skip}>Skip questions</button>
      </div>
    );
  }

  const correctSoFar = answers.reduce(
    (n, a, i) => n + (a === story.comprehension[i].correctIndex ? 1 : 0),
    0
  );
  const isNewBest = !prevBest || result.wpm > prevBest.wpm;
  const minutes = Math.floor(result.durationSec / 60);
  const seconds = Math.floor(result.durationSec % 60);
  const timeLabel =
    minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} seconds`;

  return (
    <div className="screen stack">
      <div className="row between">
        <button className="ghost" onClick={onHome}>← Home</button>
        <div className="muted">{story.emoji} {story.title}</div>
        <div style={{ width: 70 }} />
      </div>

      <div className="card stack" style={{ textAlign: 'center', borderTop: `4px solid ${accent}` }}>
        <div style={{ fontSize: '3rem' }}>{story.emoji}</div>
        <div className="muted">{praise}</div>
        <div className="result__big">
          {isNewBest && submitted ? '⭐ Personal best ⭐' : 'Story complete'}
        </div>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div className="chip">📖 {result.totalWords} words</div>
          <div className="chip">⏱ {timeLabel}</div>
          {hasComp && submitted && (
            <div className="chip">💭 {correctSoFar}/{story.comprehension.length} questions</div>
          )}
        </div>
      </div>

      <div className="card stack-sm" style={{ borderLeft: `4px solid ${accent}` }}>
        <div style={{ fontWeight: 600 }}>Read it again?</div>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Reading the same story twice is one of the best ways to grow as a
          reader. The tricky words feel easier each time.
        </p>
        <div className="row">
          <button className="primary" onClick={onReread}>↻ Read it again</button>
          <button onClick={onNewStory}>Pick a different story</button>
        </div>
      </div>
    </div>
  );
}
