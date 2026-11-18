// The site's one recurring object: an aerosol can. Nozzle tip is at the top-left after rotation.
export default function CanIcon({ color = '#ff3b1d', className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 70" aria-hidden="true" focusable="false">
      <rect x="22" y="1" width="8" height="10" rx="2" fill="#0d0c0b" />
      <rect x="15" y="9" width="22" height="14" rx="4" fill="#efe8d6" stroke="#0d0c0b" strokeWidth="2.5" />
      <rect x="11" y="21" width="30" height="46" rx="7" fill={color} stroke="#0d0c0b" strokeWidth="2.5" />
      <rect x="11" y="34" width="30" height="9" fill="#0d0c0b" opacity=".85" />
      <rect x="17" y="47" width="6" height="16" rx="3" fill="#fff" opacity=".35" />
    </svg>
  );
}
