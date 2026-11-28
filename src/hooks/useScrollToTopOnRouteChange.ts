import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets the scroll position of a persistent scrollable layout container (and window)
 * back to the top whenever the route pathname or query string changes.
 */
export function useScrollToTopOnRouteChange(containerRef: RefObject<HTMLElement | null>): void {
    const { pathname, search } = useLocation();

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: "auto" });
        }
        window.scrollTo({ top: 0, behavior: "auto" });
    }, [containerRef, pathname, search]);
}
