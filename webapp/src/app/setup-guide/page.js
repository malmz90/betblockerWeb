"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./setup.module.css";

export default function SetupGuide() {
  const [currentStep, setCurrentStep] = useState(1);
  const [checklist, setChecklist] = useState({
    profileInstalled: false,
    screenTimeEnabled: false,
    restrictionsSet: false,
    passcodeWithPartner: false,
    tested: false,
  });

  const toggleChecklistItem = (item) => {
    setChecklist({ ...checklist, [item]: !checklist[item] });
  };

  const allComplete = Object.values(checklist).every((v) => v);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>🔐 Complete Protection Setup</h1>
          <p>
            Follow these steps to enable maximum protection that prevents easy
            profile removal. This should be done WITH your accountability partner.
          </p>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </header>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${
                (Object.values(checklist).filter((v) => v).length / 5) * 100
              }%`,
            }}
          />
        </div>

        <section className={styles.card}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>Step 1</span>
            <h2>Install DNS Protection Profile</h2>
          </div>
          <div className={styles.instructions}>
            <p>First, download and install the DNS configuration profile:</p>
            <ol>
              <li>Click the download button on the home page</li>
              <li>Go to Settings → Profile Downloaded</li>
              <li>Tap "Install" and enter your device passcode</li>
              <li>Confirm installation</li>
            </ol>
            <div className={styles.verification}>
              <strong>✓ Verify:</strong> Settings → General → VPN & Device
              Management → Configuration Profile → You should see "Spelinsikt
              BetBlocker DNS"
            </div>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={checklist.profileInstalled}
              onChange={() => toggleChecklistItem("profileInstalled")}
            />
            <span>Profile installed and verified</span>
          </label>
        </section>

        <section className={styles.card}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>Step 2</span>
            <h2>Enable Screen Time (WITH Partner)</h2>
          </div>
          <div className={styles.instructions}>
            <div className={styles.warningBox}>
              <strong>⚠️ IMPORTANT:</strong> Your accountability partner should
              be with you for this step. They will set and keep the Screen Time
              passcode.
            </div>
            <p>
              <strong>On your iOS device:</strong>
            </p>
            <ol>
              <li>
                Open <strong>Settings</strong>
              </li>
              <li>
                Scroll down and tap <strong>Screen Time</strong>
              </li>
              <li>
                If Screen Time is off, tap <strong>Turn On Screen Time</strong>
              </li>
              <li>
                Tap <strong>Continue</strong>
              </li>
              <li>
                Select <strong>This is My iPhone/iPad</strong>
              </li>
            </ol>
            <div className={styles.infoBox}>
              <strong>💡 Note:</strong> Screen Time will now be enabled. Next,
              you'll set a passcode that ONLY your partner will know.
            </div>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={checklist.screenTimeEnabled}
              onChange={() => toggleChecklistItem("screenTimeEnabled")}
            />
            <span>Screen Time is enabled</span>
          </label>
        </section>

        <section className={styles.card}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>Step 3</span>
            <h2>Set Screen Time Passcode (Partner Does This)</h2>
          </div>
          <div className={styles.instructions}>
            <div className={styles.criticalBox}>
              <strong>🔴 CRITICAL:</strong> Hand your phone to your
              accountability partner. They will set a passcode that you DO NOT
              KNOW.
            </div>
            <p>
              <strong>Partner instructions:</strong>
            </p>
            <ol>
              <li>
                In Screen Time settings, tap{" "}
                <strong>Use Screen Time Passcode</strong>
              </li>
              <li>
                <strong>Choose a passcode</strong> the user doesn't know (do not
                tell them!)
              </li>
              <li>Enter it twice to confirm</li>
              <li>
                Enter your Apple ID email (for passcode recovery - use YOUR
                email, not the user's)
              </li>
            </ol>
            <div className={styles.warningBox}>
              <strong>⚠️ Partner:</strong> Store this passcode securely:
              <ul>
                <li>Write it down and keep it safe</li>
                <li>Save it in your password manager</li>
                <li>DO NOT share it with the user</li>
                <li>This passcode is the key to protection</li>
              </ul>
            </div>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={checklist.passcodeWithPartner}
              onChange={() => toggleChecklistItem("passcodeWithPartner")}
            />
            <span>
              Partner has set Screen Time passcode and stored it securely
            </span>
          </label>
        </section>

        <section className={styles.card}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>Step 4</span>
            <h2>Enable Protection Restrictions</h2>
          </div>
          <div className={styles.instructions}>
            <p>
              Now enable the restrictions that prevent profile removal (you'll
              need the Screen Time passcode your partner just set):
            </p>
            <ol>
              <li>
                In Screen Time, tap{" "}
                <strong>Content & Privacy Restrictions</strong>
              </li>
              <li>
                Toggle <strong>Content & Privacy Restrictions</strong> to ON
                (enter Screen Time passcode)
              </li>
              <li>
                Scroll down and tap <strong>Allow Changes</strong>
              </li>
              <li>
                Find <strong>Profile & Device Management</strong>
              </li>
              <li>
                Select <strong>Don't Allow</strong>
              </li>
              <li>Tap back</li>
            </ol>
            <div className={styles.successBox}>
              <strong>✅ Result:</strong> You now CANNOT remove the DNS profile
              without the Screen Time passcode that your partner holds. Any
              attempt to remove it will require the passcode.
            </div>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={checklist.restrictionsSet}
              onChange={() => toggleChecklistItem("restrictionsSet")}
            />
            <span>Profile & Device Management set to "Don't Allow"</span>
          </label>
        </section>

        <section className={styles.card}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>Step 5</span>
            <h2>Test the Protection</h2>
          </div>
          <div className={styles.instructions}>
            <p>Verify that the protection is working:</p>
            <ol>
              <li>
                Go to <strong>Settings → General → VPN & Device Management</strong>
              </li>
              <li>Tap on "Spelinsikt BetBlocker DNS" profile</li>
              <li>
                Try to tap <strong>Remove Profile</strong>
              </li>
              <li>
                You should be asked for the <strong>Screen Time Passcode</strong>
              </li>
              <li>
                <strong>DO NOT REMOVE IT</strong> - just confirm the passcode
                prompt appears
              </li>
              <li>Tap Cancel</li>
            </ol>
            <div className={styles.successBox}>
              <strong>✅ Success:</strong> If you see the Screen Time passcode
              prompt, protection is working! You cannot remove the profile
              without your partner's passcode.
            </div>
            <div className={styles.infoBox}>
              <strong>💡 Also test:</strong> Try visiting a blocked gambling
              site in Safari. It should show "Cannot Connect to Server" or
              similar error.
            </div>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={checklist.tested}
              onChange={() => toggleChecklistItem("tested")}
            />
            <span>Tested and confirmed protection is working</span>
          </label>
        </section>

        {allComplete && (
          <section className={styles.completionCard}>
            <h2>🎉 Setup Complete!</h2>
            <p>
              You now have maximum protection enabled. The DNS profile cannot be
              removed without your accountability partner's Screen Time passcode.
            </p>
            <div className={styles.nextSteps}>
              <h3>What happens now:</h3>
              <ul>
                <li>
                  ✅ Gambling sites in the blocklist are blocked on this device
                </li>
                <li>
                  ✅ You cannot remove the DNS profile without partner's passcode
                </li>
                <li>
                  ✅ Your partner can add/remove sites via the web app
                </li>
                <li>✅ Protection works on both WiFi and cellular</li>
              </ul>
              <h3>If you need to remove protection:</h3>
              <ul>
                <li>
                  Contact your accountability partner and explain why
                </li>
                <li>
                  Partner can provide the Screen Time passcode if appropriate
                </li>
                <li>
                  Consider waiting 24 hours before making this decision
                </li>
              </ul>
            </div>
            <Link href="/" className={styles.primaryButton}>
              ← Back to Home
            </Link>
          </section>
        )}

        <section className={styles.card}>
          <h3>Important Information</h3>
          <div className={styles.infoBox}>
            <h4>For the User:</h4>
            <ul>
              <li>
                This protection is designed to help you maintain your commitment
              </li>
              <li>
                It adds friction to prevent impulsive decisions during moments
                of weakness
              </li>
              <li>You can always reach out to your partner for support</li>
              <li>
                Consider this a tool to help you, not a punishment
              </li>
            </ul>
            <h4>For the Accountability Partner:</h4>
            <ul>
              <li>
                Store the Screen Time passcode securely - you'll need it if the
                user legitimately needs to remove protection
              </li>
              <li>
                Check in regularly with the user about how they're doing
              </li>
              <li>
                If they ask for the passcode, consider having a conversation
                first
              </li>
              <li>
                You can view/modify the blocklist via the web app anytime
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.card}>
          <h3>Troubleshooting</h3>
          <details className={styles.details}>
            <summary>
              Screen Time passcode prompt doesn't appear when trying to remove
              profile
            </summary>
            <p>
              This means restrictions aren't set correctly. Go back to Step 4
              and verify:
            </p>
            <ul>
              <li>Content & Privacy Restrictions is ON</li>
              <li>
                Profile & Device Management is set to "Don't Allow" (not "Allow"
                or "Allow Changes")
              </li>
            </ul>
          </details>
          <details className={styles.details}>
            <summary>Forgot Screen Time passcode</summary>
            <p>Recovery options:</p>
            <ul>
              <li>
                Ask your accountability partner (they should have it stored)
              </li>
              <li>
                Use Apple ID recovery (if partner's Apple ID was used during
                setup)
              </li>
              <li>
                As last resort: Factory reset device (this removes everything)
              </li>
            </ul>
          </details>
          <details className={styles.details}>
            <summary>Gambling sites still accessible</summary>
            <p>Check the following:</p>
            <ul>
              <li>Profile is installed and active</li>
              <li>Domain is actually in the blocklist (check web app)</li>
              <li>Try in Safari Private mode (DNS cache may be stale)</li>
              <li>Wait 30-60 seconds for DNS changes to propagate</li>
            </ul>
          </details>
          <details className={styles.details}>
            <summary>
              Need to temporarily disable for legitimate reasons
            </summary>
            <p>Contact your accountability partner:</p>
            <ul>
              <li>Explain why you need to remove protection</li>
              <li>Discuss if there are alternatives</li>
              <li>Set a specific time to re-enable</li>
              <li>Partner can provide Screen Time passcode if appropriate</li>
            </ul>
          </details>
        </section>
      </main>
    </div>
  );
}

