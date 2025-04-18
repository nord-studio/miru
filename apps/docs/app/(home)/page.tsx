import { Button } from "@/app/(home)/ui/button";
import TextShimmer from "@/components/ui/text-shimmer";
import { ArrowRight, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative mx-auto mt-32 max-w-7xl text-center">
      <div className="backdrop-filter-[12px] group inline-flex h-7 items-center justify-between gap-1 rounded-full border dark:border-white/5 bg-black/5 dark:bg-white/10 px-3 text-xs text-white transition-all ease-in hover:cursor-pointer hover:bg-black/10 dark:hover:bg-white/15 dark:text-black">
        <TextShimmer className="inline-flex items-center justify-center">
          <span>Introducing Miru</span>{" "}
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>
      <h1 className="text-balance font-display font-black bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-4xl leading-none tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl dark:from-white dark:to-white/40">
        Status page and monitoring service for humans.
      </h1>
      <p className="text-balance text-lg tracking-tight text-neutral-500 dark:text-neutral-400 md:text-xl">
        A free, open-source, and fully customisable status page and monitoring service.
      </p>
      <div className="flex flex-row gap-3 items-center justify-center w-full pt-8">
        <Link href="/docs">
          <Button>
            Get Started <ArrowRight />
          </Button>
        </Link>
        <Link href="https://github.com/nord-studio/miru" target="_blank">
          <Button variant="secondary">
            View on GitHub
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
          </Button>
        </Link>
      </div>
    </main>
  );
}
