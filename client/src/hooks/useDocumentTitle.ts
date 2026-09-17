import { useEffect } from "react";

/** guidance/accessibility.md: "Page titles are descriptive and unique per view." */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
