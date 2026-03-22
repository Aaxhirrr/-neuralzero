"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Eye, Cpu, Monitor } from "lucide-react";

const techStack = [
  {
    icon: Eye,
    name: "Vision Engine",
    tech: "Python, OpenCV, MediaPipe, SciPy",
    description: "High-density facial mesh mapping with Remote Photoplethysmography (rPPG). Extracts pulse and detects blood oxygen drops invisible to the human eye using bandpass filters on RGB pixel micro-fluctuations.",
  },
  {
    icon: Cpu,
    name: "Swarm Brain",
    tech: "FastAPI, Asyncio, LLM APIs",
    description: "High-concurrency Python backend orchestrating a 6-Agent LLM War Room. Routes biological data through a localized Prediction Market to eliminate hallucinations and false alarms.",
  },
  {
    icon: Monitor,
    name: "Display Layer",
    tech: "React, TypeScript, Tailwind, WebSockets",
    description: "Dark-mode, high-performance Consensus Canvas rendering live MJPEG video streams and WebSocket data with zero latency.",
  },
];

const capabilities = [
  "Micro-pallor detection",
  "Heart Rate Variability (HRV) rigidity",
  "Micro-perspiration analysis",
  "Real-time facial mesh mapping",
  "Remote Photoplethysmography",
  "Multi-agent consensus",
];

export function SolutionSection() {
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
      id="solution" 
      ref={sectionRef}
      className="relative py-32 lg:py-40"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-20">
          <div 
            className={`flex items-center gap-3 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Zap className="w-5 h-5 text-foreground" />
            <span className="text-sm font-mono text-muted-foreground">THE SOLUTION</span>
          </div>
          <h2 
            className={`text-4xl lg:text-6xl font-display leading-tight max-w-4xl transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            An autonomous, hardware-agnostic neural bypass.
          </h2>
          <p 
            className={`mt-6 text-xl text-muted-foreground max-w-2xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            We don't ask the patient how they feel. We don't wait for their heart to stop. 
            We read the invisible, autonomic warning signs straight off their face using a standard $50 webcam.
          </p>
        </div>

        {/* Capabilities tags */}
        <div 
          className={`flex flex-wrap gap-3 mb-20 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {capabilities.map((cap) => (
            <span 
              key={cap}
              className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-full text-sm font-mono"
            >
              {cap}
            </span>
          ))}
        </div>

        {/* Tech stack cards */}
        <div 
          className={`transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h3 className="text-sm font-mono text-muted-foreground mb-8" id="technology">TECH STACK</h3>
          <div className="grid lg:grid-cols-3 gap-6">
            {techStack.map((item, i) => (
              <div 
                key={item.name}
                className="group p-8 bg-foreground/[0.02] border border-foreground/10 rounded-lg hover:border-foreground/20 transition-all duration-300"
                style={{ transitionDelay: `${500 + i * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-xs font-mono text-muted-foreground">{item.tech}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
