// lib/pdf-parser.js
// Flexible policy parser — works on extracted PDF text.
// No hardcoded policies. Detects headings and field labels.

const HEADING_PATTERNS = [
  // K-01 - Title   |  KB-05: Title  |  POL-12 — Title  |  K- 03 — Title
  {
    regex: /^#{0,6}\s*([A-Z]{1,6}[-\s]*\d{1,4})\s*[-:]\s*(.+)$/i,
    extract: (m) => ({
      code: m[1].toUpperCase().replace(/[\s-]+/g, "-"),
      title: m[2].trim(),
    }),
  },
  // Policy 1 - Title  |  Policy #2: Title
  {
    regex: /^#{0,6}\s*(Policy\s*#?\s*\d{1,3})\s*[-:]?\s*(.*)$/i,
    extract: (m) => ({ code: m[1].trim(), title: (m[2] || "").trim() }),
  },
  // Section 1 - Title  |  Section A: Title
  {
    regex: /^#{0,6}\s*(Section\s*[A-Z0-9]{1,3})\s*[-:]?\s*(.*)$/i,
    extract: (m) => ({ code: m[1].trim(), title: (m[2] || "").trim() }),
  },
  // ## Any Heading (no code)
  {
    regex: /^#{1,6}\s+(.+)$/,
    extract: (m) => ({ code: null, title: m[1].trim() }),
  },
];

// Label synonyms → canonical field
// Category = Role = Branch = Department → same field "department"
const FIELD_MAP = (() => {
  const m = {};
  const add = (field, labels) =>
    labels.forEach((l) => (m[l.toLowerCase()] = field));

  add("department", [
    "category",
    "role",
    "branch",
    "department",
    "dept",
    "team",
    "group",
    "type",
    "area",
    "function",
    "handled by",
    "assigned to",
    "responsible",
    "owner",
    "division",
    "unit",
  ]);

  add("priorityHint", [
    "priority",
    "priority hint",
    "urgency",
    "level",
    "severity",
    "importance",
  ]);

  add("sla", [
    "sla",
    "response time",
    "deadline",
    "time limit",
    "turnaround",
    "resolution time",
    "due within",
  ]);

  add("approval", [
    "approval",
    "approver",
    "requires approval",
    "sign-off",
    "sign off",
  ]);

  return m;
})();

function matchHeading(line) {
  for (const p of HEADING_PATTERNS) {
    const m = line.match(p.regex);
    if (m) {
      const out = p.extract(m);
      if (out.title && out.title.length > 0) return out;
    }
  }
  return null;
}

function stripRepeatedHeading(line, code, title) {
  if (!code) return line;

  // Loose pattern: allow optional whitespace between code chars ("K- 03")
  const normCode = code.replace(/\s+/g, "");
  const pattern = normCode
    .split("")
    .map((c) => c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("\\s*");

  const codeRe = new RegExp(`^${pattern}\\s*[-:]\\s*`, "i");
  if (!codeRe.test(line)) return line;

  let out = line.replace(codeRe, "").trim();

  if (title) {
    const escTitle = title.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const titleRe = new RegExp(`^${escTitle}`, "i");
    out = out.replace(titleRe, "").trim();
  }

  return out;
}

function extractFields(line) {
  // Split on " | " first
  let parts = line.split(/\s*\|\s*/);

  // If no pipe, try comma — only if every part looks like "Label: Value"
  if (parts.length === 1) {
    const commaParts = line.split(/\s*,\s*/);
    if (
      commaParts.length > 1 &&
      commaParts.every((p) => /^[^:]{2,40}:\s*\S/.test(p))
    ) {
      parts = commaParts;
    }
  }

  const found = {};
  let allValid = true;

  for (const part of parts) {
    const m = part.match(/^([^:]{2,40}?)\s*:\s*(.+)$/);
    if (!m) {
      allValid = false;
      break;
    }
    const label = m[1].trim().toLowerCase();
    const value = m[2].trim();
    const field = FIELD_MAP[label];
    if (!field) {
      allValid = false;
      break;
    }
    if (!found[field]) found[field] = value;
  }

  if (!allValid || Object.keys(found).length === 0) return [];

  return Object.entries(found).map(([field, value]) => ({ field, value }));
}

export function parsePoliciesFromText(text, sourceFile = null) {
  if (!text || typeof text !== "string") return [];

  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\u2014|\u2013/g, "-") // em/en dash → hyphen
    .replace(/[ \t]+/g, " ");

  const lines = cleaned.split("\n");

  const policies = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    const title = (current.title || "").trim();
    const content = (current.contentParts || [])
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!title && !content) return;

    policies.push({
      code: current.code || null,
      title: title || current.code || "Untitled Policy",
      content,
      department: current.department || null,
      priorityHint: current.priorityHint || null,
      sla: current.sla || null,
      approval: current.approval || null,
      sourceFile,
    });
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const heading = matchHeading(line);
    if (heading) {
      pushCurrent();
      current = {
        code: heading.code,
        title: heading.title,
        contentParts: [],
        department: null,
        priorityHint: null,
        sla: null,
        approval: null,
      };
      continue;
    }

    if (!current) continue;

    const stripped = stripRepeatedHeading(line, current.code, current.title);

    const fields = extractFields(stripped);
    if (fields.length > 0) {
      for (const f of fields) {
        if (f.field === "department" && !current.department) {
          current.department = f.value;
        } else if (f.field === "priorityHint" && !current.priorityHint) {
          current.priorityHint = f.value;
        } else if (f.field === "sla" && !current.sla) {
          current.sla = f.value;
        } else if (f.field === "approval" && !current.approval) {
          current.approval = f.value;
        }
      }
      continue;
    }

    if (stripped) current.contentParts.push(stripped);
  }

  pushCurrent();

  // Fallback: if nothing detected, return the whole text as one policy
  if (policies.length === 0 && cleaned.trim()) {
    return [
      {
        code: null,
        title: "Untitled Policy",
        content: cleaned.trim(),
        department: null,
        priorityHint: null,
        sla: null,
        approval: null,
        sourceFile,
      },
    ];
  }

  return policies;
}

// Exposed for admin UI — shows what labels are recognized
export const RECOGNIZED_LABELS = {
  department: [
    "Category",
    "Role",
    "Branch",
    "Department",
    "Dept",
    "Team",
    "Group",
    "Type",
    "Area",
    "Function",
    "Division",
    "Unit",
    "Handled by",
    "Assigned to",
    "Responsible",
    "Owner",
  ],
  priorityHint: [
    "Priority",
    "Priority hint",
    "Urgency",
    "Level",
    "Severity",
    "Importance",
  ],
  sla: [
    "SLA",
    "Response time",
    "Deadline",
    "Time limit",
    "Turnaround",
    "Resolution time",
    "Due within",
  ],
  approval: [
    "Approval",
    "Approver",
    "Requires approval",
    "Sign-off",
  ],
};