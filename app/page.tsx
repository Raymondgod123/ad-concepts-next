"use client";

import { useMemo, useState } from "react";

type AdConcept = {
  id: string;
  angle: string;
  headline: string;
  primaryText: string;
  cta: string;
  visualDirection: string;
  audience: string;
};

function isValidUrl(value: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function ConceptCard({ concept }: { concept: AdConcept }) {
  return (
    <div className="conceptCard">
      <p className="conceptTitle">{concept.headline}</p>
      <p style={{ margin: "0 0 10px", color: "rgba(15,23,42,0.78)", lineHeight: 1.4 }}>
        {concept.primaryText}
      </p>
      <p style={{ margin: "0 0 6px" }}>
        <span className="pill">CTA: {concept.cta}</span>
      </p>
      <p style={{ margin: "10px 0 0", color: "rgba(15,23,42,0.75)", lineHeight: 1.4 }}>
        <span style={{ fontWeight: 650 }}>Visual:</span> {concept.visualDirection}
      </p>
      <div className="pillRow" aria-label="Tags">
        <span className="pill">{concept.angle}</span>
        <span className="pill">{concept.audience}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [productUrl, setProductUrl] = useState("");
  const [creativeUrl, setCreativeUrl] = useState("");
  const [creativeFile, setCreativeFile] = useState<File | null>(null);

  const [concepts, setConcepts] = useState<AdConcept[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creativeSummary = useMemo(() => {
    if (creativeFile) return `${creativeFile.name} (${Math.round(creativeFile.size / 1024)} KB)`;
    if (creativeUrl.trim()) return creativeUrl.trim();
    return "";
  }, [creativeFile, creativeUrl]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConcepts(null);

    const trimmedProductUrl = productUrl.trim();
    const trimmedCreativeUrl = creativeUrl.trim();

    if (!trimmedProductUrl) {
      setError("Product URL is required.");
      return;
    }
    if (!isValidUrl(trimmedProductUrl)) {
      setError("Product URL must be a valid URL (include https://).");
      return;
    }
    if (!trimmedCreativeUrl && !creativeFile) {
      setError("Provide a source creative URL or upload a file.");
      return;
    }
    if (trimmedCreativeUrl && !isValidUrl(trimmedCreativeUrl)) {
      setError("Source creative URL must be a valid URL (include https://).");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.set("productUrl", trimmedProductUrl);
      if (trimmedCreativeUrl) form.set("creativeUrl", trimmedCreativeUrl);
      if (creativeFile) form.set("creativeFile", creativeFile);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = (await res.json()) as
        | { concepts: AdConcept[] }
        | { error: string };

      if (!res.ok) {
        const message = "error" in data ? data.error : "Failed to generate concepts.";
        setError(message);
        return;
      }

      if (!("concepts" in data)) {
        setError("Unexpected response from server.");
        return;
      }

      setConcepts(data.concepts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setProductUrl("");
    setCreativeUrl("");
    setCreativeFile(null);
    setConcepts(null);
    setError(null);
    setLoading(false);
  }

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <h1 className="title">Ad Concept Generator (mock)</h1>
          <p className="subtitle">
            Enter a product URL and a source creative (URL or upload). Click generate to see 3 mock concepts.
          </p>
        </div>

        <div className="cardBody">
          <form onSubmit={onGenerate}>
            <div className="grid" style={{ marginBottom: 14 }}>
              <div className="field">
                <div className="labelRow">
                  <div className="label">Source creative</div>
                  <div className="hint">URL or upload</div>
                </div>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/your-creative"
                  value={creativeUrl}
                  onChange={(e) => setCreativeUrl(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setCreativeFile(e.target.files?.[0] ?? null)}
                />
                {creativeSummary ? (
                  <div className="hint">
                    Using: <span className="mono">{creativeSummary}</span>
                  </div>
                ) : null}
              </div>

              <div className="field">
                <div className="labelRow">
                  <div className="label">Product URL</div>
                  <div className="hint">Required</div>
                </div>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://yourproduct.com"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  required
                />
                <div className="hint">
                  Tip: include <span className="mono">fail</span> in the URL to see the error state.
                </div>
              </div>
            </div>

            <div className="buttonRow">
              <button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate 3 concepts"}
              </button>
              <button type="button" className="secondary" onClick={onReset} disabled={loading}>
                Reset
              </button>
              {loading ? <div className="hint">Mock generation runs ~1s.</div> : null}
            </div>

            {error ? (
              <div className="status statusError" style={{ marginTop: 14 }} role="alert">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="card">
        <div className="cardHeader">
          <h2 className="title" style={{ fontSize: 18, marginBottom: 0 }}>
            Results
          </h2>
          <p className="subtitle">
            {concepts?.length
              ? `Showing ${concepts.length} concepts.`
              : "Generate concepts to see results here."}
          </p>
        </div>
        <div className="cardBody">
          {loading ? (
            <div className="status" aria-busy="true">
              Generating 3 concepts...
            </div>
          ) : concepts?.length ? (
            <div className="resultsGrid">
              {concepts.map((c) => (
                <ConceptCard key={c.id} concept={c} />
              ))}
            </div>
          ) : (
            <div className="status">
              No results yet. Provide a product URL and a creative URL/upload, then click "Generate 3 concepts".
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
