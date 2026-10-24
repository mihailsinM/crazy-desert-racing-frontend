import { useRef, useState, type TouchEvent } from "react";

import type { FocalImageFit } from "./FocalImage";
import AuthenticatedFocalImage from "./AuthenticatedFocalImage";

type Point = { x: number; y: number };
type View = Point & { scale: number };
type Gesture = { center: Point; distance: number };
type GestureTouches = TouchEvent<HTMLDivElement>["touches"];

type Props = {
  src: string;
  alt: string;
  fit?: FocalImageFit;
  focusX?: number;
  focusY?: number;
  cropPercent?: number;
};

const INITIAL_VIEW: View = { x: 0, y: 0, scale: 1 };

function touchCenter(touches: GestureTouches): Point {
  const first = touches.item(0)!;
  if (touches.length < 2) return { x: first.clientX, y: first.clientY };
  const second = touches.item(1)!;
  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
}

function touchDistance(touches: GestureTouches): number {
  const first = touches.item(0)!;
  const second = touches.item(1)!;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function ZoomablePhoto({ src, alt, fit, focusX, focusY, cropPercent }: Props) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const viewRef = useRef<View>(INITIAL_VIEW);
  const [view, setView] = useState<View>(INITIAL_VIEW);

  function updateView(next: View) {
    const surface = surfaceRef.current;
    if (!surface) return;
    const scale = Math.max(1, Math.min(4, next.scale));
    const xLimit = (scale - 1) * surface.clientWidth / 2;
    const yLimit = (scale - 1) * surface.clientHeight / 2;
    const clamped = {
      scale,
      x: Math.max(-xLimit, Math.min(xLimit, next.x)),
      y: Math.max(-yLimit, Math.min(yLimit, next.y)),
    };
    viewRef.current = clamped;
    setView(clamped);
  }

  function startGesture(event: TouchEvent<HTMLDivElement>) {
    gestureRef.current = {
      center: touchCenter(event.touches),
      distance: event.touches.length > 1 ? touchDistance(event.touches) : 0,
    };
  }

  function moveGesture(event: TouchEvent<HTMLDivElement>) {
    const previous = gestureRef.current;
    if (!previous || event.touches.length === 0) return;
    const center = touchCenter(event.touches);
    const distance = event.touches.length > 1 ? touchDistance(event.touches) : 0;
    const current = viewRef.current;
    if (distance > 0 && previous.distance > 0) {
      const scale = Math.max(1, Math.min(4, current.scale * distance / previous.distance));
      const surface = surfaceRef.current!.getBoundingClientRect();
      const anchorX = center.x - surface.left - surface.width / 2;
      const anchorY = center.y - surface.top - surface.height / 2;
      updateView({
        scale,
        x: anchorX + (current.x - anchorX) * scale / current.scale + center.x - previous.center.x,
        y: anchorY + (current.y - anchorY) * scale / current.scale + center.y - previous.center.y,
      });
    } else if (distance === 0 && previous.distance === 0 && current.scale > 1) {
      updateView({
        ...current,
        x: current.x + center.x - previous.center.x,
        y: current.y + center.y - previous.center.y,
      });
    }
    gestureRef.current = { center, distance };
  }

  function endGesture(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length) startGesture(event);
    else gestureRef.current = null;
  }

  return (
    <div
      ref={surfaceRef}
      className="du-photo-zoom-surface"
      onTouchStart={startGesture}
      onTouchMove={moveGesture}
      onTouchEnd={endGesture}
      onTouchCancel={endGesture}
      onDoubleClick={() => updateView(viewRef.current.scale > 1
        ? INITIAL_VIEW : { x: 0, y: 0, scale: 2 })}
    >
      <div className="du-photo-zoom-content" style={{
        transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
      }}>
        <AuthenticatedFocalImage
          src={src}
          alt={alt}
          fit={fit}
          focusX={focusX}
          focusY={focusY}
          cropPercent={cropPercent}
          draggable={false}
        />
      </div>
    </div>
  );
}

export default ZoomablePhoto;
