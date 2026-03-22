"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";
import { AnimatedHeart } from "./animated-heart";

const heroStats = [
  {
    stat: "~292K",
    accent: "text-red-500",
    description: "U.S. adult IHCA / year",
  },
  {
    stat: "25.8%",
    accent: "text-foreground",
    description: "survive to discharge",
  },
  {
    stat: "18-29%",
    accent: "text-foreground",
    description: "avoidable on review",
  },
  {
    stat: "~170K",
    accent: "text-foreground",
    description: "silent heart attacks / year",
  },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-36">
        {/* Animated heart background */}
        <div className="absolute right-0 top-1/2 z-0 h-[460px] w-[460px] translate-x-10 -translate-y-1/2 opacity-75 pointer-events-none lg:right-[4%] lg:top-[47%] lg:h-[680px] lg:w-[680px] lg:translate-x-20 xl:right-[8%] xl:top-[45%] xl:h-[760px] xl:w-[760px] xl:translate-x-24">
          <AnimatedHeart />
        </div>

        <div className="relative z-10 lg:translate-y-14 xl:translate-y-16">
          {/* Eyebrow */}
          <div 
            className={`mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <Activity className="w-4 h-4 text-red-500 animate-pulse" />
              Autonomous Cardiac Surveillance for Paralyzed Patients
            </span>
          </div>
          
          {/* Main headline */}
          <div className="mb-12">
            <h1 
              className={`text-[clamp(3rem,10vw,8rem)] font-display leading-[0.9] tracking-tight transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="block font-mono">~n0</span>
              <span className="block text-[0.5em] text-muted-foreground font-sans font-light mt-4">
                Neural Zero
              </span>
            </h1>
          </div>

          {/* Description */}
          <div className="space-y-6 max-w-xl">
            <p 
              className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              A predictive biological surveillance system using computer vision 
              and a Multi-Agent AI Swarm to predict cardiac failure in paralyzed 
              patients <span className="text-foreground font-medium">before it happens</span>.
            </p>
            <p 
              className={`text-base text-muted-foreground/70 leading-relaxed max-w-xl transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              We read the invisible autonomic warning signs straight off their face 
              using a standard $50 webcam.
            </p>
          </div>

          <div 
            className={`mt-8 flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 lg:absolute lg:left-[52%] lg:top-[57%] lg:mt-0 xl:left-[53%] xl:top-[56%] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button 
              asChild
              size="lg" 
              className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
            >
              <Link href="/console">
                Launch Console
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div
            className={`mt-52 lg:mt-80 lg:-translate-y-10 xl:-translate-y-12 transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-baseline gap-4 border-t border-foreground/10 pt-5 lg:gap-5">
                {heroStats.map((item) => (
                  <div key={item.stat} className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className={`text-3xl lg:text-[2.7rem] font-mono font-bold ${item.accent}`}>{item.stat}</span>
                    <span className="text-[11px] lg:text-xs text-muted-foreground">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
