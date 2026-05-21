import { useState } from 'react';
import { Home } from './screens/Home';
import { StoryPicker } from './screens/StoryPicker';
import { Reader } from './screens/Reader';
import { Result } from './screens/Result';
import { ParentDashboard } from './screens/ParentDashboard';
import { ProgressProvider } from './state/ProgressContext';
import { SettingsProvider } from './state/SettingsContext';
import type { Story, SessionResult } from './types';

type Screen =
  | { name: 'home' }
  | { name: 'picker' }
  | { name: 'reader'; story: Story }
  | { name: 'result'; result: SessionResult; story: Story }
  | { name: 'parent' };

function Shell() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  return (
    <div className="app">
      {screen.name === 'home' && (
        <Home
          onStart={() => setScreen({ name: 'picker' })}
          onOpenParent={() => setScreen({ name: 'parent' })}
        />
      )}
      {screen.name === 'picker' && (
        <StoryPicker
          onBack={() => setScreen({ name: 'home' })}
          onPick={(story) => setScreen({ name: 'reader', story })}
        />
      )}
      {screen.name === 'reader' && (
        <Reader
          story={screen.story}
          onFinish={(result) => setScreen({ name: 'result', result, story: screen.story })}
          onExit={() => setScreen({ name: 'picker' })}
        />
      )}
      {screen.name === 'result' && (
        <Result
          result={screen.result}
          story={screen.story}
          onReread={() => setScreen({ name: 'reader', story: screen.story })}
          onNewStory={() => setScreen({ name: 'picker' })}
          onHome={() => setScreen({ name: 'home' })}
        />
      )}
      {screen.name === 'parent' && (
        <ParentDashboard onBack={() => setScreen({ name: 'home' })} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <Shell />
      </ProgressProvider>
    </SettingsProvider>
  );
}
