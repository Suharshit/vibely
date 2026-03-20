// ============================================================
// hooks/useProgressiveImage.ts
// ============================================================
// Progressive image loading: starts with a low-res thumbnail,
// then upgrades to a high-res preview when the element is
// visible in the viewport. Like Instagram/Pinterest.
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

interface UseProgressiveImageOptions {
  thumbnail: string;
  preview: string;
  /** Root margin for IntersectionObserver (default: "200px") */
  rootMargin?: string;
}

interface UseProgressiveImageReturn {
  src: string;
  isHighRes: boolean;
  ref: React.RefCallback<HTMLElement>;
}

export function useProgressiveImage({
  thumbnail,
  preview,
  rootMargin = "200px",
}: UseProgressiveImageOptions): UseProgressiveImageReturn {
  const [src, setSrc] = useState(thumbnail);
  const [isHighRes, setIsHighRes] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Ref callback — sets up IntersectionObserver when element mounts
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) {
        elementRef.current = null;
        return;
      }

      elementRef.current = node;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observerRef.current?.disconnect();
          }
        },
        { rootMargin }
      );

      observerRef.current.observe(node);
    },
    [rootMargin]
  );

  // Load high-res image when visible
  useEffect(() => {
    if (!isVisible || !preview || isHighRes) return;

    const img = new Image();
    img.onload = () => {
      setSrc(preview);
      setIsHighRes(true);
    };
    // On error, keep the thumbnail — fail silently
    img.onerror = () => {};
    img.src = preview;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, preview, isHighRes]);

  // Adjust state when props change (synchronous reset during render)
  const [prevThumbnail, setPrevThumbnail] = useState(thumbnail);
  const [prevPreview, setPrevPreview] = useState(preview);

  if (thumbnail !== prevThumbnail || preview !== prevPreview) {
    setPrevThumbnail(thumbnail);
    setPrevPreview(preview);
    setSrc(thumbnail);
    setIsHighRes(false);
    setIsVisible(false);
  }

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { src, isHighRes, ref: setRef };
}
