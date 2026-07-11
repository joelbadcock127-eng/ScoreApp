'use client';

// Floating B / I / U toolbar for contentEditable fields (like ScoreApp's inline editor).
export default function RichTextToolbar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const exec = (cmd: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(cmd);
  };
  return (
    <div
      className="absolute -top-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-card"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button onMouseDown={exec('bold')} className="rounded px-2.5 py-1 font-bold hover:bg-gray-100">
        B
      </button>
      <button onMouseDown={exec('italic')} className="rounded px-2.5 py-1 italic hover:bg-gray-100">
        I
      </button>
      <button onMouseDown={exec('underline')} className="rounded px-2.5 py-1 underline hover:bg-gray-100">
        U
      </button>
    </div>
  );
}
