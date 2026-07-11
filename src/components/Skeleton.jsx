// src/components/Skeleton.jsx
export function SkeletonLine({ width = '100%', height = 14, radius = 8, style = {} }) {
  return (
    <div className="skeleton" style={{
      width, height,
      borderRadius: radius,
      ...style,
    }} />
  );
}

export function SkeletonCard({ height = 90 }) {
  return (
    <div style={{
      background: 'var(--runit-surface)',
      border: '1px solid var(--runit-border)',
      borderRadius: 18, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLine width="60%" height={14} />
        <SkeletonLine width="18%" height={22} radius={50} />
      </div>
      <SkeletonLine width="85%" height={12} />
      <SkeletonLine width="40%" height={12} />
    </div>
  );
}

export function SkeletonStatGrid({ count = 3 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: 10,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--runit-surface)',
          border: '1px solid var(--runit-border)',
          borderRadius: 16, padding: '16px 12px',
          display: 'flex', flexDirection: 'column',
          gap: 8, alignItems: 'center',
        }}>
          <SkeletonLine width="50%" height={22} />
          <SkeletonLine width="70%" height={10} />
        </div>
      ))}
    </div>
  );
}