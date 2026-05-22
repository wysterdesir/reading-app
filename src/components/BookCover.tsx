/**
 * Vector cover illustrations for each story. Flat children's-book style,
 * crisp at any size, no external assets. The story title is overlaid
 * separately as HTML text so it works across all three languages.
 */

import type { ReactNode } from 'react';

interface Props {
  cover: string;
}

const W = 120;
const H = 168;

function Frame({ children, sky }: { children: ReactNode; sky: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="book-cover-svg"
      aria-hidden="true"
    >
      <rect width={W} height={H} fill={sky} />
      {children}
    </svg>
  );
}

function star(x: number, y: number, r: number, fill = '#f6edc4') {
  return <circle cx={x} cy={y} r={r} fill={fill} key={`s${x}-${y}`} />;
}

const COVERS: Record<string, JSX.Element> = {
  'dog': (
    <Frame sky="#cfe6f0">
      <circle cx={92} cy={30} r={16} fill="#f4cf5e" />
      <rect y={118} width={W} height={50} fill="#a6c882" />
      <ellipse cx={60} cy={120} rx={34} ry={9} fill="#000" opacity={0.08} />
      {/* dog body */}
      <ellipse cx={58} cy={104} rx={26} ry={17} fill="#b0824f" />
      <circle cx={82} cy={88} r={16} fill="#bb8c57" />
      <ellipse cx={74} cy={82} rx={5} ry={9} fill="#8c6238" />
      <circle cx={88} cy={86} r={2.6} fill="#2e2218" />
      <circle cx={92} cy={94} r={3} fill="#2e2218" />
      <path d="M36 100 q-10 4 -12 16" stroke="#b0824f" strokeWidth={7} fill="none" strokeLinecap="round" />
      <rect x={44} y={116} width={7} height={14} rx={3} fill="#9a6f42" />
      <rect x={66} y={116} width={7} height={14} rx={3} fill="#9a6f42" />
    </Frame>
  ),
  'apple': (
    <Frame sky="#f3e8d2">
      <rect y={128} width={W} height={40} fill="#e5d3b0" />
      <ellipse cx={60} cy={130} rx={40} ry={8} fill="#000" opacity={0.07} />
      <path d="M60 52 q-30 0 -30 36 q0 38 30 44 q30 -6 30 -44 q0 -36 -30 -36 z" fill="#c0433b" />
      <path d="M60 56 q-14 2 -18 20" stroke="#e88" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
      <rect x={57} y={40} width={6} height={16} rx={3} fill="#6b4a2c" />
      <path d="M63 44 q18 -8 26 4 q-16 8 -26 -4 z" fill="#6c9a4e" />
    </Frame>
  ),
  'sun': (
    <Frame sky="#acd6ee">
      <rect y={120} width={W} height={48} fill="#90bd6c" />
      <g stroke="#f0b231" strokeWidth={5} strokeLinecap="round">
        <line x1={60} y1={18} x2={60} y2={4} />
        <line x1={88} y1={30} x2={98} y2={20} />
        <line x1={32} y1={30} x2={22} y2={20} />
        <line x1={96} y1={56} x2={110} y2={56} />
        <line x1={24} y1={56} x2={10} y2={56} />
      </g>
      <circle cx={60} cy={56} r={26} fill="#f4bd3e" />
      <path d="M14 120 q22 -18 44 0 q22 18 48 0" stroke="#7aa658" strokeWidth={4} fill="none" opacity={0.5} />
      <path d="M84 96 q6 -8 12 0 q-6 4 -12 0z" fill="#3a3a3a" />
      <line x1={90} y1={96} x2={90} y2={106} stroke="#3a3a3a" strokeWidth={2} />
    </Frame>
  ),
  'cat-night': (
    <Frame sky="#2c2e54">
      <rect y={84} width={W} height={84} fill="#3b3c66" />
      <circle cx={86} cy={36} r={17} fill="#f3e6b0" />
      <circle cx={79} cy={32} r={14} fill="#2c2e54" />
      {star(24, 26, 2.4)}
      {star(44, 16, 1.8)}
      {star(108, 70, 2)}
      {star(18, 60, 1.8)}
      {star(60, 40, 1.6)}
      {/* windowsill + cat */}
      <rect y={120} width={W} height={48} fill="#5a4632" />
      <ellipse cx={54} cy={120} rx={20} ry={22} fill="#1c1c2e" />
      <path d="M40 104 l8 -14 6 12 z" fill="#1c1c2e" />
      <path d="M68 104 l-8 -14 -6 12 z" fill="#1c1c2e" />
      <path d="M72 118 q16 -2 18 18" stroke="#1c1c2e" strokeWidth={7} fill="none" strokeLinecap="round" />
      <circle cx={48} cy={114} r={2.4} fill="#9bd36b" />
      <circle cx={60} cy={114} r={2.4} fill="#9bd36b" />
    </Frame>
  ),
  'fox-snow': (
    <Frame sky="#d8e4ea">
      <rect y={112} width={W} height={56} fill="#f3f7fa" />
      <ellipse cx={60} cy={116} rx={40} ry={10} fill="#000" opacity={0.05} />
      {star(26, 30, 2, '#fff')}
      {star(94, 22, 2.4, '#fff')}
      {star(50, 54, 1.8, '#fff')}
      {star(100, 64, 1.8, '#fff')}
      {/* fox */}
      <ellipse cx={56} cy={104} rx={24} ry={15} fill="#c8784c" />
      <path d="M30 100 q-12 6 -10 18 q12 0 16 -10z" fill="#c8784c" />
      <circle cx={78} cy={90} r={14} fill="#d2855a" />
      <path d="M68 78 l-3 -12 9 7z" fill="#b3623c" />
      <path d="M88 78 l3 -12 -9 7z" fill="#b3623c" />
      <path d="M70 96 q8 8 16 0 q-8 6 -16 0z" fill="#fff" />
      <circle cx={84} cy={90} r={2.4} fill="#2e2218" />
      <circle cx={89} cy={97} r={2.6} fill="#2e2218" />
      {/* mitten */}
      <rect x={20} y={120} width={14} height={14} rx={4} fill="#3a6a9a" />
    </Frame>
  ),
  'snail-garden': (
    <Frame sky="#d2ead0">
      <circle cx={96} cy={28} r={13} fill="#f4cf5e" />
      <rect y={110} width={W} height={58} fill="#7faa5c" />
      <path d="M10 110 q14 -36 40 -30 q-6 30 -40 30z" fill="#5f8a4d" />
      <path d="M30 96 q4 -22 0 -34" stroke="#456a36" strokeWidth={3} fill="none" />
      {/* snail */}
      <ellipse cx={60} cy={130} rx={26} ry={9} fill="#c9a26f" />
      <circle cx={68} cy={122} r={16} fill="#b0855a" />
      <circle cx={68} cy={122} r={10} fill="#c9a880" />
      <circle cx={68} cy={122} r={4} fill="#b0855a" />
      <path d="M44 130 q-8 -2 -10 -12" stroke="#c9a26f" strokeWidth={6} fill="none" strokeLinecap="round" />
      <line x1={34} y1={118} x2={31} y2={110} stroke="#c9a26f" strokeWidth={2.4} />
      <circle cx={31} cy={109} r={2} fill="#2e2218" />
    </Frame>
  ),
  'paper-boat': (
    <Frame sky="#bcd9e8">
      <circle cx={94} cy={28} r={12} fill="#f6e08a" />
      <rect y={96} width={W} height={72} fill="#4a7fa5" />
      <path d="M0 104 q15 -10 30 0 t30 0 t30 0 t30 0v64H0z" fill="#3f6f93" />
      {/* paper boat */}
      <path d="M34 92 h52 l-12 22 H46 z" fill="#fbfbf6" />
      <path d="M60 92 l0 -34 22 34 z" fill="#f0f0e6" />
      <path d="M60 58 l-20 34 20 0 z" fill="#fbfbf6" />
      <path d="M34 92 h52 l-4 7 H38 z" fill="#dcdccf" />
    </Frame>
  ),
  'telescope': (
    <Frame sky="#2e2b50">
      <path d="M88 22 a16 16 0 1 0 6 28 a13 13 0 1 1 -6 -28z" fill="#f3e6b0" />
      {star(22, 28, 2.6)}
      {star(40, 18, 1.8)}
      {star(64, 36, 2)}
      {star(20, 58, 1.8)}
      {star(102, 74, 2.2)}
      {star(48, 70, 1.6)}
      <rect y={132} width={W} height={36} fill="#23213d" />
      {/* telescope */}
      <rect x={44} y={70} width={44} height={13} rx={6} fill="#c89a4e" transform="rotate(-32 66 76)" />
      <circle cx={84} cy={58} r={9} fill="#e5be6e" />
      <line x1={56} y1={92} x2={44} y2={132} stroke="#7a5a32" strokeWidth={5} strokeLinecap="round" />
      <line x1={62} y1={92} x2={78} y2={132} stroke="#7a5a32" strokeWidth={5} strokeLinecap="round" />
      <line x1={59} y1={86} x2={59} y2={132} stroke="#7a5a32" strokeWidth={5} strokeLinecap="round" />
    </Frame>
  ),
  'drawing': (
    <Frame sky="#efe7d6">
      <rect x={22} y={28} width={76} height={104} rx={4} fill="#fbf9f2" stroke="#d8cdb4" strokeWidth={2} />
      <path d="M40 96 q10 -34 28 -14 q14 16 24 -8" stroke="#c0433b" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M36 70 q14 14 30 -2 q12 -12 22 6" stroke="#3a6a9a" strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={74} cy={50} r={6} fill="#f0b231" />
      {/* pencil */}
      <g transform="rotate(38 86 118)">
        <rect x={70} y={112} width={40} height={11} rx={2} fill="#e7b94a" />
        <path d="M110 112 l12 5.5 -12 5.5z" fill="#f3e3bd" />
        <path d="M118 115 l4 2.5 -4 2.5z" fill="#3a3a3a" />
        <rect x={66} y={112} width={6} height={11} fill="#d98f8f" />
      </g>
    </Frame>
  ),
  'bottle-sea': (
    <Frame sky="#bcd2dd">
      <circle cx={26} cy={30} r={11} fill="#f6e7a8" />
      <rect y={92} width={W} height={76} fill="#2f6f86" />
      <path d="M0 100 q15 -10 30 0 t30 0 t30 0 t30 0v68H0z" fill="#2a627a" />
      <path d="M0 118 q15 -9 30 0 t30 0 t30 0 t30 0v50H0z" fill="#26586d" />
      {/* bottle */}
      <g transform="rotate(20 60 110)">
        <rect x={48} y={86} width={24} height={42} rx={9} fill="#9fc6c0" opacity={0.92} />
        <rect x={55} y={74} width={10} height={16} rx={2} fill="#9fc6c0" opacity={0.92} />
        <rect x={54} y={70} width={12} height={7} rx={2} fill="#8a6a44" />
        <rect x={53} y={98} width={14} height={18} rx={2} fill="#f3ecd6" />
      </g>
    </Frame>
  ),
  'lighthouse': (
    <Frame sky="#44506e">
      <circle cx={92} cy={30} r={9} fill="#f3e6b0" />
      {star(24, 24, 2)}
      {star(50, 16, 1.6)}
      {star(108, 58, 1.8)}
      {/* beam */}
      <path d="M58 52 L116 24 L116 52 Z" fill="#f6e7a8" opacity={0.45} />
      <path d="M58 52 L116 56 L116 84 Z" fill="#f6e7a8" opacity={0.3} />
      <rect y={120} width={W} height={48} fill="#2e4a5e" />
      <path d="M0 124 q15 -8 30 0 t30 0 t30 0 t30 0v44H0z" fill="#284052" />
      {/* lighthouse */}
      <path d="M48 120 L52 56 H68 L72 120 Z" fill="#f4f1e8" />
      <path d="M50 104 H70 v9 H49 Z" fill="#c0433b" />
      <path d="M51 84 H69 v9 H50 Z" fill="#c0433b" />
      <path d="M53 64 H67 v9 H52 Z" fill="#c0433b" />
      <rect x={50} y={44} width={20} height={13} rx={2} fill="#3a3a3a" />
      <circle cx={60} cy={50} r={5} fill="#f6d65e" />
      <path d="M52 44 L60 34 L68 44 Z" fill="#9a3b34" />
    </Frame>
  ),
};

export function BookCover({ cover }: Props) {
  return COVERS[cover] ?? <Frame sky="#8c5a2c"><rect /></Frame>;
}
