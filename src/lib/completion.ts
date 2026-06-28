// ─────────────────────────────────────────────────────────────────────────────
// Completion engine — the single place that knows HOW a topic is "completed"
// and HOW a module's completion rolls up from its topics.
//
// Design goals (kept deliberately schema-free so the DB never needs a redesign):
//   • Pluggable per-activity completion rules (reading / quiz / video / …).
//     The module rollup only ever asks "is this required topic complete?" — it
//     never cares how completion was achieved (requirement: future-proof model).
//   • Weighting lives here, not in the DB. Today every required topic = weight 1;
//     later reading=1 / quiz=2 / lab=5 is a one-line change, no migration.
//   • Deterministic resume priority: first-incomplete-required → last-visited →
//     first-topic.
//
// `topic_progress` rows store only the learner's STATE (status / progress_ratio /
// metadata / timing). Content facts (a topic's type, whether it's required) come
// from the lesson content via TopicConfig.
// ─────────────────────────────────────────────────────────────────────────────

export type TopicType =
  | 'reading'
  | 'knowledge_check'
  | 'quiz'
  | 'video'
  | 'assignment'
  | 'lab'
  | 'interactive'
  | 'simulation';

/** A learner's persisted state for one topic (subset of the DB row the engine reads). */
export interface TopicProgressRow {
  topic_key: string;
  topic_type?: string;
  status: 'in_progress' | 'completed';
  progress_ratio?: number;
  metadata?: Record<string, any> | null;
  visited_at?: string | null;
}

/** Content-derived description of a topic (NOT per-user). */
export interface TopicConfig {
  key: string;
  type: TopicType;
  required: boolean;
  /** Optional per-topic thresholds (override the rule defaults). */
  passScore?: number;      // knowledge_check / quiz  (0..1)
  requiredWatch?: number;  // video                   (0..1)
}

interface CompletionRule {
  /** Relative weight toward module progress. All 1 today; re-tune freely later. */
  weight: number;
  /** Has this activity's completion condition been met for this learner? */
  isComplete: (row: TopicProgressRow | undefined, cfg: TopicConfig) => boolean;
}

const num = (v: unknown, d = 0): number => (typeof v === 'number' && !Number.isNaN(v) ? v : d);

// Each activity type owns its own completion rule. New types plug in here with no
// schema change. Weights are intentionally all 1 for now (per current scope).
export const COMPLETION_RULES: Record<TopicType, CompletionRule> = {
  reading: {
    weight: 1,
    isComplete: (r) => r?.status === 'completed',
  },
  knowledge_check: {
    weight: 1,
    isComplete: (r, c) =>
      r?.status === 'completed' || num(r?.metadata?.score) >= (c.passScore ?? 0.7),
  },
  quiz: {
    weight: 1,
    isComplete: (r, c) =>
      r?.metadata?.passed === true || num(r?.metadata?.score) >= (c.passScore ?? 0.7),
  },
  video: {
    weight: 1,
    isComplete: (r, c) => num(r?.metadata?.watch_percent) >= (c.requiredWatch ?? 0.9),
  },
  assignment: {
    weight: 1,
    isComplete: (r) => ['submitted', 'approved'].includes(String(r?.metadata?.state ?? '')),
  },
  lab: {
    weight: 1,
    isComplete: (r) => r?.status === 'completed',
  },
  interactive: {
    weight: 1,
    isComplete: (r) => r?.status === 'completed',
  },
  simulation: {
    weight: 1,
    isComplete: (r) => r?.status === 'completed',
  },
};

const ruleFor = (type: TopicType): CompletionRule => COMPLETION_RULES[type] ?? COMPLETION_RULES.reading;

export function isTopicComplete(cfg: TopicConfig, row: TopicProgressRow | undefined): boolean {
  return ruleFor(cfg.type).isComplete(row, cfg);
}

export function weightOf(cfg: TopicConfig): number {
  return ruleFor(cfg.type).weight;
}

export interface ModuleCompletion {
  /** Required-topic counts. */
  total: number;
  completed: number;
  /** Weighted totals (equal to the counts while every weight is 1). */
  totalWeight: number;
  completedWeight: number;
  /** Weighted completion ratio 0..1 — drives progress UI. */
  ratio: number;
  /** True only when every REQUIRED topic is complete → triggers lesson rollup. */
  isComplete: boolean;
}

/**
 * Roll a module's completion up from its topics. Only REQUIRED topics gate
 * completion; optional topics still contribute to analytics elsewhere but never
 * block a module. Progress is weighted so introducing real weights later needs
 * no schema or call-site change.
 */
export function computeModuleCompletion(
  topics: TopicConfig[],
  rows: Map<string, TopicProgressRow>,
): ModuleCompletion {
  const required = topics.filter((t) => t.required);
  let totalWeight = 0;
  let completedWeight = 0;
  let completed = 0;
  let allDone = required.length > 0;

  for (const t of required) {
    const w = weightOf(t);
    totalWeight += w;
    if (isTopicComplete(t, rows.get(t.key))) {
      completedWeight += w;
      completed += 1;
    } else {
      allDone = false;
    }
  }

  return {
    total: required.length,
    completed,
    totalWeight,
    completedWeight,
    ratio: totalWeight ? completedWeight / totalWeight : 0,
    isComplete: allDone,
  };
}

/**
 * Deterministic resume target within a module:
 *   1. first incomplete REQUIRED topic (content order)
 *   2. last visited topic (MAX visited_at)
 *   3. first topic
 */
export function computeResumeTopic(
  topics: TopicConfig[],
  rows: Map<string, TopicProgressRow>,
): string | null {
  if (topics.length === 0) return null;

  for (const t of topics) {
    if (t.required && !isTopicComplete(t, rows.get(t.key))) return t.key;
  }

  let lastKey: string | null = null;
  let lastVisited = '';
  for (const t of topics) {
    const v = rows.get(t.key)?.visited_at;
    if (v && v > lastVisited) {
      lastVisited = v;
      lastKey = t.key;
    }
  }
  if (lastKey) return lastKey;

  return topics[0].key;
}

/**
 * Map the shared, stable topic list (deriveTopics → {id}) into completion
 * configs. Today everything is a required reading; when content gains typed
 * blocks (a `type`/`required`/threshold on the block) this is where they'd be
 * read — without touching the engine or the schema.
 */
export function toTopicConfigs(
  topics: Array<{ id: string; type?: TopicType; required?: boolean }>,
): TopicConfig[] {
  return topics.map((t) => ({
    key: t.id,
    type: t.type ?? 'reading',
    required: t.required ?? true,
  }));
}

/** Index a flat list of stored rows by topic_key for O(1) lookup. */
export function indexRowsByKey(rows: TopicProgressRow[]): Map<string, TopicProgressRow> {
  const m = new Map<string, TopicProgressRow>();
  for (const r of rows) m.set(r.topic_key, r);
  return m;
}
