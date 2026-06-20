"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PracticeChart from "@/components/PracticeChart";
import { findTicket, tickets } from "@/data/tickets";

type AngleMode = "RAD" | "DEG";
type CalculatorMode = "standard" | "scientific" | "notes";

type KeySpec = {
  label: string;
  value?: string;
  action?:
    | "clear"
    | "toggle-sign"
    | "equals"
    | "menu"
    | "toggle-angle"
    | "second"
    | "memory-clear"
    | "memory-add"
    | "memory-subtract"
    | "memory-recall"
    | "square"
    | "cube"
    | "inverse"
    | "factorial"
    | "rand"
    | "exp10"
    | "expE";
  tone: "number" | "operator" | "function" | "dark";
};

function formatValueForDisplay(value: number): string {
  if (!Number.isFinite(value)) return "Ошибка";
  const normalized = Math.abs(value) < 1e-12 ? 0 : value;
  const isInteger = Number.isInteger(normalized);
  const formatted = normalized.toLocaleString("ru-RU", {
    maximumFractionDigits: isInteger ? 0 : 10,
    useGrouping: true,
  });
  return formatted.replace(/\u00A0/g, " ");
}

function toRadians(value: number, angleMode: AngleMode) {
  return angleMode === "DEG" ? (value * Math.PI) / 180 : value;
}

function fromRadians(value: number, angleMode: AngleMode) {
  return angleMode === "DEG" ? (value * 180) / Math.PI : value;
}

function factorial(value: number): number {
  if (value < 0 || !Number.isInteger(value)) throw new Error("Факториал определён только для целых неотрицательных чисел");
  let result = 1;
  for (let i = 2; i <= value; i += 1) result *= i;
  return result;
}

function evaluateExpression(source: string, angleMode: AngleMode): number {
  const raw = source.trim();
  if (!raw) return 0;

  let expression = raw
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "PI")
    .replace(/\be\b/g, "E")
    .replace(/\bEE\b/g, "e")
    .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)")
    .replace(/\^/g, "**");

  if (!/^[0-9+\-*/().,A-Za-z_ ]+$/.test(expression)) {
    throw new Error("Недопустимые символы");
  }

  const allowedWords = new Set([
    "PI",
    "E",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sinh",
    "cosh",
    "tanh",
    "sqrt",
    "cbrt",
    "nthRoot",
    "ln",
    "log",
    "abs",
    "exp",
    "fact",
    "rand",
  ]);
  const words = expression.match(/[A-Za-z_]+/g) ?? [];
  if (words.some((word) => !allowedWords.has(word))) {
    throw new Error("Неизвестная функция");
  }

  const context = {
    sin: (value: number) => Math.sin(toRadians(value, angleMode)),
    cos: (value: number) => Math.cos(toRadians(value, angleMode)),
    tan: (value: number) => Math.tan(toRadians(value, angleMode)),
    asin: (value: number) => fromRadians(Math.asin(value), angleMode),
    acos: (value: number) => fromRadians(Math.acos(value), angleMode),
    atan: (value: number) => fromRadians(Math.atan(value), angleMode),
    sinh: (value: number) => Math.sinh(value),
    cosh: (value: number) => Math.cosh(value),
    tanh: (value: number) => Math.tanh(value),
    sqrt: (value: number) => Math.sqrt(value),
    cbrt: (value: number) => Math.cbrt(value),
    nthRoot: (value: number, power: number) => Math.pow(value, 1 / power),
    ln: (value: number) => Math.log(value),
    log: (value: number) => Math.log10(value),
    abs: (value: number) => Math.abs(value),
    exp: (value: number) => Math.exp(value),
    fact: factorial,
    rand: () => Math.random(),
    PI: Math.PI,
    E: Math.E,
  };

  try {
    const result = Function(
      ...Object.keys(context),
      `"use strict"; return (${expression});`,
    )(...Object.values(context)) as number;

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Некорректное выражение");
    }

    return result;
  } catch {
    throw new Error("Проверь выражение");
  }
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.5h13" />
      <path d="M4 12h16" />
      <path d="M4 17.5h10" />
      <circle cx="4" cy="6.5" r="1.1" />
      <circle cx="4" cy="12" r="1.1" />
      <circle cx="4" cy="17.5" r="1.1" />
    </svg>
  );
}

function CalculatorGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.4" y="2.5" width="15.2" height="19" rx="2.8" />
      <rect x="7.3" y="5.2" width="9.4" height="4.2" rx="1" />
      <circle cx="8.6" cy="13" r="0.9" />
      <circle cx="12" cy="13" r="0.9" />
      <circle cx="15.4" cy="13" r="0.9" />
      <circle cx="8.6" cy="16.8" r="0.9" />
      <circle cx="12" cy="16.8" r="0.9" />
      <circle cx="15.4" cy="16.8" r="0.9" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`arrow-icon ${direction}`}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

const STANDARD_ROWS: KeySpec[][] = [
  [
    { label: "AC", action: "clear", tone: "function" },
    { label: "+/−", action: "toggle-sign", tone: "function" },
    { label: "%", value: "%", tone: "function" },
    { label: "÷", value: "÷", tone: "operator" },
  ],
  [
    { label: "7", value: "7", tone: "dark" },
    { label: "8", value: "8", tone: "dark" },
    { label: "9", value: "9", tone: "dark" },
    { label: "×", value: "×", tone: "operator" },
  ],
  [
    { label: "4", value: "4", tone: "dark" },
    { label: "5", value: "5", tone: "dark" },
    { label: "6", value: "6", tone: "dark" },
    { label: "−", value: "-", tone: "operator" },
  ],
  [
    { label: "1", value: "1", tone: "dark" },
    { label: "2", value: "2", tone: "dark" },
    { label: "3", value: "3", tone: "dark" },
    { label: "+", value: "+", tone: "operator" },
  ],
  [
    { label: "⌗", action: "menu", tone: "dark" },
    { label: "0", value: "0", tone: "dark" },
    { label: ",", value: ".", tone: "dark" },
    { label: "=", action: "equals", tone: "operator" },
  ],
];

function getScientificRows(secondMode: boolean, angleMode: AngleMode): KeySpec[][] {
  return [
    [
      { label: "(", value: "(", tone: "dark" },
      { label: ")", value: ")", tone: "dark" },
      { label: "mc", action: "memory-clear", tone: "dark" },
      { label: "m+", action: "memory-add", tone: "dark" },
      { label: "m−", action: "memory-subtract", tone: "dark" },
      { label: "mr", action: "memory-recall", tone: "dark" },
    ],
    [
      { label: "2nd", action: "second", tone: secondMode ? "function" : "dark" },
      { label: secondMode ? "x³" : "x²", action: secondMode ? "cube" : "square", tone: "dark" },
      { label: secondMode ? "x²" : "x³", action: secondMode ? "square" : "cube", tone: "dark" },
      { label: "xʸ", value: "^", tone: "dark" },
      { label: secondMode ? "ln" : "eˣ", action: secondMode ? undefined : "expE", value: secondMode ? "ln(" : undefined, tone: "dark" },
      { label: secondMode ? "log" : "10ˣ", action: secondMode ? undefined : "exp10", value: secondMode ? "log(" : undefined, tone: "dark" },
    ],
    [
      { label: "1/x", action: "inverse", tone: "dark" },
      { label: "²√x", value: "sqrt(", tone: "dark" },
      { label: "³√x", value: "cbrt(", tone: "dark" },
      { label: "ʸ√x", value: "nthRoot(", tone: "dark" },
      { label: "ln", value: "ln(", tone: "dark" },
      { label: "log₁₀", value: "log(", tone: "dark" },
    ],
    [
      { label: "x!", action: "factorial", tone: "dark" },
      { label: secondMode ? "sin⁻¹" : "sin", value: secondMode ? "asin(" : "sin(", tone: "dark" },
      { label: secondMode ? "cos⁻¹" : "cos", value: secondMode ? "acos(" : "cos(", tone: "dark" },
      { label: secondMode ? "tan⁻¹" : "tan", value: secondMode ? "atan(" : "tan(", tone: "dark" },
      { label: "e", value: "E", tone: "dark" },
      { label: "EE", value: "EE", tone: "dark" },
    ],
    [
      { label: "Rand", action: "rand", tone: "dark" },
      { label: "sinh", value: "sinh(", tone: "dark" },
      { label: "cosh", value: "cosh(", tone: "dark" },
      { label: "tanh", value: "tanh(", tone: "dark" },
      { label: "π", value: "π", tone: "dark" },
      { label: angleMode === "RAD" ? "Rad" : "Deg", action: "toggle-angle", tone: "dark" },
    ],
  ];
}

export default function CalculatorStudyApp() {
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>("standard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleMode>("RAD");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [error, setError] = useState("");
  const [memory, setMemory] = useState(0);
  const [secondMode, setSecondMode] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(1);
  const [conversionEnabled, setConversionEnabled] = useState(false);
  const [viewVersion, setViewVersion] = useState(0);
  const [slideVersion, setSlideVersion] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");
  const lastNotesTapAt = useRef(0);

  const currentTicket = useMemo(() => findTicket(selectedTicket), [selectedTicket]);
  const selectedTicketIndex = useMemo(() => tickets.findIndex((ticket) => ticket.number === selectedTicket), [selectedTicket]);
  const previousTicket = tickets[(selectedTicketIndex - 1 + tickets.length) % tickets.length];
  const nextTicket = tickets[(selectedTicketIndex + 1) % tickets.length];
  const scientificRows = useMemo(() => getScientificRows(secondMode, angleMode), [secondMode, angleMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (calculatorMode === "notes" || menuOpen) return;
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
        return;
      }
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      const allowed = "0123456789+-*/().";
      if (allowed.includes(event.key)) {
        event.preventDefault();
        append(event.key === "*" ? "×" : event.key === "/" ? "÷" : event.key);
      }
      if (event.key === "%") {
        event.preventDefault();
        append("%");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [calculatorMode, menuOpen, expression, angleMode]);

  function append(value: string) {
    setError("");
    setExpression((previous) => {
      const replace = justEvaluated && /^[0-9.(πE]$/.test(value);
      return replace ? value : previous + value;
    });
    setJustEvaluated(false);
  }

  function clearAll() {
    setExpression("");
    setResult("0");
    setError("");
    setJustEvaluated(false);
  }

  function calculate(nextExpression = expression) {
    try {
      const numeric = evaluateExpression(nextExpression, angleMode);
      const formatted = formatValueForDisplay(numeric);
      setResult(formatted);
      setError("");
      setJustEvaluated(true);
      return numeric;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка");
      setResult("Ошибка");
      setJustEvaluated(true);
      return null;
    }
  }

  function handleToggleSign() {
    if (!expression) {
      setExpression("-");
      return;
    }
    setExpression((previous) => {
      if (previous.startsWith("-")) return previous.slice(1);
      return `-${previous}`;
    });
  }

  function handleInverse() {
    const target = expression || result.replace(/ /g, "");
    setExpression(`1/(${target || 0})`);
    setJustEvaluated(false);
  }

  function handlePower(power: 2 | 3) {
    const target = expression || result.replace(/ /g, "");
    setExpression(`(${target || 0})^${power}`);
    setJustEvaluated(false);
  }

  function handleFactorial() {
    const target = expression || result.replace(/ /g, "");
    setExpression(`fact(${target || 0})`);
    setJustEvaluated(false);
  }

  function handleMemory(kind: "clear" | "add" | "subtract" | "recall") {
    if (kind === "clear") {
      setMemory(0);
      return;
    }
    if (kind === "recall") {
      append(String(memory));
      return;
    }

    const numeric = calculate(expression || result.replace(/ /g, ""));
    if (numeric == null) return;
    setMemory((previous) => (kind === "add" ? previous + numeric : previous - numeric));
  }

  function handleKeyPress(key: KeySpec) {
    if (key.value != null) {
      append(key.value);
      return;
    }

    switch (key.action) {
      case "clear":
        clearAll();
        break;
      case "toggle-sign":
        handleToggleSign();
        break;
      case "equals":
        calculate();
        break;
      case "menu":
        setMenuOpen(true);
        break;
      case "toggle-angle":
        setAngleMode((previous) => (previous === "RAD" ? "DEG" : "RAD"));
        break;
      case "second":
        setSecondMode((previous) => !previous);
        break;
      case "memory-clear":
        handleMemory("clear");
        break;
      case "memory-add":
        handleMemory("add");
        break;
      case "memory-subtract":
        handleMemory("subtract");
        break;
      case "memory-recall":
        handleMemory("recall");
        break;
      case "square":
        handlePower(2);
        break;
      case "cube":
        handlePower(3);
        break;
      case "inverse":
        handleInverse();
        break;
      case "factorial":
        handleFactorial();
        break;
      case "rand":
        append(String(Math.random()));
        break;
      case "exp10":
        append("10^");
        break;
      case "expE":
        append("exp(");
        break;
      default:
        break;
    }
  }

  function selectMode(mode: CalculatorMode) {
    if (mode !== calculatorMode) {
      setCalculatorMode(mode);
      setViewVersion((previous) => previous + 1);
    }
    setMenuOpen(false);
  }

  function selectTicketSlide(ticketNumber: number, direction: "forward" | "back") {
    if (ticketNumber === selectedTicket) return;
    setSlideDirection(direction);
    setSelectedTicket(ticketNumber);
    setSlideVersion((previous) => previous + 1);
  }

  function navigateTicket(step: -1 | 1) {
    const nextIndex = (selectedTicketIndex + step + tickets.length) % tickets.length;
    selectTicketSlide(tickets[nextIndex].number, step > 0 ? "forward" : "back");
  }

  function returnToCalculator() {
    setCalculatorMode("standard");
    setViewVersion((previous) => previous + 1);
    setMenuOpen(false);
  }

  function handleNotesTap() {
    const now = Date.now();
    if (now - lastNotesTapAt.current < 320) {
      lastNotesTapAt.current = 0;
      returnToCalculator();
      return;
    }
    lastNotesTapAt.current = now;
  }

  return (
    <main className={`iphone-shell ${menuOpen ? "is-dimmed" : ""}`}>
      <div className="iphone-screen">
        <button className="menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Открыть режимы калькулятора">
          <MenuIcon />
        </button>

        {calculatorMode === "notes" ? (
          <section key={`notes-${viewVersion}`} className="notes-view view-enter" onClick={handleNotesTap}>
            <div className="notes-header">
              <p>Архив</p>
              <h1>Практика по билетам</h1>
              <span>Готовые решения, формулы и построенные графики.</span>
            </div>

            <div className="ticket-deck" aria-label="Выбор практического билета">
              <button type="button" className="deck-arrow" onClick={() => navigateTicket(-1)} aria-label="Предыдущий билет">
                <ArrowIcon direction="left" />
              </button>

              <div className="deck-cards">
                <button type="button" className="deck-card deck-card-side deck-card-left" onClick={() => selectTicketSlide(previousTicket.number, "back")}>
                  <small>Билет</small>
                  <strong>№{previousTicket.number}</strong>
                </button>
                <div className="deck-card deck-card-active">
                  <span>Практика</span>
                  <strong>Билет №{currentTicket.number}</strong>
                  <small>{currentTicket.duplicateOf ? `Повтор билета №${currentTicket.duplicateOf}` : "Готовое решение"}</small>
                </div>
                <button type="button" className="deck-card deck-card-side deck-card-right" onClick={() => selectTicketSlide(nextTicket.number, "forward")}>
                  <small>Билет</small>
                  <strong>№{nextTicket.number}</strong>
                </button>
              </div>

              <button type="button" className="deck-arrow" onClick={() => navigateTicket(1)} aria-label="Следующий билет">
                <ArrowIcon direction="right" />
              </button>
            </div>

            <div className="ticket-progress" aria-label={`Билет ${selectedTicketIndex + 1} из ${tickets.length}`}>
              <span className="ticket-progress-fill" style={{ width: `${((selectedTicketIndex + 1) / tickets.length) * 100}%` }} />
            </div>

            <article key={`practice-${selectedTicket}-${slideVersion}`} className={`practice-slide slide-${slideDirection}`}>
              <div className="practice-card-header">
                <div>
                  <p>Билет №{currentTicket.number}</p>
                  <h2>Практическое задание</h2>
                </div>
                {currentTicket.duplicateOf ? <span className="duplicate-pill">повтор №{currentTicket.duplicateOf}</span> : null}
              </div>

              <div className="practice-task-panel">
                <span>Условие</span>
                <p>{currentTicket.practice.task}</p>
              </div>

              <section className="solution-card">
                <div className="solution-card-heading">
                  <span>Решение</span>
                  <em>{currentTicket.practice.steps.length} шагов</em>
                </div>
                <ol className="practice-steps">
                  {currentTicket.practice.steps.map((step, index) => (
                    <li key={`${currentTicket.number}-${index}`}>
                      <span>{index + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="practice-answer-box">
                <strong>Ответ</strong>
                <span>{currentTicket.practice.answer}</span>
                <div className="answer-calculation">
                  <small>Расчёт</small>
                  <code>{currentTicket.practice.shortCalculation}</code>
                </div>
              </div>

              {currentTicket.practice.graphs?.map((graph) => (
                <PracticeChart key={`${currentTicket.number}-${graph.title}`} graph={graph} />
              ))}
            </article>
          </section>
        ) : (
          <section key={`calculator-${calculatorMode}-${viewVersion}`} className={`calculator-view view-enter ${calculatorMode === "scientific" ? "scientific" : "standard"}`}>
            <div className="display-zone">
              <div className="expression-line">{expression || "0"}</div>
              <div className={`result-line ${error ? "error" : ""}`}>{error || result}</div>
            </div>

            {calculatorMode === "scientific" ? (
              <div className="scientific-stack">
                {scientificRows.map((row, index) => (
                  <div className="scientific-row" key={`scientific-${index}`}>
                    {row.map((key) => (
                      <button key={`${index}-${key.label}`} type="button" className={`calc-key ${key.tone} scientific-key ${key.label.length > 4 ? "compact" : ""}`} onClick={() => handleKeyPress(key)}>
                        {key.label === "⌗" ? <CalculatorGlyph /> : key.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="standard-stack">
              {STANDARD_ROWS.map((row, index) => (
                <div className="standard-row" key={`standard-${index}`}>
                  {row.map((key) => (
                    <button key={`${index}-${key.label}`} type="button" className={`calc-key ${key.tone} ${key.label === "0" ? "zero-key" : ""}`} onClick={() => handleKeyPress(key)}>
                      {key.label === "⌗" ? <CalculatorGlyph /> : key.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="home-indicator" aria-hidden="true" />

        {menuOpen ? (
          <>
            <button type="button" className="overlay-backdrop" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} />
            <aside className="mode-menu" role="dialog" aria-modal="true" aria-label="Режимы калькулятора">
              <button type="button" className={`mode-item ${calculatorMode === "standard" ? "selected" : ""}`} onClick={() => selectMode("standard")}>
                <span className="mode-icon">＋−<br />×÷</span>
                <span className="mode-label">Стандартный</span>
              </button>
              <button type="button" className={`mode-item ${calculatorMode === "scientific" ? "selected" : ""}`} onClick={() => selectMode("scientific")}>
                <span className="mode-icon">ƒ(x)</span>
                <span className="mode-label">Научный</span>
              </button>
              <button
                type="button"
                className={`mode-item secret-mode ${calculatorMode === "notes" ? "selected" : ""}`}
                onClick={() => selectMode("notes")}
                aria-label="Дополнительный режим"
              >
                <span className="visually-hidden">Дополнительный режим</span>
              </button>
              <div className="menu-divider" />
              <div className="conversion-row">
                <button type="button" className={`switch ${conversionEnabled ? "enabled" : ""}`} onClick={() => setConversionEnabled((previous) => !previous)} aria-label="Переключить конвертацию">
                  <span className="switch-thumb" />
                </button>
                <span>Конвертация</span>
              </div>
            </aside>
          </>
        ) : null}
      </div>
    </main>
  );
}
