import Link from "next/link";
import { Compass, Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Page not found</h1>
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
          The intelligence you're looking for doesn't exist or may have been
          archived. Check the URL or head back to the workspace.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <Link href="/" className="gap-1.5">
            <Home className="h-3.5 w-3.5" /> Back to projects
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/project/arbitrum" className="gap-1.5">
            <Compass className="h-3.5 w-3.5" /> Open Arbitrum
          </Link>
        </Button>
      </div>
    </div>
  );
}
