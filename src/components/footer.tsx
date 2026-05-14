import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-8 pt-4 pb-6 text-center text-xs text-muted-foreground">
      <p className="flex items-center justify-center gap-1.5">
        Developed with <Heart className="w-3 h-3 text-destructive fill-destructive" /> by{" "}
        <a
          href="https://github.com/anointedthedeveloper"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          anointedthedeveloper
        </a>
      </p>
    </footer>
  );
}
