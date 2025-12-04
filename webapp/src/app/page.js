 "use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [profileId, setProfileId] = useState("");
  const [domain, setDomain] = useState("");
  const [denylist, setDenylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dnsHttps = profileId ? `https://dns.nextdns.io/${profileId}` : "";
  const dnsHostname = profileId ? `${profileId}.dns.nextdns.io` : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedProfileId = window.localStorage.getItem("nextdnsProfileId");
    if (storedProfileId) {
      setProfileId(storedProfileId);
    }
  }, []);

  useEffect(() => {
    if (!profileId || typeof window === "undefined") return;
    window.localStorage.setItem("nextdnsProfileId", profileId);
  }, [profileId]);

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

  async function copyText(value, successMessage) {
    if (!value || typeof window === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setSuccess(successMessage);
    } catch (e) {
      setError("Could not copy to clipboard. Copy it manually from the text.");
    }
  }

  async function copyProfileId() {
    if (!profileId) return;
    await copyText(
      profileId,
      "Configuration ID copied. Paste it into the NextDNS app or settings."
    );
  }

  async function copyDnsHttps() {
    if (!dnsHttps) return;
    await copyText(
      dnsHttps,
      "DNS-over-HTTPS address copied. Paste it into DNS settings."
    );
  }

  async function copyDnsHostname() {
    if (!dnsHostname) return;
    await copyText(
      dnsHostname,
      "DNS hostname copied. Paste it into Private DNS / DNS settings."
    );
  }

  async function ensureProfile() {
    if (profileId) {
      return profileId;
    }

    setCreatingProfile(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Could not create a NextDNS profile. Check the server API key."
        );
        return null;
      }

      if (!data.profileId) {
        setError(
          "Profile was created but no profile id was returned from the server."
        );
        return null;
      }

      setProfileId(data.profileId);
      setSuccess("Created a private blocking profile for you.");
      return data.profileId;
    } catch (e) {
      setError(
        "Something went wrong while creating your NextDNS profile on the server."
      );
      return null;
    } finally {
      setCreatingProfile(false);
    }
  }

  async function fetchDenylist() {
    const currentProfileId = profileId || (await ensureProfile());
    if (!currentProfileId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/blocklist?profileId=${currentProfileId}`);
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

    const currentProfileId = profileId || (await ensureProfile());
    if (!currentProfileId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/blocklist?profileId=${currentProfileId}`, {
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
    const currentProfileId = profileId || (await ensureProfile());
    if (!currentProfileId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/blocklist?profileId=${currentProfileId}`, {
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

  function handleSelfBlock() {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const hostname = url.hostname || "localhost";
      handleAdd(hostname);
    } catch (e) {
      handleAdd("localhost");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>NextDNS Blocklist Tester</h1>
          <p>
            Add domains to your own NextDNS config to block them on your device.
            Your testers do not need a NextDNS account &mdash; this app creates a
            private profile for each browser using your API key.
          </p>
        </header>

        {!profileId && (
          <section className={styles.card}>
            <div className={styles.fieldGroup}>
              <label>Blocking profile</label>
              <p className={styles.helperText}>
                When you continue, this app will create a dedicated NextDNS
                configuration under your main account and remember it only in
                this browser. Your testers don&apos;t have to touch NextDNS.
              </p>
              <button
                type="button"
                onClick={ensureProfile}
                disabled={creatingProfile}
              >
                {creatingProfile ? "Creating profile..." : "Create my profile"}
              </button>
            </div>
          </section>
        )}

        {profileId && (
          <section className={styles.card}>
            <div className={styles.fieldGroup}>
              <label>Connect this device to your blocking profile</label>
              <p className={styles.helperText}>
                You have two ways to activate blocking on this device. Choose
                the one that feels easiest.
              </p>

              <p className={styles.helperText}>
                <strong>Option 1 – NextDNS app (easiest)</strong>
              </p>
              <p className={styles.helperText}>
                1. Download the free NextDNS app for your device (macOS, iOS,
                Android).{" "}
              </p>
              <p className={styles.helperText}>
                2. Open the app, enable{" "}
                <strong>Use custom configuration</strong> and paste this
                configuration ID:
              </p>
              <code className={styles.code}>{profileId}</code>
              <div className={styles.actionsRow}>
                <button type="button" onClick={copyProfileId} disabled={loading}>
                  Copy configuration ID
                </button>
              </div>
              <p className={styles.helperText}>
                Once the app is enabled with this ID, any domain you block here
                will be blocked on this device.
              </p>

              <p className={styles.helperText}>
                <strong>Option 2 – Configure DNS manually</strong>
              </p>
              <p className={styles.helperText}>
                <strong>iOS</strong>: Settings → General → VPN, DNS &amp; Device
                Management → DNS → Configure DNS. Use manual and paste:
              </p>
              <code className={styles.code}>{dnsHttps}</code>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  onClick={copyDnsHttps}
                  disabled={loading || !dnsHttps}
                >
                  Copy iOS DNS address
                </button>
              </div>
              <p className={styles.helperText}>
                <strong>Android</strong>: Settings → Network &amp; internet →
                Private DNS → Private DNS provider hostname. Use:
              </p>
              <code className={styles.code}>{dnsHostname}</code>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  onClick={copyDnsHostname}
                  disabled={loading || !dnsHostname}
                >
                  Copy Android DNS hostname
                </button>
              </div>
              <p className={styles.helperText}>
                After DNS is set to this profile, gambling sites you add here
                will stop working on that device.
              </p>
              <p className={styles.helperText}>
                <strong>Apple profile (automatic for iOS / macOS)</strong>
              </p>
              <p className={styles.helperText}>
                Download a configuration profile that sets DNS for you (works on
                Apple devices, similar to what NextDNS generates on{" "}
                <code>apple.nextdns.io</code>).
              </p>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileId || typeof window === "undefined") return;
                    window.location.href = `/api/apple-profile?profileId=${profileId}`;
                  }}
                  disabled={loading || !profileId}
                >
                  Download Apple profile (.mobileconfig)
                </button>
              </div>
            </div>
          </section>
        )}

        <section className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formRow}>
            <div className={styles.fieldGroupInline}>
              <label htmlFor="domain">Domain to block</label>
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
                Block
              </button>
            </div>
          </form>
        </section>

        {(error || success) && (
          <section className={styles.card}>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </section>
        )}

        <section className={styles.card}>
          <div className={styles.listHeader}>
            <h2>Current blocklist</h2>
            <button
              type="button"
              onClick={fetchDenylist}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          {denylist.length === 0 ? (
            <p className={styles.helperText}>
              No entries loaded yet. Load your blocklist above or add a domain.
            </p>
          ) : (
            <ul className={styles.list}>
              {denylist.map((item) => {
                const key = typeof item === "string" ? item : item.id || item.host;
                const label = typeof item === "string" ? item : item.id || item.host;
                return (
                  <li key={key} className={styles.listItem}>
                    <span>{label}</span>
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
      </main>
    </div>
  );
}

