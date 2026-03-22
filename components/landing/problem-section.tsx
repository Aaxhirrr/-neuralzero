"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Heart, Brain, Activity } from "lucide-react";

const problems = [
  {
    icon: Heart,
    stat: "~292K",
    title: "In-Hospital Cardiac Arrest Burden",
    description: "About 292,000 adult in-hospital cardiac arrests occur in the U.S. each year, making deterioration inside the hospital a large and ongoing surveillance problem.",
  },
  {
    icon: Brain,
    stat: "25.8%",
    title: "Survival After Arrest Is Still Low",
    description: "Only about 25.8% survive to hospital discharge after in-hospital cardiac arrest, which means most patients still lose even when the event happens inside a monitored setting.",
  },
  {
    icon: Activity,
    stat: "72-99%",
    title: "Alarm Fatigue Crisis",
    description: "Roughly 72% to 99% of clinical alarms are false or nonactionable, which is exactly why the answer cannot be more noise. It has to be better filtering and earlier escalation.",
  },
];

export function ProblemSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="problem" 
      ref={sectionRef}
      className="relative py-32 lg:py-40 bg-foreground text-background"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-20">
          <div 
            className={`flex items-center gap-3 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-mono text-background/60">THE PROBLEM</span>
          </div>
          <h2 
            className={`text-4xl lg:text-6xl font-display leading-tight max-w-3xl transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Modern ICU monitors are failing the most vulnerable patients on earth.
          </h2>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {problems.map((problem, i) => (
            <div 
              key={problem.title}
              className={`group transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="border-t border-background/20 pt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center">
                    <problem.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-5xl font-mono font-bold text-red-400">{problem.stat}</span>
                </div>
                <h3 className="text-xl font-medium mb-4">{problem.title}</h3>
                <p className="text-background/60 leading-relaxed">{problem.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The result callout */}
        <div 
          className={`mt-20 p-8 lg:p-12 border border-red-400/30 bg-red-400/5 rounded-lg transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-xl lg:text-2xl leading-relaxed text-background/90">
            <span className="text-red-400 font-medium">Why ~n0 matters:</span> About 170,000 U.S. heart attacks each year are silent, many in-hospital cardiac arrests are retrospectively judged preventable, and smarter biological surveillance can intervene before the room waits for a noisy threshold alarm to fail.
          </p>
        </div>
      </div>
    </section>
  );
}
