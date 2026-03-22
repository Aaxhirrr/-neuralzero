"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Eye, Activity, FileText, GitBranch, Shield, Crown } from "lucide-react";

const agents = [
  {
    icon: Eye,
    name: "Agent_Vision",
    role: "Visual Analysis",
    description: "Ingests raw OpenCV data. Flags micro-sweating and facial blood withdrawal patterns invisible to the human eye.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Activity,
    name: "Agent_Bio",
    role: "Biometric Processing",
    description: "Ingests simulated machine data. Flags rigid Heart Rate Variability (HRV) patterns that indicate cardiac stress.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: FileText,
    name: "Agent_Archive",
    role: "Medical History",
    description: "Instantly pulls the patient's Electronic Health Record (EHR) to check for a history of vascular disease.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: GitBranch,
    name: "Agent_CrossCheck",
    role: "Historical Graph",
    description: "Cross-checks the live patient against nearest historical trajectories to see whether the current signal pattern matches a known danger path or a safer decoy.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Shield,
    name: "Agent_RedTeam",
    role: "Adversarial Skeptic",
    description: "Aggressively challenges other agents. Tries to prove symptoms are false positives (e.g., 'Is pallor just room lighting?').",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Crown,
    name: "Agent_Chief",
    role: "Orchestrator",
    description: "Weighs all data, resolves RedTeam challenges, and calculates a final confidence score for clinical action.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
];

export function AgentsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
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
      id="agents" 
      ref={sectionRef}
      className="relative py-32 lg:py-40 bg-foreground/[0.02]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-20">
          <div 
            className={`flex items-center gap-3 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Bot className="w-5 h-5 text-foreground" />
            <span className="text-sm font-mono text-muted-foreground">THE SWARM</span>
          </div>
          <h2 
            className={`text-4xl lg:text-6xl font-display leading-tight max-w-4xl transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            6-Agent LLM War Room
          </h2>
          <p 
            className={`mt-6 text-xl text-muted-foreground max-w-2xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Instead of relying on a single, brittle AI prompt, ~n0 routes biological data through 
            a localized Prediction Market to eliminate hallucinations and false alarms.
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <div 
              key={agent.name}
              className={`group relative p-6 bg-background border border-foreground/10 rounded-lg cursor-pointer transition-all duration-500 hover:border-foreground/30 hover:shadow-lg ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } ${activeAgent === i ? "ring-2 ring-foreground/20" : ""}`}
              style={{ transitionDelay: `${300 + i * 75}ms` }}
              onMouseEnter={() => setActiveAgent(i)}
              onMouseLeave={() => setActiveAgent(null)}
            >
              {/* Agent header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${agent.bgColor} flex items-center justify-center`}>
                  <agent.icon className={`w-6 h-6 ${agent.color}`} />
                </div>
                <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-foreground/5 rounded">
                  {agent.role}
                </span>
              </div>

              {/* Agent name */}
              <h3 className="font-mono text-lg mb-3">{agent.name}</h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>

              {/* Connection lines - visual element */}
              <div className="absolute -right-3 top-1/2 w-6 h-px bg-foreground/10 hidden lg:block group-hover:bg-foreground/30 transition-colors" />
            </div>
          ))}
        </div>

        {/* Consensus explanation */}
        <div 
          className={`mt-16 p-8 lg:p-12 border border-foreground/10 bg-background rounded-lg transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <h3 className="text-2xl font-display mb-4">Consensus Protocol</h3>
              <p className="text-muted-foreground leading-relaxed">
                All six agents vote independently. Agent_Chief synthesizes their inputs, resolves conflicts raised by Agent_RedTeam, 
                and produces a single confidence score. Only when consensus exceeds the clinical threshold does the system alert medical staff, 
                dramatically reducing the 85% false alarm rate plaguing traditional ICU monitors.
              </p>
            </div>
            <div className="lg:w-64 p-6 bg-foreground/5 rounded-lg">
              <div className="text-4xl font-mono font-bold text-center mb-2">98.7%</div>
              <div className="text-sm text-muted-foreground text-center">Consensus Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
