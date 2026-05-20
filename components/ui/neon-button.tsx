"use client";

import { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

const G = {
  goldLight: "#f0d472",
  gold:      "#c9a84c",
  goldDim:   "#8a6010",
  navy:      "#0a1628",
};

type Base = {
  neon?:     boolean;
  variant?:  "default" | "solid";
  children:  ReactNode;
  className?: string;
  style?:    CSSProperties;
};

type AsButton = Base & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & { href?: undefined };
type AsAnchor = Base & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style"> & { href: string };

export function Button({
  neon = true,
  variant = "default",
  children,
  className,
  style: extraStyle,
  ...props
}: AsButton | AsAnchor) {

  const base: CSSProperties = {
    display:        "inline-flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    gap:            0,
    width:          "100%",
    padding:        "18px 24px",
    borderRadius:   16,
    fontFamily:     "inherit",
    cursor:         "pointer",
    textDecoration: "none",
    border:         "none",
    position:       "relative",
    overflow:       "hidden",
    transition:     "transform 150ms ease, box-shadow 220ms ease",
  };

  const solid: CSSProperties = {
    ...base,
    background: `linear-gradient(150deg, ${G.goldLight} 0%, ${G.gold} 48%, ${G.goldDim} 100%)`,
    color:      G.navy,
    boxShadow:  neon
      ? `0 0 0 1px rgba(201,168,76,0.40),
         0 0 20px rgba(201,168,76,0.60),
         0 0 52px rgba(201,168,76,0.28),
         0 6px 28px rgba(201,168,76,0.45),
         inset 0 1px 0 rgba(255,255,255,0.32)`
      : `0 4px 18px rgba(201,168,76,0.30), inset 0 1px 0 rgba(255,255,255,0.20)`,
    ...extraStyle,
  };

  const outline: CSSProperties = {
    ...base,
    background: "rgba(201,168,76,0.07)",
    color:      G.goldLight,
    border:     `1.5px solid rgba(201,168,76,0.60)`,
    boxShadow:  neon
      ? `0 0 10px rgba(201,168,76,0.45),
         0 0 30px rgba(201,168,76,0.20),
         inset 0 0 14px rgba(201,168,76,0.06)`
      : "none",
    ...extraStyle,
  };

  const computedStyle = variant === "solid" ? solid : outline;
  const cls = ["neon-btn-shine", className].filter(Boolean).join(" ");

  const gloss = variant === "solid" ? (
    <span style={{
      position:      "absolute",
      top: 0, left: 0, right: 0,
      height:        "48%",
      background:    "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
      borderRadius:  "16px 16px 0 0",
      pointerEvents: "none",
    }} />
  ) : null;

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as AsAnchor;
    return (
      <a href={href} className={cls} style={computedStyle} {...rest}>
        {gloss}
        {children}
      </a>
    );
  }

  return (
    <button className={cls} style={computedStyle} {...(props as AsButton)}>
      {gloss}
      {children}
    </button>
  );
}
