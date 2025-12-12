#!/usr/bin/env node
/**
 * Create draft changelog entries in Sanity CMS.
 *
 * Usage:
 *   node sanity-changelog.js --title "Feature title" --body content.md
 *   node sanity-changelog.js --title "Feature title" --body content.md --dry-run
 *
 * Environment Variables:
 *   SANITY_PROJECT_ID: Your Sanity project ID (required)
 *   SANITY_DATASET: Dataset name (default: "production")
 *   SANITY_API_TOKEN: API token with write access (required)
 *   SANITY_API_VERSION: API version (default: "v2025-02-19")
 */

const { randomUUID } = require("crypto");
const { readFileSync, existsSync } = require("fs");
const { resolve } = require("path");

// --- Load .env file ---

function loadEnvFile() {
  const envPaths = [
    resolve(process.cwd(), ".env"),
    resolve(__dirname, ".env"),
    resolve(__dirname, "..", ".env"),
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      return envPath;
    }
  }
  return null;
}

loadEnvFile();

// --- Portable Text Conversion ---

function generateKey() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Parse inline markdown marks (bold, italic, code) into Portable Text spans.
 */
function parseInlineMarks(text) {
  const spans = [];
  const inlineRegex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;

  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: text.slice(lastIndex, match.index),
        marks: [],
      });
    }

    if (match[2]) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[2],
        marks: ["strong"],
      });
    } else if (match[3]) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[3],
        marks: ["em"],
      });
    } else if (match[4]) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[4],
        marks: ["code"],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    spans.push({
      _type: "span",
      _key: generateKey(),
      text: text.slice(lastIndex),
      marks: [],
    });
  }

  if (spans.length === 0) {
    spans.push({
      _type: "span",
      _key: generateKey(),
      text,
      marks: [],
    });
  }

  return spans;
}

/**
 * Convert markdown text to Sanity Portable Text blocks.
 */
function markdownToPortableText(markdown) {
  const blocks = [];
  const lines = markdown.split("\n");
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        blocks.push({
          _type: "block",
          _key: generateKey(),
          style: "normal",
          markDefs: [],
          children: parseInlineMarks(text),
        });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style: "h2",
        markDefs: [],
        children: parseInlineMarks(trimmed.slice(3).trim()),
      });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style: "h2",
        markDefs: [],
        children: parseInlineMarks(trimmed.slice(4).trim()),
      });
      continue;
    }

    currentParagraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
}

// --- Sanity API ---

function buildDocument(input) {
  const slug = input.slug || generateSlug(input.title);
  const docId = `changelog-${slug}-${generateKey()}`;
  const draftId = `drafts.${docId}`;

  const document = {
    _type: "changelog",
    _id: draftId,
    title: input.title,
    slug: {
      _type: "slug",
      current: slug,
    },
    publishedAt: input.publishedAt || new Date().toISOString(),
    body: markdownToPortableText(input.body),
  };

  if (input.heroImageAssetId) {
    document.heroImage = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: input.heroImageAssetId,
      },
    };
  }

  return { document, docId, draftId };
}

async function createSanityDraft(input, config, dryRun = false) {
  const { document, docId, draftId } = buildDocument(input);

  const payload = {
    actions: [
      {
        actionType: "sanity.action.document.create",
        publishedId: docId,
        document,
      },
    ],
    dryRun,
  };

  const url = `https://${config.projectId}.api.sanity.io/${config.apiVersion}/data/actions/${config.dataset}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sanity API error (${response.status}): ${errorText}`);
  }

  return { ...(await response.json()), documentId: draftId };
}

// --- CLI ---

function parseArgs(args) {
  const result = { dryRun: false, preview: false, help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--title":
      case "-t":
        result.title = nextArg;
        i++;
        break;
      case "--body":
      case "-b":
        result.body = nextArg;
        i++;
        break;
      case "--slug":
      case "-s":
        result.slug = nextArg;
        i++;
        break;
      case "--published-at":
        result.publishedAt = nextArg;
        i++;
        break;
      case "--hero-image":
        result.heroImageAssetId = nextArg;
        i++;
        break;
      case "--dry-run":
        result.dryRun = true;
        break;
      case "--preview":
        result.preview = true;
        break;
      case "--help":
      case "-h":
        result.help = true;
        break;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
Usage: node sanity-changelog.js [options]

Options:
  --title, -t <title>       Changelog entry title (required)
  --body, -b <file>         Path to markdown file with body content (required)
  --slug, -s <slug>         URL slug (auto-generated from title if not provided)
  --published-at <datetime> Publication date in ISO format (default: now)
  --hero-image <asset-id>   Sanity asset ID for hero image
  --preview                 Show document JSON without uploading (no credentials needed)
  --dry-run                 Validate with Sanity API without creating document
  --help, -h                Show this help message

Environment Variables:
  SANITY_PROJECT_ID         Sanity project ID (required)
  SANITY_DATASET            Dataset name (default: "production")
  SANITY_API_TOKEN          API token with write access (required)
  SANITY_API_VERSION        API version (default: "v2025-02-19")

Example:
  export SANITY_PROJECT_ID="your-project-id"
  export SANITY_API_TOKEN="your-token"
  node sanity-changelog.js --title "New feature" --body changelog.md
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.title) {
    console.error("Error: --title is required");
    process.exit(1);
  }

  if (!args.body) {
    console.error("Error: --body is required");
    process.exit(1);
  }

  let bodyContent;
  try {
    bodyContent = readFileSync(args.body, "utf-8");
  } catch (err) {
    console.error(`Error reading body file: ${args.body}`);
    process.exit(1);
  }

  const input = {
    title: args.title,
    body: bodyContent,
    slug: args.slug,
    publishedAt: args.publishedAt,
    heroImageAssetId: args.heroImageAssetId,
  };

  // Preview mode - show document without API call
  if (args.preview) {
    const { document } = buildDocument(input);
    console.log(JSON.stringify(document, null, 2));
    process.exit(0);
  }

  // Check credentials for API operations
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || "production";
  const apiToken = process.env.SANITY_API_TOKEN;
  const apiVersion = process.env.SANITY_API_VERSION || "v2025-02-19";

  if (!projectId) {
    console.error("Error: SANITY_PROJECT_ID environment variable is required");
    console.error("       Create a .env file or export the variable");
    process.exit(1);
  }

  if (!apiToken) {
    console.error("Error: SANITY_API_TOKEN environment variable is required");
    console.error("       Create a .env file or export the variable");
    process.exit(1);
  }

  try {
    const action = args.dryRun ? "Testing" : "Creating";
    console.log(`${action} draft in Sanity...`);

    const result = await createSanityDraft(
      input,
      { projectId, dataset, apiToken, apiVersion },
      args.dryRun
    );

    if (args.dryRun) {
      console.log("✓ Dry run successful - document would be created");
    } else {
      console.log("✓ Draft created successfully");
      console.log(`  Document ID: ${result.documentId}`);
      console.log(`  Transaction: ${result.transactionId}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
