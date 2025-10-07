import { ArrowRight, BarChart3, Download, Mic, Network } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-workspace.png";

const heroHighlights = [
  {
    icon: Mic,
    label: "Speak in any language—Shunya AI listens and responds with tranquil, multi-sensory clarity.",
  },
  {
    icon: Network,
    label: "Geometric mind maps bloom from the void, tracing connections across every discipline.",
  },
  {
    icon: BarChart3,
    label: "Adaptive diagnostics balance strengths and gaps, composing bespoke practice paths.",
  },
  {
    icon: Download,
    label: "Capture calm insights as minimalist exports: PDF, PNG, and shareable links in seconds.",
  },
];

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6" id="home">
      <div className="container mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <BrandMark
              size="lg"
              titleClassName="text-4xl font-semibold leading-tight lg:text-6xl"
              taglineClassName="text-base lg:text-lg tracking-[0.12em]"
            />
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 backdrop-blur">
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Mindful intelligence workspace
              </span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground lg:text-6xl">
              Infinite intelligence, composed in stillness.
            </h1>
            <p className="text-lg text-foreground lg:text-xl">
              Shunya AI unifies voice, vision, and knowledge synthesis into a monochrome sanctuary for contemplative creation.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground lg:text-lg">
              Ask aloud or share documents, sketches, and videos. Shunya AI traces every signal into lucid mind maps, narrated guidance, and adaptive practice—speaking over 50 languages with serene precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/kuse-chat">
                <Button size="lg" className="gap-2 rounded-full">
                  Enter the workspace
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="#solutions">
                <Button size="lg" variant="outline" className="rounded-full">
                  Explore capabilities
                </Button>
              </Link>
            </div>
            <ul className="grid gap-3 pt-4 sm:grid-cols-2">
              {heroHighlights.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/30">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full border border-border bg-background"></div>
                <div className="h-10 w-10 rounded-full border border-border bg-muted"></div>
                <div className="h-10 w-10 rounded-full border border-border bg-muted/70"></div>
                <div className="h-10 w-10 rounded-full border border-border bg-muted/60"></div>
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-foreground">
                  <span aria-hidden>★★★★★</span>
                  <span className="text-xs tracking-[0.2em] text-muted-foreground">global resonance</span>
                </div>
                <p className="text-muted-foreground">
                  Trusted by <strong className="text-foreground">50,000+</strong> seekers of timeless insight
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Shunya AI workspace with meditative intelligence tools"
              className="w-full rounded-2xl border border-border shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
