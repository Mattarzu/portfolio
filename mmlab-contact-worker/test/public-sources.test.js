import assert from "node:assert/strict";
import test from "node:test";

import { publicSources } from "../src/portfolio-context.js";

test("projects sources to public fields with title as label", () => {
  const sources = [
    {
      id: "synthetic-alpha",
      title: "Synthetic Alpha",
      href: "https://example.test/alpha",
      keywords: ["alpha"],
      es: "Texto sintético A",
      en: "Synthetic text A",
    },
    {
      id: "synthetic-beta",
      title: "Synthetic Beta",
      href: "https://example.test/beta",
      extra: { private: true },
    },
  ];

  const result = publicSources(sources);

  assert.deepEqual(result, [
    {
      id: "synthetic-alpha",
      label: "Synthetic Alpha",
      href: "https://example.test/alpha",
    },
    {
      id: "synthetic-beta",
      label: "Synthetic Beta",
      href: "https://example.test/beta",
    },
  ]);
});

test("leaves the input array and source objects unchanged", () => {
  const sources = [
    {
      id: "synthetic-gamma",
      title: "Synthetic Gamma",
      href: "https://example.test/gamma",
      keywords: ["gamma", "fixture"],
      es: "Texto sintético G",
      en: "Synthetic text G",
    },
    {
      id: "synthetic-delta",
      title: "Synthetic Delta",
      href: "https://example.test/delta",
      nested: { value: 42 },
    },
  ];
  const snapshot = [
    {
      id: "synthetic-gamma",
      title: "Synthetic Gamma",
      href: "https://example.test/gamma",
      keywords: ["gamma", "fixture"],
      es: "Texto sintético G",
      en: "Synthetic text G",
    },
    {
      id: "synthetic-delta",
      title: "Synthetic Delta",
      href: "https://example.test/delta",
      nested: { value: 42 },
    },
  ];

  publicSources(sources);

  assert.deepEqual(sources, snapshot);
});

test("returns an empty array for empty input", () => {
  assert.deepEqual(publicSources([]), []);
});
