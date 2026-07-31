"use client";

import { useEffect, useRef } from "react";

/**
 * Injects admin-configured custom code (HTML / CSS / tracking scripts) into the
 * home page. Setting innerHTML alone will NOT run any <script> tags, so we clone
 * each script into a fresh element the browser will actually execute.
 */
export default function HomeCustomCode({ code }: { code?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!code || !code.trim()) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = code;

    // Re-create every <script> so inline and external scripts execute.
    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    return () => {
      container.innerHTML = "";
    };
  }, [code]);

  if (!code || !code.trim()) return null;

  return <div ref={containerRef} className="home-custom-code" />;
}
