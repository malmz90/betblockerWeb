"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

// NOTE:
// - NEXTDNS_PROFILE_ID is used server-side (in API routes) and should remain secret there.
// - For Android Private DNS, we only expose the derived hostname (not any API keys).
const NEXTDNS_PROFILE_ID = process.env.NEXT_PUBLIC_NEXTDNS_PROFILE_ID;
const SAFE_PROFILE_ID = NEXTDNS_PROFILE_ID
  ? String(NEXTDNS_PROFILE_ID).replace(/[^a-zA-Z0-9_-]/g, "")
  : "";

// Android Private DNS uses a hostname like "<profileId>.dns.nextdns.io"
const ANDROID_PRIVATE_DNS_HOSTNAME = SAFE_PROFILE_ID
  ? `${SAFE_PROFILE_ID}.dns.nextdns.io`
  : "";

// Test URL to verify that Android DNS blocking works.
// Add this domain to your NextDNS denylist for testing.
const ANDROID_TEST_URL = "https://www.example.com";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [denylist, setDenylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedAndroidHostname, setCopiedAndroidHostname] = useState(false);

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
    window.location.href = `/api/apple-profile`;
  }

  function handleCopyAndroidHostname() {
    if (!ANDROID_PRIVATE_DNS_HOSTNAME) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }
    navigator.clipboard
      .writeText(ANDROID_PRIVATE_DNS_HOSTNAME)
      .then(() => {
        setCopiedAndroidHostname(true);
        setTimeout(() => setCopiedAndroidHostname(false), 2000);
      })
      .catch(() => {});
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

        <section className={styles.card}>
          <h2>🤖 Simple Android DNS Test (Experimental)</h2>
          <p className={styles.helperText}>
            This helps you quickly verify that your NextDNS setup also blocks domains on an
            Android device using Android&apos;s Private DNS feature.
          </p>
          <div className={styles.fieldGroup}>
            <label>NextDNS hostname for Android Private DNS</label>
            <div className={styles.actionsRow}>
              <code className={styles.code}>
                {ANDROID_PRIVATE_DNS_HOSTNAME || "Set NEXT_PUBLIC_NEXTDNS_PROFILE_ID in .env.local"}
              </code>
              <button
                type="button"
                onClick={handleCopyAndroidHostname}
                disabled={!ANDROID_PRIVATE_DNS_HOSTNAME}
                className={styles.secondaryButton}
              >
                {copiedAndroidHostname ? "Copied" : "Copy hostname"}
              </button>
            </div>
          </div>
          <ol className={styles.helperText}>
            <li>
              On your <strong>Android 9+</strong> phone, go to{" "}
              <em>Settings → Network & internet → Advanced → Private DNS</em> (menu names may
              vary slightly by manufacturer).
            </li>
            <li>
              Select <strong>Private DNS provider hostname</strong> and paste the hostname
              shown above. It should look like{" "}
              <code className={styles.code}>{"<profileId>.dns.nextdns.io"}</code>.
            </li>
            <li>
              Make sure the test domain below is <strong>blocked in your NextDNS configuration</strong>{" "}
              (add it to the denylist in the NextDNS dashboard if needed).
            </li>
            <li>
              On the same Android device, tap the button below. If DNS blocking works, the site
              should <strong>fail to load or show a block page</strong>.
            </li>
          </ol>
          <div className={styles.actionsRow}>
            <a
              href={ANDROID_TEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryButton}
            >
              🚀 Open Android DNS Test Site
            </a>
          </div>
          <p className={styles.helperText}>
            If the site still loads normally, double‑check the hostname spelling in Private DNS,
            that you&apos;re on a network using that DNS (Wi‑Fi vs mobile data), and that the
            test domain is actually on your NextDNS denylist.
          </p>
        </section>

        <footer className={styles.footer}>
          <p>Powered by NextDNS • All users share the same blocklist</p>
        </footer>
      </main>
    </div>
  );
}
