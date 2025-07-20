import { Button } from "@/app/(home)/ui/button";
import { GitHub } from "@/components/icons";
import TextShimmer from "@/components/ui/text-shimmer";
import { ArrowRight, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-16 items-center w-full h-full">
      <div className="relative mx-auto mt-32 max-w-7xl text-center">
        <h1 className="text-balance font-display font-black bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-4xl leading-none tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl dark:from-white dark:to-white/40">
          Monitor your services without the bullsh*t.
        </h1>
        <p className="text-balance text-lg tracking-tight text-neutral-500 dark:text-neutral-400 md:text-xl">
          Miru is a truly open alternative status page and monitoring service by humans, for humans. <br />
          No secrets. No subscriptions. Just uptime.
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
      </div>
      <div className="border rounded-md"></div>
    </main>
  );
}
