"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [denylist, setDenylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch blocklist on mount
  useEffect(() => {
    fetchDenylist();
  }, []);

  function normalizeDomain(input) {
    if (!input || typeof input !== "string") return "";
    let value = input.trim().toLowerCase();

    // Strip protocol if the user pasted a full URL
    value = value.replace(/^[a-z]+:\/\//, "");

    // Remove path, query, and hash
    value = value.split("/")[0].split("?")[0].split("#")[0];

    // Strip leading "www." so we block the base domain, which also covers www.*
    if (value.startsWith("www.")) {
      value = value.slice(4);
    }

    return value;
  }

  async function fetchDenylist() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/blocklist`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load blocklist.");
        setDenylist([]);
        return;
      }

      setDenylist(Array.isArray(data.denylist) ? data.denylist : []);
    } catch (e) {
      setError("Something went wrong while talking to the server.");
      setDenylist([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(domainToAdd) {
    const raw = domainToAdd || domain;
    const trimmed = normalizeDomain(raw);
    if (!trimmed) {
      setError("Enter a domain to block.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/blocklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add domain to blocklist.");
        return;
      }

      setSuccess(data.message || `Blocked ${trimmed}.`);
      setDomain("");
      await fetchDenylist();
    } catch (e) {
      setError("Something went wrong while talking to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(domainToRemove) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/blocklist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: domainToRemove }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to remove domain from blocklist.");
        return;
      }

      setSuccess(data.message || `Removed ${domainToRemove} from blocklist.`);
      await fetchDenylist();
    } catch (e) {
      setError("Something went wrong while talking to the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleAdd();
  }

  function handleDownloadProfile() {
    if (typeof window === "undefined") return;
    // You can optionally add ?password=custom123 to set a custom password
    window.location.href = `/api/apple-profile`;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>🛡️ Spelinsikt BetBlocker</h1>
          <p>
            A universal blocklist for blocking unwanted sites on iOS devices.
            All users share the same blocklist.
          </p>
        </header>

        <section className={styles.card}>
          <div className={styles.fieldGroup}>
            <label>📱 Setup on iOS Device</label>
            <p className={styles.helperText}>
              <strong>Step 1:</strong> Download and install the DNS profile
            </p>
            <div className={styles.actionsRow}>
              <button
                type="button"
                onClick={handleDownloadProfile}
                disabled={loading}
                className={styles.primaryButton}
              >
                📥 Download iOS Profile (.mobileconfig)
              </button>
            </div>
            <p className={styles.helperText}>
              <strong>Step 2:</strong> After downloading, go to Settings → Profile Downloaded → Install
            </p>
            <p className={styles.helperText}>
              <strong>Step 3:</strong> Enter your passcode and tap "Install"
            </p>
            <p className={styles.helperText}>
              Once installed, all domains in the blocklist below will be blocked on your device.
            </p>
          </div>
        </section>

        <section className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formRow}>
            <div className={styles.fieldGroupInline}>
              <label htmlFor="domain">Add Domain to Universal Blocklist</label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
              />
            </div>
            <div className={styles.actionsRow}>
              <button type="submit" disabled={loading}>
                🚫 Block Domain
              </button>
            </div>
          </form>
        </section>

        {(error || success) && (
          <section className={styles.card}>
            {error && <p className={styles.error}>❌ {error}</p>}
            {success && <p className={styles.success}>✅ {success}</p>}
          </section>
        )}

        <section className={styles.card}>
          <div className={styles.listHeader}>
            <h2>🌐 Universal Blocklist</h2>
            <button
              type="button"
              onClick={fetchDenylist}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
          <p className={styles.helperText}>
            These domains are blocked for all users who have installed the profile.
          </p>
          {denylist.length === 0 ? (
            <p className={styles.helperText}>
              No domains blocked yet. Add one above to get started.
            </p>
          ) : (
            <ul className={styles.list}>
              {denylist.map((item) => {
                const key = typeof item === "string" ? item : item.id || item.host;
                const label = typeof item === "string" ? item : item.id || item.host;
                return (
                  <li key={key} className={styles.listItem}>
                    <span>🔒 {label}</span>
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => handleRemove(label)}
                      disabled={loading}
                    >
                      remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className={styles.footer}>
          <p>Powered by NextDNS • All users share the same blocklist</p>
        </footer>
      </main>
    </div>
  );
}
