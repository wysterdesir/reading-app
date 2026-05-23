import { Logo } from '../components/Logo';

interface Badge {
  id: string;
  label: string;
}

interface Props {
  badge: Badge;
  childName?: string;
  onClose: () => void;
}

export function Certificate({ badge, childName, onClose }: Props) {
  const date = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <div className="cert-overlay" onClick={onClose}>
      <div className="certificate" onClick={(e) => e.stopPropagation()}>
        <div className="cert__decor cert__decor--top">★&nbsp;&nbsp;★&nbsp;&nbsp;★</div>
        <div className="cert__logo">
          <Logo size={72} />
        </div>
        <div className="cert__kicker">Certificate of Reading</div>
        <div className="cert__line">This certifies that</div>
        <div className="cert__name">{childName?.trim() || 'this reader'}</div>
        <div className="cert__line">has reached the milestone of</div>
        <div className="cert__achievement">{badge.label}</div>
        <div className="cert__date">Awarded {date}</div>
        <div className="cert__decor cert__decor--bottom">★&nbsp;&nbsp;★&nbsp;&nbsp;★</div>
        <div className="cert__sig">— Starator</div>
        <div className="cert__actions">
          <button className="primary" onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
