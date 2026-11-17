// Real screenshot when one exists; otherwise a typographic diagram card
// (FaceLock has no hosted UI, so it gets a pipeline sketch of its real flow).
export default function ProjectVisual({ project, className = '' }) {
  if (project.img) {
    return <img className={`pv ${className}`} src={project.img} alt={`${project.title} screenshot`} loading="lazy" decoding="async" draggable="false" />;
  }
  return (
    <div className={`pv pv--card ${className}`} role="img" aria-label={`${project.title} pipeline: camera, detect, embed, match, PAM`}>
      <span className="mono">face → unlock</span>
      <ol>
        {['camera', 'YuNet detect', 'SFace embed', 'match', 'PAM'].map((s, i) => (
          <li key={s}><b>{String(i + 1).padStart(2, '0')}</b>{s}</li>
        ))}
      </ol>
      <strong>{project.title}</strong>
    </div>
  );
}
