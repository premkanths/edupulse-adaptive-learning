/**
 * EduPulse Material Launcher & Semantic Matcher
 * Maps academic topics, exam mistakes, and curriculum subjects directly to the corresponding
 * instructor course material and triggers immediate modal opening.
 */

export const TOPIC_TO_MATERIAL_KEYWORDS = [
  // Data Structures & Algorithms
  {
    keywords: ['array', 'stack', 'queue', 'linked list', 'linear', 'matrix', 'vector'],
    preferredId: 1,
    subjectKeyword: 'data struct'
  },
  {
    keywords: ['tree', 'bst', 'binary search', 'avl', 'heap', 'tree traversal', 'inorder', 'preorder', 'postorder', 'balance', 'red-black', 'binary tree'],
    preferredId: 2,
    subjectKeyword: 'data struct'
  },
  {
    keywords: ['graph', 'bfs', 'dfs', 'dijkstra', 'shortest path', 'spanning tree', 'kruskal', 'prim', 'topological', 'cycle', 'adjacency', 'graph traversal'],
    preferredId: 3,
    subjectKeyword: 'data struct'
  },

  // Database Management Systems
  {
    keywords: ['relational', 'algebra', 'sql', 'query', 'ddl', 'dml', 'er diagram', 'join', 'select', 'schema'],
    preferredId: 4,
    subjectKeyword: 'database'
  },
  {
    keywords: ['normal', '1nf', '2nf', '3nf', 'bcnf', 'functional dependenc', 'lossless', 'decomposition'],
    preferredId: 5,
    subjectKeyword: 'database'
  },
  {
    keywords: ['transaction', 'acid', 'concurrency', 'serializ', 'lock', 'deadlock', '2pl', 'recovery', 'wal', 'commit'],
    preferredId: 6,
    subjectKeyword: 'database'
  },

  // Computer Networks
  {
    keywords: ['osi', 'data link', 'framing', 'error detection', 'crc', 'mac', 'ethernet', 'physical layer', 'architecture'],
    preferredId: 7,
    subjectKeyword: 'network'
  },
  {
    keywords: ['ipv4', 'ipv6', 'subnet', 'cidr', 'routing', 'router', 'bgp', 'ospf', 'rip', 'distance vector', 'packet forwarding'],
    preferredId: 8,
    subjectKeyword: 'network'
  },
  {
    keywords: ['tcp', 'udp', 'transport', 'handshake', 'congestion', 'flow control', 'socket', 'tls', 'ssl', 'dns', 'http'],
    preferredId: 9,
    subjectKeyword: 'network'
  },

  // Operating Systems
  {
    keywords: ['process', 'thread', 'cpu schedul', 'context switch', 'fcfs', 'sjf', 'round robin', 'priority scheduling', 'pcb'],
    preferredId: 10,
    subjectKeyword: 'operating'
  },
  {
    keywords: ['synchronization', 'semaphore', 'mutex', 'critical section', 'deadlock', 'banker', 'dining philosophers', 'race condition', 'peterson'],
    preferredId: 11,
    subjectKeyword: 'operating'
  },
  {
    keywords: ['virtual memory', 'paging', 'page fault', 'tlb', 'fifo', 'lru', 'segmentation', 'disk schedul', 'thrashing'],
    preferredId: 12,
    subjectKeyword: 'operating'
  },

  // Software Engineering & System Design
  {
    keywords: ['agile', 'scrum', 'sprint', 'waterfall', 'lifecycle', 'sdlc', 'ci/cd', 'devops', 'kanban', 'user story'],
    preferredId: 13,
    subjectKeyword: 'software'
  },
  {
    keywords: ['solid', 'design pattern', 'singleton', 'factory', 'observer', 'strategy', 'decorator', 'oop', 'coupling', 'cohesion'],
    preferredId: 14,
    subjectKeyword: 'software'
  },
  {
    keywords: ['distributed', 'microservice', 'monolith', 'caching', 'redis', 'load balanc', 'cap theorem', 'message queue', 'kafka'],
    preferredId: 15,
    subjectKeyword: 'software'
  }
];

/**
 * Find the most relevant course material based on id, topic, subject, or search text
 */
export function findMatchingMaterial(materials = [], { materialId, topic, subject, query } = {}) {
  if (!materials || materials.length === 0) return null;

  // 1. Exact ID match
  if (materialId) {
    const byId = materials.find((m) => String(m.id) === String(materialId));
    if (byId) return byId;
  }

  const topicNorm = (topic || query || '').toLowerCase().trim();
  const subjectNorm = (subject || '').toLowerCase().trim();

  // 2. Keyword heuristic mapping with specificity scoring
  if (topicNorm) {
    let bestRule = null;
    let maxRuleScore = 0;

    for (const rule of TOPIC_TO_MATERIAL_KEYWORDS) {
      const subjectMatches = !subjectNorm || !rule.subjectKeyword || subjectNorm.includes(rule.subjectKeyword);
      if (!subjectMatches) continue;

      let ruleScore = 0;
      for (const kw of rule.keywords) {
        if (topicNorm.includes(kw)) {
          // Weight longer, more specific keywords higher
          ruleScore += (kw.length >= 5 ? 10 : 5);
        }
      }

      if (ruleScore > maxRuleScore) {
        maxRuleScore = ruleScore;
        bestRule = rule;
      }
    }

    if (bestRule && maxRuleScore > 0) {
      const found = materials.find((m) => m.id === bestRule.preferredId);
      if (found) return found;
    }
  }

  // 3. String scoring across title, description, and subject
  let bestMaterial = null;
  let highestScore = -1;

  for (const mat of materials) {
    let score = 0;
    const titleLower = (mat.title || '').toLowerCase();
    const descLower = (mat.description || '').toLowerCase();
    const subjLower = (mat.subject?.name || '').toLowerCase();
    const textLower = (mat.textContent || '').substring(0, 500).toLowerCase();

    if (subjectNorm && subjLower.includes(subjectNorm)) {
      score += 15;
    }

    if (topicNorm) {
      if (titleLower.includes(topicNorm)) score += 30;
      if (descLower.includes(topicNorm)) score += 15;
      if (textLower.includes(topicNorm)) score += 10;

      // Token match
      const tokens = topicNorm.split(/\s+/).filter((t) => t.length > 2);
      for (const t of tokens) {
        if (titleLower.includes(t)) score += 5;
        if (descLower.includes(t)) score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMaterial = mat;
    }
  }

  if (highestScore > 0 && bestMaterial) {
    return bestMaterial;
  }

  // 4. Subject fallback
  if (subjectNorm) {
    const bySubject = materials.find((m) =>
      (m.subject?.name || '').toLowerCase().includes(subjectNorm)
    );
    if (bySubject) return bySubject;
  }

  // 5. Default to first material
  return materials[0] || null;
}

/**
 * Build URL to open a specific material in StudentMaterials
 */
export function buildMaterialUrl({ materialId, topic, subject, autoOpen = true, mode = 'pdf' } = {}) {
  const params = new URLSearchParams();
  if (materialId) params.set('materialId', materialId);
  if (topic) params.set('topic', topic);
  if (subject) params.set('subject', subject);
  if (autoOpen) params.set('autoOpen', 'true');
  if (mode) params.set('mode', mode);

  return `/student/materials?${params.toString()}`;
}

/**
 * Imperative launcher to navigate directly into a material
 */
export function launchDirectMaterial({ materialId, topic, subject, autoOpen = true, mode = 'pdf', navigate }) {
  const url = buildMaterialUrl({ materialId, topic, subject, autoOpen, mode });
  if (navigate) {
    navigate(url);
  }
  return url;
}
