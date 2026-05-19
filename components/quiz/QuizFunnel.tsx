"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Answers = Record<number, string | string[]>;
type Screen = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8";

const SCREEN_ORDER: Screen[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

// ─── Profiles ─────────────────────────────────────────────────────────────────
const perfis = [
  {
    badge: "Iniciante com potencial",
    score: 89,
    nome: "Você tem vontade — falta a porta de entrada",
    desc: "O problema não é inteligência nem disciplina. É que ninguém te ensinou a forma certa de entrar na tradição filosófica clássica. A Escola da Razão foi criada exatamente para isso — te dar o método que os grandes estudiosos sempre usaram.",
  },
  {
    badge: "Leitor frustrado",
    score: 93,
    nome: "Você lê, mas o método está faltando",
    desc: "Ler sem lectio, meditatio e memoria é como encher um cesto furado. Você consome, mas não forma. A Escola da Razão te ensina esse método de 900 anos em 12 aulas práticas — e tudo muda a partir daí.",
  },
  {
    badge: "Católico sem base racional",
    score: 91,
    nome: "Fé você tem — agora falta a razão articulada",
    desc: "Tomás de Aquino passou a vida mostrando que fé e razão se complementam. Para defender o que você crê com argumentos filosóficos precisos, você precisa de base real. A Escola da Razão é esse fundamento.",
  },
  {
    badge: "Autodidata sério",
    score: 96,
    nome: "Você sabe o que quer — precisa do método certo",
    desc: "A diferença entre quem estuda Tomás em profundidade e quem fica na superfície é simples: método de leitura formativa. A Escola da Razão organiza o terreno para que cada hora de estudo seu valha o dobro a partir de agora.",
  },
];

function calcularPerfil(ans: Answers) {
  const a2 = (ans[2] as string) || "";
  const a4 = (ans[4] as string) || "";
  if (a2.includes("esqueço") || a2.includes("método")) return perfis[1];
  if (a4.includes("Defender") || a4.includes("fé")) return perfis[2];
  if (a2.includes("Leio às")) return perfis[3];
  return perfis[0];
}

// ─── Motion variants ──────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const transition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function Footer() {
  return (
    <div className="quiz-footer">
      © 2026 — Escola da Razão · Lucca de Tomás
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Voltar"
      style={{
        background: "transparent",
        border: "none",
        padding: "12px 16px 4px",
        color: "#444",
        fontSize: 20,
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      ←
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  pulse = false,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={pulse ? "cta-pulse" : ""}
      style={{
        width: "100%",
        padding: "16px",
        background: disabled ? "#c88" : "#8b1a1a",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.28 : 1,
        transition: "background 200ms, opacity 200ms",
        fontFamily: "inherit",
        pointerEvents: disabled ? "none" : "auto",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#6e1414";
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#8b1a1a";
      }}
    >
      {children}
    </button>
  );
}

function QuestionTag({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "#8b1a1a",
        background: "#fdf3f3",
        padding: "4px 10px",
        borderRadius: 20,
        marginBottom: 14,
      }}
    >
      {label}
    </div>
  );
}

// ─── Single-choice option ─────────────────────────────────────────────────────
function SingleOption({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="option-card"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        border: `1.5px solid ${selected ? "#8b1a1a" : "#e8e8e8"}`,
        borderRadius: 12,
        background: selected ? "#fdf5f5" : "#fff",
        marginBottom: 10,
        gap: 12,
      }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
        {text}
      </span>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2px solid ${selected ? "#8b1a1a" : "#ddd"}`,
          background: selected ? "#8b1a1a" : "transparent",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 150ms",
        }}
      >
        {selected && (
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
        )}
      </div>
    </motion.div>
  );
}

// ─── Multi-choice option ──────────────────────────────────────────────────────
function MultiOption({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="option-card"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        border: `1.5px solid ${selected ? "#8b1a1a" : "#e8e8e8"}`,
        borderRadius: 12,
        background: selected ? "#fdf5f5" : "#fff",
        marginBottom: 10,
        gap: 12,
        cursor: "pointer",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
        {text}
      </span>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${selected ? "#8b1a1a" : "#ddd"}`,
          background: selected ? "#8b1a1a" : "transparent",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 150ms",
        }}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}

// ─── Screen S0 — Cover ────────────────────────────────────────────────────────
function ScreenS0({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ background: "#fff" }}>

      {/* ── Hero escuro ── */}
      <div
        style={{
          background: "linear-gradient(170deg, #0e0404 0%, #1f0808 60%, #2a0a0a 100%)",
          padding: "40px 24px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ornamento de fundo — círculo dourado difuso */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,212,138,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="Escola da Razão"
            style={{ height: 52, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Divisor dourado */}
        <div
          style={{
            width: 40,
            height: 2,
            background: "linear-gradient(90deg, transparent, #f5d48a, transparent)",
            margin: "0 auto 24px",
          }}
        />

        {/* Tag pill */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(245,212,138,0.12)",
              color: "#f5d48a",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              padding: "5px 14px",
              borderRadius: 20,
              border: "1px solid rgba(245,212,138,0.25)",
            }}
          >
            Diagnóstico gratuito
          </span>
        </div>

        {/* H1 */}
        <h1
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: 900,
            lineHeight: 1.18,
            margin: "0 0 16px",
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          Descubra por que você ainda não consegue estudar{" "}
          <span
            style={{
              color: "#f5d48a",
              fontStyle: "italic",
            }}
          >
            filosofia clássica
          </span>{" "}
          de verdade
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 14,
            lineHeight: 1.7,
            margin: 0,
            textAlign: "center",
          }}
        >
          Responda 4 perguntas e receba um diagnóstico personalizado — com o próximo passo certo para o seu perfil.
        </p>
      </div>

      {/* ── Onda de transição ── */}
      <div
        style={{
          height: 32,
          background: "linear-gradient(170deg, #0e0404 0%, #2a0a0a 100%)",
          borderRadius: "0 0 50% 50% / 0 0 32px 32px",
          marginBottom: 32,
        }}
      />

      {/* ── Conteúdo branco ── */}
      <div style={{ padding: "0 24px" }}>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 32 }}>
          {[
            { num: "01", text: "4 perguntas rápidas sobre o seu perfil" },
            { num: "02", text: "1 diagnóstico personalizado do seu obstáculo" },
            { num: "03", text: "1 recomendação do seu próximo passo nos estudos" },
          ].map(({ num, text }, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 0",
                borderBottom: i < 2 ? "1px solid #f0ebe0" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "#c4a46a",
                  letterSpacing: "0.06em",
                  flexShrink: 0,
                  width: 24,
                }}
              >
                {num}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#2a1a1a", lineHeight: 1.45 }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA com brilho */}
        <motion.button
          onClick={onNext}
          className="cta-pulse"
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            padding: "17px 24px",
            background: "linear-gradient(135deg, #9e1f1f 0%, #7a1414 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            boxShadow:
              "0 4px 20px rgba(139,26,26,0.45), 0 1px 0 rgba(255,255,255,0.08) inset",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 28px rgba(139,26,26,0.6), 0 1px 0 rgba(255,255,255,0.08) inset";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 20px rgba(139,26,26,0.45), 0 1px 0 rgba(255,255,255,0.08) inset";
          }}
        >
          {/* Brilho interno */}
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              borderRadius: "14px 14px 0 0",
              pointerEvents: "none",
            }}
          />
          Quero ver meu diagnóstico →
        </motion.button>

        {/* Nota de tempo */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#bbb",
            marginTop: 14,
            marginBottom: 0,
            letterSpacing: "0.01em",
          }}
        >
          ⏱ Menos de 2 minutos · sem cadastro
        </p>
      </div>

      <div style={{ height: 28 }} />
      <Footer />
    </div>
  );
}

// ─── Screen S1 — Question 1 ───────────────────────────────────────────────────
function ScreenS1({
  onNext,
  onBack,
  answers,
  setAnswer,
}: {
  onNext: () => void;
  onBack: () => void;
  answers: Answers;
  setAnswer: (q: number, v: string) => void;
}) {
  const opts = [
    "Faz anos que tenho vontade, mas nunca comecei de verdade",
    "Comecei a me interessar recentemente",
    "Já tento estudar há algum tempo, com altos e baixos",
    "Acabei de descobrir que isso existe e me interessei agora",
  ];

  const handleSelect = (opt: string) => {
    setAnswer(1, opt);
    setTimeout(onNext, 300);
  };

  return (
    <div>
      <ProgressBar pct={20} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 1 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, margin: "0 0 20px" }}>
          Há quanto tempo você quer estudar filosofia clássica de verdade?
        </h2>
        {opts.map((opt) => (
          <SingleOption
            key={opt}
            text={opt}
            selected={answers[1] === opt}
            onClick={() => handleSelect(opt)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen S2 — Question 2 ───────────────────────────────────────────────────
function ScreenS2({
  onNext,
  onBack,
  answers,
  setAnswer,
}: {
  onNext: () => void;
  onBack: () => void;
  answers: Answers;
  setAnswer: (q: number, v: string) => void;
}) {
  const opts = [
    "Sim — mas travei logo no começo e desisti",
    "Sim — leio um pouco, mas esqueço tudo em dias",
    "Nunca tentei — não sei por onde começar",
    "Leio às vezes, mas sem nenhum método definido",
  ];

  const handleSelect = (opt: string) => {
    setAnswer(2, opt);
    setTimeout(onNext, 300);
  };

  return (
    <div>
      <ProgressBar pct={40} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 2 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, margin: "0 0 20px" }}>
          Você já tentou estudar algum clássico da filosofia antes?
        </h2>
        {opts.map((opt) => (
          <SingleOption
            key={opt}
            text={opt}
            selected={answers[2] === opt}
            onClick={() => handleSelect(opt)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen S3 — Question 3 (multi-choice) ────────────────────────────────────
function ScreenS3({
  onNext,
  onBack,
  answers,
  setAnswer,
}: {
  onNext: () => void;
  onBack: () => void;
  answers: Answers;
  setAnswer: (q: number, v: string[]) => void;
}) {
  const opts = [
    "Não sei por onde começar nem que livros escolher",
    "Leio e entendo na hora, mas esqueço tudo em dias",
    "Falta tempo — quando sobra energia, não sobra tempo",
    "Estudo sozinho e não tenho com quem discutir as ideias",
  ];

  const selected: string[] = (answers[3] as string[]) || [];

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    setAnswer(3, next);
  };

  const hasSelection = selected.length > 0;

  return (
    <div>
      <ProgressBar pct={60} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 3 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, margin: "0 0 6px" }}>
          Quais são seus maiores desafios hoje?
        </h2>
        <p style={{ fontSize: 13, color: "#999", fontStyle: "italic", margin: "0 0 18px" }}>
          * Selecione as opções e clique em continuar
        </p>
        {opts.map((opt) => (
          <MultiOption
            key={opt}
            text={opt}
            selected={selected.includes(opt)}
            onClick={() => toggle(opt)}
          />
        ))}
        <div style={{ marginTop: 4 }}>
          <PrimaryButton onClick={onNext} disabled={!hasSelection}>
            Continuar →
          </PrimaryButton>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen S4 — Question 4 ───────────────────────────────────────────────────
function ScreenS4({
  onNext,
  onBack,
  answers,
  setAnswer,
}: {
  onNext: () => void;
  onBack: () => void;
  answers: Answers;
  setAnswer: (q: number, v: string) => void;
}) {
  const opts = [
    "Defender a fé com argumentos sólidos, não só com emoção",
    "Ler e entender os clássicos de verdade — Aristóteles, Tomás",
    "Pensar com mais clareza, rigor e profundidade",
    "Ter uma formação intelectual séria fora da academia",
  ];

  const [pct, setPct] = useState(80);

  const handleSelect = (opt: string) => {
    setAnswer(4, opt);
    setPct(100);
    setTimeout(onNext, 500);
  };

  return (
    <div>
      <ProgressBar pct={pct} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 4 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, margin: "0 0 20px" }}>
          O que você mais quer conquistar estudando filosofia?
        </h2>
        {opts.map((opt) => (
          <SingleOption
            key={opt}
            text={opt}
            selected={answers[4] === opt}
            onClick={() => handleSelect(opt)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen S5 — Bridge ───────────────────────────────────────────────────────
function ScreenS5({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      {/* IMAGEM: img-bridge-1.jpg */}
      <div
        style={{
          height: 200,
          background: "linear-gradient(135deg, #1a0a0a 0%, #5a1515 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          position: "relative",
        }}
      >
        <div style={{ fontSize: 40 }}>📚</div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          A raiz do problema
        </span>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 12,
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          [Substituir: img-bridge-1.jpg]
        </div>
      </div>

      <BackButton onClick={onBack} />

      <div style={{ padding: "8px 20px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8b1a1a", marginBottom: 12 }}>
          Antes de ver seu diagnóstico
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.3, margin: "0 0 18px" }}>
          Isso não é falta de inteligência.{" "}
          <span style={{ color: "#8b1a1a" }}>É falta de método.</span>
        </h2>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 18px" }}>
          87% das pessoas que tentam estudar filosofia clássica sozinhas desistem nos primeiros 30 dias — não porque o assunto é difícil, mas porque{" "}
          <strong>ninguém as ensinou a forma certa de ler.</strong>
        </p>

        <div className="blockquote-styled" style={{ marginBottom: 18 }}>
          &ldquo;Você não está aqui para ler livros. Está aqui para aprender a pensar com eles.&rdquo;
          <div style={{ marginTop: 8, fontSize: 12, fontStyle: "normal", fontWeight: 700, color: "#8b1a1a" }}>
            — Tutor do Thomas Aquinas College
          </div>
        </div>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 24px" }}>
          Monges medievais dominavam bibliotecas inteiras com apenas 1 hora por dia — não porque eram gênios, mas porque tinham método. O mesmo método que um brasileiro aprendeu lá e trouxe para o Brasil.
        </p>

        <PrimaryButton onClick={onNext}>Continuar →</PrimaryButton>
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen S6 — Mentor ───────────────────────────────────────────────────────
function ScreenS6({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      {/* IMAGEM: img-mentor-lucca.jpg */}
      <div
        style={{
          height: 260,
          background: "#1a0a0a",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          overflow: "hidden",
        }}
      >
        {/* Placeholder content */}
        <div style={{ fontSize: 52 }}>👨‍🏫</div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>
          [Substituir: img-mentor-lucca.jpg]
        </p>

        {/* Gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(transparent, #1a0a0a)",
          }}
        />

        {/* Location tag */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          📍 Thomas Aquinas College — EUA
        </div>
      </div>

      <BackButton onClick={onBack} />

      <div style={{ padding: "8px 20px 24px" }}>
        <h2 style={{ fontSize: 21, fontWeight: 900, color: "#1a1a1a", margin: "0 0 6px" }}>
          Prazer, eu sou o Lucca de Tomás
        </h2>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#8b1a1a", margin: "0 0 18px" }}>
          Ex-aluno do Thomas Aquinas College · Fundador do Lyceum
        </p>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 14px" }}>
          Estudei no TAC — a referência mundial em educação clássica católica, onde{" "}
          <strong>todo o currículo é feito pela leitura direta dos clássicos</strong> pelo método socrático.
        </p>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 20px" }}>
          Desde que voltei, repliquei esse modelo no Brasil com o{" "}
          <strong>Lyceum</strong> — e criei a{" "}
          <strong>Escola da Razão</strong> como a porta de entrada para qualquer pessoa que quer estudar do jeito certo.
        </p>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-item">
            <div style={{ fontSize: 22, fontWeight: 900, color: "#8b1a1a" }}>300+</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4, lineHeight: 1.3 }}>alunos formados no Lyceum</div>
          </div>
          <div className="stat-item">
            <div style={{ fontSize: 22, fontWeight: 900, color: "#8b1a1a" }}>6</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4, lineHeight: 1.3 }}>turmas anuais conduzidas</div>
          </div>
          <div className="stat-item">
            <div style={{ fontSize: 22, fontWeight: 900, color: "#8b1a1a" }}>TAC</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4, lineHeight: 1.3 }}>único brasileiro com a credencial</div>
          </div>
        </div>

        <PrimaryButton onClick={onNext}>Ver meu diagnóstico →</PrimaryButton>
      </div>
      <Footer />
    </div>
  );
}

// ─── Screen S7 — Loading ──────────────────────────────────────────────────────
const STATUS_TEXTS = [
  "Identificando seu obstáculo principal...",
  "Mapeando seu perfil de estudante...",
  "Cruzando com os 4 perfis do Lucca...",
  "Calculando sua pontuação...",
  "Preparando seu diagnóstico personalizado...",
];

const FACTS = [
  { icon: "📊", text: "Seu perfil define qual parte da Escola da Razão é mais urgente pra você" },
  { icon: "📜", text: "O método de Hugo de São Vitor transforma 1h de estudo em 4h de aprendizado" },
  { icon: "🎯", text: "Com diagnóstico correto, alunos avançam 3x mais rápido nos clássicos" },
];

function ScreenS7({ onNext }: { onNext: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [visibleFacts, setVisibleFacts] = useState<number[]>([]);
  const advancedRef = useRef(false);

  useEffect(() => {
    const DURATION = 4000;
    const startTime = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      // Status text cycling
      const idx = Math.min(Math.floor((pct / 100) * STATUS_TEXTS.length), STATUS_TEXTS.length - 1);
      setStatusIdx(idx);

      // Facts appear at 28%, 56%, 80%
      const thresholds = [28, 56, 80];
      thresholds.forEach((t, i) => {
        if (pct >= t) {
          setVisibleFacts((prev) => (prev.includes(i) ? prev : [...prev, i]));
        }
      });

      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else if (!advancedRef.current) {
        advancedRef.current = true;
        setTimeout(onNext, 700);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onNext]);

  return (
    <div style={{ padding: "48px 24px 32px", minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {/* Spinner */}
      <div className="spinner" />

      {/* Text */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>
          Calculando seu perfil...
        </h2>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, margin: 0, maxWidth: 300 }}>
          Cruzando suas respostas com os perfis identificados pelo Lucca para recomendar o melhor caminho
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%" }}>
        <div style={{ height: 5, background: "#f0e8e0", borderRadius: 5, overflow: "hidden", marginBottom: 10 }}>
          <div
            style={{
              height: "100%",
              background: "#8b1a1a",
              width: `${progress}%`,
              borderRadius: 5,
              transition: "width 80ms linear",
            }}
          />
        </div>
        <p style={{ fontSize: 13, color: "#999", textAlign: "center", margin: 0 }}>
          {STATUS_TEXTS[statusIdx]}
        </p>
      </div>

      {/* Facts */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {FACTS.map((fact, i) => (
          <AnimatePresence key={i}>
            {visibleFacts.includes(i) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  background: "#fafaf7",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{fact.icon}</span>
                <span style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{fact.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <Footer />
    </div>
  );
}

// ─── Score count-up hook ──────────────────────────────────────────────────────
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

// ─── Screen S8 — Result + Offer ───────────────────────────────────────────────
function ScreenS8({ answers }: { answers: Answers }) {
  const perfil = calcularPerfil(answers);
  const displayScore = useCountUp(perfil.score);
  const [shaken, setShaken] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShaken(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const BULLETS = [
    "Fundamentos: o que é filosofia e o lugar de Aristóteles",
    "A grande síntese de Tomás — fé e razão",
    "Método completo: lectio, meditatio, memoria",
    "Humildade intelectual — a aula que muda tudo",
    "Bônus: O Mapa do Saber clássico",
    "Acesso vitalício · Plataforma Hubla",
  ];

  return (
    <div>
      {/* Dark hero with wave */}
      <div
        className="wave-divider"
        style={{
          background: "#1a0a0a",
          padding: "28px 20px 60px",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: "inline-block",
              background: "#7a1c1c",
              color: "#f5d48a",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "5px 12px",
              borderRadius: 20,
            }}
          >
            {perfil.badge}
          </span>
        </div>

        {/* Score */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: "#f5d48a",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          {displayScore}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>pontos de potencial</div>

        {/* Profile name */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{perfil.nome}</div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px 0" }}>
        {/* Profile description */}
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 20px" }}>
          {perfil.desc}
        </p>

        <div style={{ borderBottom: "1px solid #f0ebe0", marginBottom: 20 }} />

        {/* Recommended label */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#8b1a1a",
            marginBottom: 14,
          }}
        >
          ✦ Indicado para o seu perfil
        </div>

        {/* Product card */}
        <div
          style={{
            background: "#fdf9f4",
            border: "1.5px solid #e8d5b0",
            borderRadius: 14,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", margin: "0 0 6px" }}>
            Escola da Razão
          </h3>
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5, margin: "0 0 18px" }}>
            12 aulas com os fundamentos da filosofia clássica e o método monástico de leitura — por Lucca de Tomás
          </p>

          {/* Bullets */}
          <ul className="check-list">
            {BULLETS.map((b) => (
              <li key={b} className="check-item">
                <div className="check-circle">
                  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>R$ 47</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>à vista · acesso imediato</div>
        </div>

        {/* CTA with shake */}
        <motion.div
          animate={
            shaken
              ? { x: [0, -3, 3, -3, 3, -2, 2, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
        >
          <PrimaryButton>Quero entrar na Escola da Razão →</PrimaryButton>
        </motion.div>

        {/* Guarantee */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 12, marginBottom: 0 }}>
          🔒 7 dias de garantia incondicional
        </p>
      </div>

      <div style={{ height: 20 }} />
      <Footer />
    </div>
  );
}

// ─── Main Quiz Funnel ─────────────────────────────────────────────────────────
export default function QuizFunnel() {
  const [screen, setScreen] = useState<Screen>("S0");
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});

  const goTo = useCallback((next: Screen, dir = 1) => {
    setDirection(dir);
    setScreen(next);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const goNext = useCallback(() => {
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx < SCREEN_ORDER.length - 1) {
      goTo(SCREEN_ORDER[idx + 1], 1);
    }
  }, [screen, goTo]);

  const goBack = useCallback(() => {
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx > 0) {
      goTo(SCREEN_ORDER[idx - 1], -1);
    }
  }, [screen, goTo]);

  const setAnswer = useCallback((q: number, v: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [q]: v }));
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "S0": return <ScreenS0 onNext={goNext} />;
      case "S1": return <ScreenS1 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer} />;
      case "S2": return <ScreenS2 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer} />;
      case "S3": return <ScreenS3 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer as (q: number, v: string[]) => void} />;
      case "S4": return <ScreenS4 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer} />;
      case "S5": return <ScreenS5 onNext={goNext} onBack={goBack} />;
      case "S6": return <ScreenS6 onNext={goNext} onBack={goBack} />;
      case "S7": return <ScreenS7 onNext={goNext} />;
      case "S8": return <ScreenS8 answers={answers} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={screen}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}
