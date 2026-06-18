import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KindoAI — Free Multi-Engine Career Suite" },
      {
        name: "description",
        content:
          "KindoAI tailors your resume, generates a natural cover email, and chats with free AI engines directly in your browser.",
      },
      { property: "og:title", content: "KindoAI — Free Multi-Engine Career Suite" },
      {
        property: "og:description",
        content:
          "Tailor your resume and generate a natural cover email with free AI engines — fully client-side.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/app.html");
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white/70">
      <div className="text-sm">Loading KindoAI workspace…</div>
    </div>
  );
}
