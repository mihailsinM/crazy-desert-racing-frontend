import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { chatStickers, type ChatSticker } from "./chatStickers";

type Props = {
  inputRef: RefObject<HTMLInputElement | null>;
  onPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  onSticker: (sticker: ChatSticker) => void;
};

export default function ChatComposerMenu({ inputRef, onPhoto, onSticker }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <div className="du-chat-composer-menu" ref={containerRef}>
    <button type="button" className="du-chat-attach-button" aria-expanded={open} aria-haspopup="dialog" aria-label="Add photo or sticker" onClick={() => setOpen(!open)}>
      <span aria-hidden="true">＋</span>
    </button>
    <input ref={inputRef} className="du-chat-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { onPhoto(event); setOpen(false); }} />
    {open && <div className="du-chat-composer-popover" role="dialog" aria-label="Add to message">
      <button type="button" className="du-button du-button-small du-button-rect" onClick={() => { inputRef.current?.click(); setOpen(false); }}>Add photo or screenshot</button>
      <span className="du-chat-sticker-title">Crazy Desert stickers</span>
      <div className="du-chat-sticker-grid">
        {chatStickers.map((sticker) => <button key={sticker.filename} type="button" title={sticker.name} aria-label={`Attach ${sticker.name} sticker`} onClick={() => { onSticker(sticker); setOpen(false); }}>
          <img src={sticker.image} alt="" loading="lazy" />
        </button>)}
      </div>
    </div>}
  </div>;
}
