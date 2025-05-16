import { Button } from "@/app/(home)/ui/button";
import { GitHub } from "@/components/icons";
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
          <Button variant="outline">
            View on GitHub
            <GitHub />
          </Button>
        </Link>
      </div>
    </main>
  );
}
