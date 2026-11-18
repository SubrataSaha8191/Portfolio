import { LOGOS } from '../data/logos';

// Tools with no brand mark (concepts, or marks Simple Icons doesn't carry) get a compact monogram badge instead.
const ABBR = { RAG: 'RAG', 'LLM integrations': 'LLM', 'Training & evaluation': 'ML', 'REST APIs': 'API', 'Antigravity IDE': 'AG', 'VS Code': 'VS', 'XGBoost / Random Forest': 'XGB', Recharts: 'RC' };

export default function Logo({ name }) {
  const l = LOGOS[name];
  if (l) return <span className="logo" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d={l.p} fill={`#${l.h}`} /></svg></span>;
  const ab = ABBR[name];
  return ab ? <span className="logo logo--txt" aria-hidden="true"><b>{ab}</b></span> : null;
}
