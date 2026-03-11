import { useState } from "react";
import styles from "./Loginpage.module.css";
import { useLogin } from "@/hooks/useLogin";

export function LoginPage() {
  const [email, setEmail] = useState("");

  const { sessionHours, submitting, error, handleLogin } = useLogin();

  const isValid = email.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    handleLogin({ email: email.trim() });
  }

  return (
    <div className={styles.root}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgGrid} />

      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle
                cx="13"
                cy="13"
                r="12"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M7 13 L11 9 L15 15 L19 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="19" cy="11" r="2.2" fill="currentColor" />
            </svg>
          </div>
          <span className={styles.brandName}>MotoTrack</span>
        </div>

        {/* Headline */}
        <div className={styles.headline}>
          <h1 className={styles.title}>Acesse o sistema</h1>
          <p className={styles.subtitle}>Informe seu e-mail para entrar.</p>
        </div>

        {/* Form */}
        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              E-mail
            </label>
            <div className={styles.inputWrapper}>
              <svg
                className={styles.inputIcon}
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <rect
                  x="1"
                  y="2.5"
                  width="13"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M1 5L7.5 9L14 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoComplete="email"
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M7 4v3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle cx="7" cy="10" r="0.8" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          <button
            className={styles.btn}
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Entrar
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M3 7.5h9M8.5 4l3.5 3.5L8.5 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Session info */}
        <div className={styles.sessionInfo}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle
              cx="6.5"
              cy="6.5"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M6.5 3.5v3l2 1.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {sessionHours === null ? (
            <span className={styles.sessionSkeleton} />
          ) : (
            <>
              Sessão ativa por <strong>{sessionHours} horas</strong> após o
              acesso
            </>
          )}
        </div>
      </div>
    </div>
  );
}
