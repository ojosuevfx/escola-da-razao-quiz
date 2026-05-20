import QuizFunnel from "@/components/quiz/QuizFunnel";

export default function Home() {
  return (
    <div className="desktop-wrapper">

      {/* ── Painel esquerdo (desktop only) ───────────────────────── */}
      <aside className="left-panel">
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <img
            src="/logo.png"
            alt="Escola da Razão"
            style={{ height: 88, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Headline */}
        <h2 style={{
          color: "#ffffff", fontSize: 26, fontWeight: 900,
          lineHeight: 1.2, letterSpacing: "-0.03em",
          margin: "0 0 12px", textAlign: "center",
        }}>
          Aprenda a pensar com<br />
          <span style={{ color: "#c9a84c" }}>os grandes mestres</span>
        </h2>

        {/* Gold divider */}
        <div style={{
          width: 48, height: 2, margin: "16px auto 18px",
          background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
          borderRadius: 2,
        }} />

        {/* Subtítulo */}
        <p style={{
          color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.7,
          textAlign: "center", margin: "0 0 36px",
        }}>
          Filosofia clássica com o método socrático<br />
          que formou os maiores pensadores da história.
        </p>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: "auto" }}>
          {[
            { icon: "📜", title: "Método de 900 anos", desc: "Lectio, meditatio e memoria — o mesmo método dos mosteiros medievais." },
            { icon: "🎓", title: "12 aulas com Lucca de Tomás", desc: "Formado no Thomas Aquinas College, a referência mundial em educação clássica." },
            { icon: "♾️", title: "Acesso vitalício", desc: "Estude no seu ritmo, volte quantas vezes precisar." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "14px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.14)",
              borderRadius: 12,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: "rgba(201,168,76,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          marginTop: 36,
          borderLeft: "3px solid rgba(201,168,76,0.45)",
          paddingLeft: 14,
        }}>
          <p style={{
            fontSize: 13, fontStyle: "italic",
            color: "rgba(255,255,255,0.38)", lineHeight: 1.65, margin: "0 0 8px",
          }}>
            &ldquo;O primeiro sinal de um bom estudante é a paciência, o estudo é como a agricultura.&rdquo;
          </p>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(201,168,76,0.55)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            — Hugo de São Vitor
          </span>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 28, fontSize: 11,
          color: "rgba(255,255,255,0.18)", textAlign: "center",
        }}>
          © 2026 — Escola da Razão · Lucca de Tomás
        </p>
      </aside>

      {/* ── Quiz (mobile: full width / desktop: right column) ────── */}
      <main className="right-panel">
        <div className="quiz-card">
          <QuizFunnel />
        </div>
      </main>

    </div>
  );
}
