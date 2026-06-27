import {
  Sprout, RefreshCw, Globe, Globe2, Zap, Handshake, Cloud, Map, MapPin,
  Shield, ShieldCheck, Headset, Landmark, Puzzle, Wallet, IndianRupee,
  Wrench, Settings, Cpu, Database, Network, Building2, Server, HardDrive,
  FolderOpen, Scale, Code, Unlock, Lock, Rocket, Bot, BrainCircuit, Users,
  Layers, Target, Lightbulb, TrendingUp, Boxes, Gauge, Sparkles, MessageSquare,
  type LucideIcon,
} from 'lucide-react';

// ─── Block icon registry ───────────────────────────────────────────────────
// One consistent icon system for ALL learning visuals. Block data references a
// stable semantic NAME (e.g. "cloud", "shield", "rocket") — never a raw emoji —
// so iconography stays uniform across modules. Unknown names resolve to null
// and callers fall back to a neutral dot.

const ICONS: Record<string, LucideIcon> = {
  // infrastructure / cloud
  cloud: Cloud, server: Server, servers: Server, network: Network, database: Database,
  'hard-drive': HardDrive, folder: FolderOpen, cpu: Cpu, chip: Cpu, gauge: Gauge,
  performance: Gauge, building: Building2, colocation: Building2, company: Building2,
  architecture: Boxes, comparison: Scale, features: Layers, benefits: TrendingUp,
  security: Shield, team: Users, customer: Users,
  // platform / dev
  code: Code, unlock: Unlock, lock: Lock, zap: Zap, layers: Layers, boxes: Boxes,
  puzzle: Puzzle, scale: Scale, settings: Settings, wrench: Wrench,
  // people / business
  users: Users, handshake: Handshake, headset: Headset, rocket: Rocket,
  landmark: Landmark, bot: Bot, brain: BrainCircuit,
  // money / value
  wallet: Wallet, rupee: IndianRupee,
  // trust / quality
  shield: Shield, 'shield-check': ShieldCheck,
  // geography / growth
  globe: Globe, 'globe-2': Globe2, map: Map, 'map-pin': MapPin,
  'trending-up': TrendingUp, sprout: Sprout, refresh: RefreshCw,
  // generic / accents
  target: Target, lightbulb: Lightbulb, spark: Sparkles, message: MessageSquare,
};

export function resolveBlockIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICONS[name.trim().toLowerCase()] ?? null;
}
