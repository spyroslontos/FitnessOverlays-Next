import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t">
      <div className="mx-auto max-w-5xl py-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          <div className="flex-1 flex justify-center md:justify-start">
            <Image 
              src="/images/api_logo_pwrdBy_strava_horiz_black.svg" 
              alt="Powered by Strava API" 
              width={120}
              height={20}
              className="h-4 w-auto dark:hidden"
              style={{ width: "auto" }}
            />
            <Image 
              src="/images/api_logo_pwrdBy_strava_horiz_white.svg" 
              alt="Powered by Strava API" 
              width={120}
              height={20}
              className="h-4 w-auto hidden dark:block"
              style={{ width: "auto" }}
            />
          </div>

          <div className="flex-1 flex items-center justify-center gap-6">
            <a 
              href="https://strava.app.link/QzrdTbuZYSb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Strava"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
            </a>

            <a 
              href="https://x.com/spyroslontos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a 
              href="https://github.com/spyroslontos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"/>
              </svg>
            </a>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-end gap-2">
            <ModeToggle />
            <p className="text-xs text-muted-foreground">
              © 2026 FitnessOverlays
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
