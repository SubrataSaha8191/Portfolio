import { useRef } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';

// Polymorphic magnetic wrapper: <Magnetic as="a" href=... className=... />
export default function Magnetic({ as: Tag = 'button', strength = 0.35, innerRef, children, ...rest }) {
  const ref = useRef(null);
  useMagnetic(ref, strength);
  return (
    <Tag ref={(n) => { ref.current = n; if (innerRef) innerRef.current = n; }} {...rest}>
      {children}
    </Tag>
  );
}
