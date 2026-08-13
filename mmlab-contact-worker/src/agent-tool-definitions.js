import { CAPABILITY_TOPICS, PROJECT_IDS } from "./agent-tools.js";

export const AGENT_TOOL_DECLARATIONS = Object.freeze([
  {
    name: "search_portfolio",
    description: "Search verified public ALLFICTION portfolio evidence relevant to a visitor question.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "get_project",
    description: "Get verified public information for one ALLFICTION project.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { projectId: { type: "string", enum: PROJECT_IDS } },
      required: ["projectId"],
    },
  },
  {
    name: "get_capability_evidence",
    description: "Find verified project evidence for one technical capability.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { topic: { type: "string", enum: CAPABILITY_TOPICS } },
      required: ["topic"],
    },
  },
  {
    name: "draft_project_brief",
    description: "Draft a concise project brief from the visitor's stated goal and process for review.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        goal: { type: "string" },
        currentProcess: { type: "string" },
        desiredOutcome: { type: "string" },
        capabilities: { type: "array", items: { type: "string" }, maxItems: 6 },
      },
      required: ["goal", "currentProcess", "desiredOutcome", "capabilities"],
    },
  },
]);
