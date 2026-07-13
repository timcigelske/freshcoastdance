import * as React from "react";
import { useImportRoster, type RosterRow } from "../../lib/queries";

const SAMPLE = `Household Name, Dancer First Name, Dancer Last Name
The Miller Family, Chloe, Miller
The Miller Family, Emma, Miller
The Davis Family, Sophia, Davis`;

interface ParseResult {
  rows: RosterRow[];
  errors: string[];
  households: number;
}

/** Split one CSV line, honoring simple double-quoted fields. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function parseCsv(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: RosterRow[] = [];
  const errors: string[] = [];

  lines.forEach((line, i) => {
    const cells = splitLine(line);
    const joined = cells.join(" ").toLowerCase();
    // Skip a header row if present.
    if (i === 0 && joined.includes("household") && joined.includes("first")) return;
    const [household, first, last] = cells;
    if (!household || !first || !last) {
      errors.push(`Line ${i + 1}: expected "Household, First, Last" — got "${line}"`);
      return;
    }
    rows.push({ household, first, last });
  });

  const households = new Set(rows.map((r) => r.household)).size;
  return { rows, errors, households };
}

export function AdminImportPage() {
  const importRoster = useImportRoster();
  const [text, setText] = React.useState("");
  const parsed = React.useMemo(() => parseCsv(text), [text]);

  const canImport = parsed.rows.length > 0 && parsed.errors.length === 0 && !importRoster.isPending;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setText);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Paste or upload a CSV to seed households and dancers in one pass. Columns:{" "}
        <span className="font-medium text-fg">Household Name, Dancer First Name, Dancer Last Name</span>
        . Households already on file are reused, not duplicated.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-sm border border-line px-4 py-2 text-sm text-fg transition-colors hover:bg-fg/[0.04]">
          Choose CSV file…
          <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFile} className="hidden" />
        </label>
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="text-sm text-muted hover:text-fg hover:underline"
        >
          Load sample
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={SAMPLE}
        spellCheck={false}
        className="rounded-sm border border-line bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-fg outline-none focus:border-accent"
      />

      {text.trim() && (
        <div className="flex flex-col gap-2 rounded-md border border-line bg-bg-secondary p-4 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>
              <span className="font-semibold text-fg">{parsed.rows.length}</span>{" "}
              <span className="text-muted">dancers</span>
            </span>
            <span>
              <span className="font-semibold text-fg">{parsed.households}</span>{" "}
              <span className="text-muted">households</span>
            </span>
          </div>
          {parsed.errors.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5 text-red-600">
              {parsed.errors.slice(0, 8).map((err) => (
                <li key={err}>{err}</li>
              ))}
              {parsed.errors.length > 8 && <li>…and {parsed.errors.length - 8} more.</li>}
            </ul>
          )}
        </div>
      )}

      {importRoster.isError && (
        <p className="text-sm text-red-600">
          Import failed — {(importRoster.error as Error).message}
        </p>
      )}
      {importRoster.isSuccess && (
        <p className="text-sm text-green-700">
          ✓ Imported {importRoster.data.dancersCreated} dancers across{" "}
          {importRoster.data.householdsCreated} new
          {importRoster.data.householdsReused > 0
            ? ` (+${importRoster.data.householdsReused} existing)`
            : ""}{" "}
          households.
        </p>
      )}

      <div>
        <button
          type="button"
          onClick={() => importRoster.mutate(parsed.rows)}
          disabled={!canImport}
          className="rounded-sm bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {importRoster.isPending
            ? "Importing…"
            : `Import ${parsed.rows.length || ""} dancers`.trim()}
        </button>
      </div>
    </div>
  );
}
