"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Answers = Record<number, string | string[]>;
type Screen = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8";

const SCREEN_ORDER: Screen[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

// ─── Paleta da Logo ───────────────────────────────────────────────────────────
const C = {
  navy:        "#1c2d4f",
  navyDark:    "#0a1628",
  navyMid:     "#163366",
  navyLight:   "#eef2f9",
  gold:        "#c9a84c",
  goldLight:   "#e8c97a",
  cream:       "#fdf8ef",
  borderWarm:  "#d4c48a",
  border:      "#dde3ed",
  text:        "#0a1628",
  textSub:     "#4a5568",
  textMuted:   "#94a3b8",
};

// ─── Profiles ─────────────────────────────────────────────────────────────────
const perfis = [
  {
    badge: "Iniciante com potencial",
    score: 89,
    tag: "Seu diagnóstico",
    nome: "A vontade existe.\nFalta a porta certa.",
    desc: "O obstáculo não é inteligência — é método. Ninguém te ensinou a forma que os grandes mestres usaram por séculos para entrar na tradição filosófica clássica. A Escola da Razão existe para isso.",
  },
  {
    badge: "Leitor frustrado",
    score: 93,
    tag: "Seu diagnóstico",
    nome: "Você lê muito.\nRetém pouco.",
    desc: "Sem lectio, meditatio e memoria, cada livro é um cesto furado — você consome, mas não forma. A Escola da Razão te dá esse método de 900 anos em 12 aulas diretas ao ponto.",
  },
  {
    badge: "Católico sem base racional",
    score: 91,
    tag: "Seu diagnóstico",
    nome: "Fé você tem.\nFalta a razão articulada.",
    desc: "Tomás de Aquino dedicou a vida a mostrar que fé e razão se completam. Para defender o que você crê com precisão filosófica, você precisa de fundamento real — e é exatamente isso que a Escola da Razão oferece.",
  },
  {
    badge: "Autodidata sério",
    score: 96,
    tag: "Seu diagnóstico",
    nome: "Você sabe o que quer.\nPrecisa do método certo.",
    desc: "A diferença entre quem penetra Tomás de verdade e quem fica na superfície é simples: leitura formativa. A Escola da Razão organiza o caminho para que cada hora de estudo valha muito mais.",
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
  exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};
const transition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] };

// ─── Shared UI ────────────────────────────────────────────────────────────────
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
        background: "transparent", border: "none",
        padding: "12px 16px 4px", color: C.textSub,
        fontSize: 20, cursor: "pointer", lineHeight: 1,
      }}
    >
      ←
    </button>
  );
}

function PrimaryButton({
  children, onClick, disabled = false, pulse = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={pulse ? "cta-pulse" : ""}
      style={{
        width: "100%", padding: "16px",
        background: disabled
          ? "#a0aec0"
          : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
        color: "#fff", border: "none", borderRadius: 14,
        fontSize: 16, fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "opacity 200ms, box-shadow 200ms",
        fontFamily: "inherit",
        pointerEvents: disabled ? "none" : "auto",
        boxShadow: disabled
          ? "none"
          : `0 4px 18px rgba(28,45,79,0.40), 0 1px 0 rgba(255,255,255,0.07) inset`,
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            `0 6px 26px rgba(28,45,79,0.55), 0 1px 0 rgba(255,255,255,0.07) inset`;
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            `0 4px 18px rgba(28,45,79,0.40), 0 1px 0 rgba(255,255,255,0.07) inset`;
      }}
    >
      <span
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)",
          borderRadius: "14px 14px 0 0", pointerEvents: "none",
        }}
      />
      {children}
    </button>
  );
}

function QuestionTag({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "inline-block", fontSize: 11, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: C.navy, background: C.navyLight,
        padding: "4px 10px", borderRadius: 20, marginBottom: 14,
      }}
    >
      {label}
    </div>
  );
}

// ─── Single-choice option ─────────────────────────────────────────────────────
function SingleOption({ text, selected, onClick }: { text: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="option-card"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
        border: `1.5px solid ${selected ? C.navy : C.border}`,
        borderRadius: 12,
        background: selected ? C.navyLight : "#fff",
        marginBottom: 10, gap: 12,
      }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
        {text}
      </span>
      <div
        style={{
          width: 22, height: 22, borderRadius: "50%",
          border: `2px solid ${selected ? C.navy : "#cdd5e0"}`,
          background: selected ? C.navy : "transparent",
          flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "center", transition: "all 150ms",
        }}
      >
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
      </div>
    </motion.div>
  );
}

// ─── Multi-choice option ──────────────────────────────────────────────────────
function MultiOption({ text, selected, onClick }: { text: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="option-card"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
        border: `1.5px solid ${selected ? C.navy : C.border}`,
        borderRadius: 12,
        background: selected ? C.navyLight : "#fff",
        marginBottom: 10, gap: 12, cursor: "pointer",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
        {text}
      </span>
      <div
        style={{
          width: 22, height: 22, borderRadius: 6,
          border: `2px solid ${selected ? C.navy : "#cdd5e0"}`,
          background: selected ? C.navy : "transparent",
          flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "center", transition: "all 150ms",
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

// ─── S0 — Cover ───────────────────────────────────────────────────────────────
function ScreenS0({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ background: "#fff" }}>

      {/* Hero navy */}
      <div
        style={{
          background: `linear-gradient(170deg, #06101f 0%, #0f1f3d 55%, ${C.navy} 100%)`,
          padding: "44px 24px 52px",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Brilho dourado difuso superior */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 260, height: 260, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Logo centralizada */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <img src="/logo.png" alt="Escola da Razão"
            style={{ height: 96, width: "auto", objectFit: "contain" }} />
        </div>

        {/* Divisor dourado */}
        <div style={{
          width: 48, height: 2, margin: "0 auto 22px",
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        }} />

        {/* Tag pill */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span style={{
            display: "inline-block",
            background: `rgba(201,168,76,0.13)`,
            color: C.goldLight,
            fontSize: 10, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.14em",
            padding: "5px 14px", borderRadius: 20,
            border: `1px solid rgba(201,168,76,0.28)`,
          }}>
            Diagnóstico gratuito
          </span>
        </div>

        {/* H1 */}
        <h1 style={{
          color: "#fff", fontSize: 26, fontWeight: 900,
          lineHeight: 1.18, margin: "0 0 16px",
          textAlign: "center", letterSpacing: "-0.02em",
        }}>
          Descubra por que você ainda não consegue estudar{" "}
          <span style={{ color: C.gold, fontStyle: "italic" }}>filosofia clássica</span>{" "}
          de verdade
        </h1>

        {/* Subtítulo */}
        <p style={{
          color: "rgba(255,255,255,0.52)", fontSize: 14,
          lineHeight: 1.7, margin: 0, textAlign: "center",
        }}>
          Responda 4 perguntas e receba um diagnóstico personalizado — com o próximo passo certo para o seu perfil.
        </p>
      </div>

      {/* Onda de transição */}
      <div style={{
        height: 32,
        background: `linear-gradient(170deg, #06101f 0%, ${C.navy} 100%)`,
        borderRadius: "0 0 50% 50% / 0 0 32px 32px",
        marginBottom: 32,
      }} />

      {/* Conteúdo */}
      <div style={{ padding: "0 24px" }}>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 32 }}>
          {[
            { num: "01", text: "Algumas perguntas rápidas sobre o seu perfil" },
            { num: "02", text: "Um diagnóstico personalizado do seu obstáculo" },
            { num: "03", text: "Receba uma recomendação sobre seu próximo passo nos estudos" },
          ].map(({ num, text }, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "14px 0",
              borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{
                fontSize: 11, fontWeight: 900, color: C.gold,
                letterSpacing: "0.06em", flexShrink: 0, width: 24,
              }}>{num}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.45 }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA principal */}
        <PrimaryButton onClick={onNext} pulse>
          Iniciar agora!
        </PrimaryButton>

        <p style={{
          textAlign: "center", fontSize: 12, color: C.textMuted,
          marginTop: 14, marginBottom: 16, letterSpacing: "0.01em",
        }}>
          ⏱ Menos de 2 minutos · sem cadastro
        </p>

        {/* CTA secundário */}
        <button
          onClick={onSkip}
          style={{
            width: "100%", padding: "14px",
            background: "transparent",
            color: C.navy,
            border: `1.5px solid ${C.border}`,
            borderRadius: 14, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            transition: "border-color 200ms, background 200ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = C.navy;
            (e.currentTarget as HTMLButtonElement).style.background = C.navyLight;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          Já sei o que quero →
        </button>
      </div>

      <div style={{ height: 28 }} />
      <Footer />
    </div>
  );
}

// ─── S1 — Pergunta 1 ──────────────────────────────────────────────────────────
function ScreenS1({ onNext, onBack, answers, setAnswer }: {
  onNext: () => void; onBack: () => void;
  answers: Answers; setAnswer: (q: number, v: string) => void;
}) {
  const opts = [
    "Faz anos que tenho vontade, mas nunca comecei de verdade",
    "Comecei a me interessar recentemente",
    "Já tento estudar há algum tempo, com altos e baixos",
    "Acabei de descobrir que isso existe e me interessei agora",
  ];
  return (
    <div>
      <ProgressBar pct={20} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 1 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.3, margin: "0 0 20px" }}>
          Há quanto tempo você quer estudar filosofia clássica de verdade?
        </h2>
        {opts.map((opt) => (
          <SingleOption key={opt} text={opt} selected={answers[1] === opt}
            onClick={() => { setAnswer(1, opt); setTimeout(onNext, 300); }} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ─── S2 — Pergunta 2 ──────────────────────────────────────────────────────────
function ScreenS2({ onNext, onBack, answers, setAnswer }: {
  onNext: () => void; onBack: () => void;
  answers: Answers; setAnswer: (q: number, v: string) => void;
}) {
  const opts = [
    "Sim — mas travei logo no começo e desisti",
    "Sim — leio um pouco, mas esqueço tudo em dias",
    "Nunca tentei — não sei por onde começar",
    "Leio às vezes, mas sem nenhum método definido",
  ];
  return (
    <div>
      <ProgressBar pct={40} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 2 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.3, margin: "0 0 20px" }}>
          Você já tentou estudar algum clássico da filosofia antes?
        </h2>
        {opts.map((opt) => (
          <SingleOption key={opt} text={opt} selected={answers[2] === opt}
            onClick={() => { setAnswer(2, opt); setTimeout(onNext, 300); }} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ─── S3 — Pergunta 3 (multi) ──────────────────────────────────────────────────
function ScreenS3({ onNext, onBack, answers, setAnswer }: {
  onNext: () => void; onBack: () => void;
  answers: Answers; setAnswer: (q: number, v: string[]) => void;
}) {
  const opts = [
    "Não sei por onde começar nem que livros escolher",
    "Leio e entendo na hora, mas esqueço tudo em dias",
    "Falta tempo — quando sobra energia, não sobra tempo",
    "Estudo sozinho e não tenho com quem discutir as ideias",
  ];
  const selected: string[] = (answers[3] as string[]) || [];
  const toggle = (opt: string) =>
    setAnswer(3, selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  return (
    <div>
      <ProgressBar pct={60} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 3 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.3, margin: "0 0 6px" }}>
          Quais são seus maiores desafios hoje?
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", margin: "0 0 18px" }}>
          * Selecione as opções e clique em continuar
        </p>
        {opts.map((opt) => (
          <MultiOption key={opt} text={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
        ))}
        <div style={{ marginTop: 4 }}>
          <PrimaryButton onClick={onNext} disabled={selected.length === 0}>Continuar →</PrimaryButton>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── S4 — Pergunta 4 ──────────────────────────────────────────────────────────
function ScreenS4({ onNext, onBack, answers, setAnswer }: {
  onNext: () => void; onBack: () => void;
  answers: Answers; setAnswer: (q: number, v: string) => void;
}) {
  const opts = [
    "Defender a fé com argumentos sólidos, não só com emoção",
    "Ler e entender os clássicos de verdade — Aristóteles, Tomás",
    "Pensar com mais clareza, rigor e profundidade",
    "Ter uma formação intelectual séria fora da academia",
  ];
  const [pct, setPct] = useState(80);
  const handleSelect = (opt: string) => {
    setAnswer(4, opt); setPct(100); setTimeout(onNext, 500);
  };
  return (
    <div>
      <ProgressBar pct={pct} />
      <BackButton onClick={onBack} />
      <div style={{ padding: "12px 20px 24px" }}>
        <QuestionTag label="Pergunta 4 de 4" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.3, margin: "0 0 20px" }}>
          O que você mais quer conquistar estudando filosofia?
        </h2>
        {opts.map((opt) => (
          <SingleOption key={opt} text={opt} selected={answers[4] === opt}
            onClick={() => handleSelect(opt)} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ─── S5 — Bridge ─────────────────────────────────────────────────────────────
function ScreenS5({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <div style={{ height: 240, position: "relative", overflow: "hidden", background: C.navyDark }}>
        <img
          src="/foto-aura.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(transparent, #fff)`,
        }} />
      </div>

      <BackButton onClick={onBack} />

      <div style={{ padding: "8px 20px 24px" }}>
        <div style={{
          fontSize: 11, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.1em", color: C.gold, marginBottom: 12,
        }}>
          Antes de ver seu diagnóstico
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1.3, margin: "0 0 18px" }}>
          Isso não é falta de inteligência.{" "}
          <span style={{ color: C.navy }}>É falta de método.</span>
        </h2>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, margin: "0 0 18px" }}>
          A maioria das pessoas tenta estudar filosofia clássica sozinha e acaba desistindo cedo —
          não porque o assunto seja impossível, mas porque{" "}
          <strong>ninguém ensinou como esses textos realmente devem ser lidos.</strong>
        </p>

        <div className="blockquote-styled" style={{ marginBottom: 18 }}>
          &ldquo;O primeiro sinal de um bom estudante é a paciência — o estudo é como a agricultura.&rdquo;
          <div style={{ marginTop: 8, fontSize: 12, fontStyle: "normal", fontWeight: 700, color: C.navy }}>
            — Hugo de São Vitor
          </div>
        </div>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, margin: "0 0 14px" }}>
          Durante séculos, estudantes aprenderam filosofia através de métodos de leitura,
          contemplação e organização do pensamento que quase desapareceram no ensino moderno.
        </p>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, margin: "0 0 14px" }}>
          <strong>Hoje, muita gente lê muito… mas entende pouco.</strong>
        </p>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, margin: "0 0 24px" }}>
          Foi ao entrar em contato com esse modelo de formação clássica fora do Brasil que um
          brasileiro decidiu adaptar esses princípios para uma nova geração de estudantes.
        </p>

        <PrimaryButton onClick={onNext}>Continuar →</PrimaryButton>
      </div>
      <Footer />
    </div>
  );
}

// ─── S6 — Mentor ─────────────────────────────────────────────────────────────
function ScreenS6({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <div style={{
        height: 400, background: C.navyDark,
        position: "relative", overflow: "hidden",
      }}>
        <img
          src="/foto-professor.webp"
          alt="Lucca de Tomás"
          style={{ width: "100%", height: "140%", objectFit: "cover", objectPosition: "center 18%", display: "block" }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(transparent, ${C.navyDark})`,
        }} />
        <div style={{
          position: "absolute", bottom: 16, left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          borderRadius: 20, padding: "5px 14px",
          fontSize: 12, color: "#fff", whiteSpace: "nowrap",
        }}>
          📍 Thomas Aquinas College — EUA
        </div>
      </div>

      <BackButton onClick={onBack} />

      <div style={{ padding: "8px 20px 24px" }}>
        <h2 style={{ fontSize: 21, fontWeight: 900, color: C.text, margin: "0 0 6px" }}>
          Prazer, eu sou o Lucca de Tomás
        </h2>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.gold, margin: "0 0 18px" }}>
          Criador de Conteúdo · Fundador do Lyceum
        </p>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, margin: "0 0 14px" }}>
          Lucca de Tomás estudou Artes Liberais e Educação Clássica no{" "}
          <strong>Thomas Aquinas College (EUA)</strong>, uma das instituições mais rigorosas do mundo no ensino clássico pelo método socrático.
        </p>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, margin: "0 0 20px" }}>
          Discípulo da filosofia e teologia de <strong>Santo Tomás de Aquino</strong>, tem como missão pessoal contribuir para o renascimento cultural brasileiro através da formação intelectual séria.
        </p>

        <PrimaryButton onClick={onNext}>Ver meu diagnóstico →</PrimaryButton>
      </div>
      <Footer />
    </div>
  );
}

// ─── S7 — Loading ─────────────────────────────────────────────────────────────
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
      const pct = Math.min(((now - startTime) / DURATION) * 100, 100);
      setProgress(pct);
      setStatusIdx(Math.min(Math.floor((pct / 100) * STATUS_TEXTS.length), STATUS_TEXTS.length - 1));
      [28, 56, 80].forEach((t, i) => {
        if (pct >= t) setVisibleFacts((p) => p.includes(i) ? p : [...p, i]);
      });
      if (pct < 100) { frame = requestAnimationFrame(tick); }
      else if (!advancedRef.current) { advancedRef.current = true; setTimeout(onNext, 700); }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onNext]);

  return (
    <div style={{ padding: "48px 24px 32px", minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      <div className="spinner" />

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
          Calculando seu perfil...
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, margin: 0, maxWidth: 300 }}>
          Cruzando suas respostas com os perfis identificados pelo Lucca para recomendar o melhor caminho
        </p>
      </div>

      <div style={{ width: "100%" }}>
        <div style={{ height: 5, background: C.border, borderRadius: 5, overflow: "hidden", marginBottom: 10 }}>
          <div style={{
            height: "100%", background: C.navy,
            width: `${progress}%`, borderRadius: 5, transition: "width 80ms linear",
          }} />
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", margin: 0 }}>
          {STATUS_TEXTS[statusIdx]}
        </p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {FACTS.map((fact, i) => (
          <AnimatePresence key={i}>
            {visibleFacts.includes(i) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  background: C.cream, borderRadius: 10,
                  padding: "12px 14px", display: "flex",
                  alignItems: "flex-start", gap: 10,
                  border: `1px solid ${C.borderWarm}`,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{fact.icon}</span>
                <span style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>{fact.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <Footer />
    </div>
  );
}

const PAYMENT_URL = "https://pay.hub.la/KJLdsZa55bTmIuB9ABC1";

// ─── S8 — Página de Vendas ────────────────────────────────────────────────────
function ScreenS8({ answers }: { answers: Answers }) {
  const perfil = calcularPerfil(answers);
const MODULOS = [
    { num: "01", titulo: "O melhor método para começar", desc: "Qual o melhor método pra quem está começando a estudar filosofia clássica" },
    { num: "02", titulo: "Pilares da leitura filosófica", desc: "Os pilares de uma leitura filosófica correta e coerente" },
    { num: "03", titulo: "O método na prática", desc: "Exemplos com aulas dadas aos alunos mostrando o método na prática" },
  ];

  const BULLETS = [
    "12 aulas em vídeo — ritmo próprio, acesso vitalício",
    "Método monástico de leitura adaptado ao século XXI",
    "Plataforma Hubla com suporte e comunidade",
    "Bônus: Mapa do Saber Clássico (PDF exclusivo)",
    "Certificado de conclusão",
  ];

  return (
    <div style={{ background: "#fff" }}>

      {/* Hero navy com diagnóstico */}
      <div style={{
        background: "linear-gradient(175deg, #040d1a 0%, #0e1f3a 55%, #1a2f50 100%)",
        padding: "36px 28px 52px",
        position: "relative", textAlign: "center", overflow: "hidden",
      }}>
        {/* glow central */}
        <div style={{
          position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
          width: 340, height: 260, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.13) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        {/* glow inferior */}
        <div style={{
          position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)",
          width: 280, height: 120, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
        >
          <img src="/logo.png" alt="Escola da Razão" style={{ height: 76, width: "auto", objectFit: "contain" }} />
        </motion.div>

        {/* tag de diagnóstico */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ marginBottom: 16 }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(201,168,76,0.10)",
            border: "1px solid rgba(201,168,76,0.25)",
            color: C.gold, fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.16em",
            padding: "5px 14px", borderRadius: 20,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, display: "inline-block" }} />
            {perfil.tag}
          </span>
        </motion.div>

        {/* título — quebra de linha preservada */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{
            color: "#ffffff", fontSize: 26, fontWeight: 900,
            lineHeight: 1.18, margin: "0 0 6px", letterSpacing: "-0.03em",
            whiteSpace: "pre-line",
          }}
        >
          {perfil.nome}
        </motion.h1>

        {/* linha dourada ornamental */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
          style={{
            width: 48, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            margin: "14px auto 16px", borderRadius: 2,
          }}
        />

        {/* descrição */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ color: "rgba(255,255,255,0.52)", fontSize: 14, lineHeight: 1.75, margin: 0, maxWidth: 340, marginInline: "auto" }}
        >
          {perfil.desc}
        </motion.p>
      </div>

      {/* Onda de transição */}
      <div style={{
        height: 32,
        background: "linear-gradient(175deg, #040d1a 0%, #0e1f3a 55%, #1a2f50 100%)",
        borderRadius: "0 0 50% 50% / 0 0 32px 32px",
        marginBottom: 28,
      }} />

      <div style={{ padding: "0 20px" }}>

        {/* ── Bloco preço + CTA ── */}
        <div style={{
          background: `linear-gradient(160deg, #06101f 0%, ${C.navyMid} 100%)`,
          borderRadius: 20, padding: "28px 22px 24px",
          textAlign: "center", marginBottom: 28,
          boxShadow: `0 12px 48px rgba(10,22,40,0.36), 0 0 0 1px rgba(201,168,76,0.18)`,
          position: "relative", overflow: "hidden",
        }}>
          {/* glows */}
          <div style={{
            position: "absolute", top: -70, left: "50%", transform: "translateX(-50%)",
            width: 260, height: 200, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(201,168,76,0.14) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, right: -40, width: 160, height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* pill label */}
          <div style={{ marginBottom: 18 }}>
            <span style={{
              display: "inline-block",
              background: "rgba(201,168,76,0.14)",
              border: "1px solid rgba(201,168,76,0.32)",
              color: C.gold, fontSize: 10, fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.16em",
              padding: "5px 16px", borderRadius: 20,
            }}>
              ✦ Acesso completo por apenas
            </span>
          </div>

          {/* preço riscado animado */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", marginBottom: 6, textDecoration: "line-through", letterSpacing: "0.02em" }}
          >
            De R$ 197,00
          </motion.div>

          {/* preço principal animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 6, marginBottom: 4 }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: C.goldLight, lineHeight: 1, marginTop: 14 }}>R$</span>
            <span style={{ fontSize: 76, fontWeight: 900, color: "#fff", lineHeight: 0.9, letterSpacing: "-0.04em" }}>47</span>
          </motion.div>

          {/* separador dourado */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "14px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.20)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
              pagamento único · acesso vitalício
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.20)" }} />
          </div>

          {/* CTA */}
          <motion.a
            href={PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.025,
              boxShadow: "0 10px 40px rgba(201,168,76,0.70)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              textDecoration: "none",
              background: `linear-gradient(135deg, #f0d472 0%, ${C.gold} 50%, #9a7020 100%)`,
              color: "#0a1628",
              padding: "19px 24px", borderRadius: 16,
              fontSize: 16, fontWeight: 900, letterSpacing: "0.01em",
              boxShadow: `0 6px 32px rgba(201,168,76,0.50), 0 1px 0 rgba(255,255,255,0.30) inset`,
              position: "relative", overflow: "hidden",
              cursor: "pointer",
            }}
          >
            {/* gloss */}
            <span style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "45%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
              borderRadius: "16px 16px 0 0", pointerEvents: "none",
            }} />
            Quero entrar na Escola da Razão
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.a>

          {/* selo compra segura */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{ marginTop: 18, display: "flex", justifyContent: "center" }}
          >
            <img
              src="/compra-segura.png"
              alt="Compra segura"
              style={{ height: 36, width: "auto", opacity: 0.75, objectFit: "contain" }}
            />
          </motion.div>
        </div>

        {/* ── O que você vai aprender ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: C.gold }}>
            O que você vai aprender
          </span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Módulos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {MODULOS.map(({ num, titulo, desc }) => (
            <div key={num} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "14px 16px", background: C.cream,
              border: `1px solid ${C.borderWarm}`, borderRadius: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: C.navy,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: C.gold }}>{num}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{titulo}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tudo incluso */}
        <div style={{
          background: C.navyLight, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "16px 18px", marginBottom: 12,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.12em", color: C.navy, marginBottom: 12,
          }}>Tudo que está incluso</div>
          <ul className="check-list">
            {BULLETS.map((b) => (
              <li key={b} className="check-item">
                <div className="check-circle">
                  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 13 }}>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: "12px 0 8px" }}>
          Ao clicar você será redirecionado para o checkout seguro da Hubla.
        </p>
      </div>

      <div style={{ height: 24 }} />
      <Footer />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QuizFunnel() {
  const [screen, setScreen] = useState<Screen>("S0");
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});

  const goTo = useCallback((next: Screen, dir = 1) => {
    setDirection(dir); setScreen(next);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const goNext = useCallback(() => {
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx < SCREEN_ORDER.length - 1) goTo(SCREEN_ORDER[idx + 1], 1);
  }, [screen, goTo]);

  const goBack = useCallback(() => {
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx > 0) goTo(SCREEN_ORDER[idx - 1], -1);
  }, [screen, goTo]);

  const setAnswer = useCallback((q: number, v: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [q]: v }));
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "S0": return <ScreenS0 onNext={goNext} onSkip={() => goTo("S8", 1)} />;
      case "S1": return <ScreenS1 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer} />;
      case "S2": return <ScreenS2 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer} />;
      case "S3": return <ScreenS3 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer as (q: number, v: string[]) => void} />;
      case "S4": return <ScreenS4 onNext={goNext} onBack={goBack} answers={answers} setAnswer={setAnswer} />;
      case "S5": return <ScreenS5 onNext={goNext} onBack={goBack} />;
      case "S6": return <ScreenS6 onNext={goNext} onBack={goBack} />;
      case "S7": return <ScreenS7 onNext={goNext} />;
      case "S8": return <ScreenS8 answers={answers} />;
      default:   return null;
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
