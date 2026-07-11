'use client';

import { useEffect, useRef, useState } from 'react';
import RichTextToolbar from './RichTextToolbar';

// contentEditable rich text with a floating B/I/U toolbar while focused.
export default function EditableText({
  html,
  onChange,
  className = '',
  style,
}: {
  html: string;
  onChange: (html: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Only push external html when not focused (avoids caret jumps).
  useEffect(() => {
    if (ref.current && !focused && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [html, focused]);

  return (
    <div className="relative">
      <RichTextToolbar visible={focused} />
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onChange(ref.current?.innerHTML ?? '');
        }}
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        className={`cursor-text rounded outline-none ring-offset-2 focus:ring-2 focus:ring-primary/60 ${className}`}
        style={style}
      />
    </div>
  );
}
