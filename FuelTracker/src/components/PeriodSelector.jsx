import { useEffect, useMemo, useState } from "react";

export function periodRange(kind, customFrom = null, customTo = null) {
  if (kind === "custom" && customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    return { from, to, valid: from <= to };
  }
  const today = new Date();
  const start = new Date(today);
  if (kind === "30") start.setDate(start.getDate() - 30);
  else if (kind === "90") start.setDate(start.getDate() - 90);
  else if (kind === "ytd") start.setMonth(0, 1);
  return { from: start, to: today, valid: true };
}

export default function PeriodSelector({
  value, // "30" | "90" | "ytd" | "custom"
  onChange, // fn(nextValue)
  customFrom, // "yyyy-mm-dd"
  customTo, // "yyyy-mm-dd"
  onChangeFrom, // fn(dateStr)
  onChangeTo, // fn(dateStr)
  autoApply = true, // if false, show an Apply button for custom
}) {
  const showCustom = value === "custom";
  const [localFrom, setLocalFrom] = useState(customFrom || "");
  const [localTo, setLocalTo] = useState(customTo || "");

  // keep local inputs in sync if parent changes
  useEffect(() => {
    setLocalFrom(customFrom || "");
  }, [customFrom]);
  useEffect(() => {
    setLocalTo(customTo || "");
  }, [customTo]);

  const validity = useMemo(() => {
    if (!showCustom) return { ok: true, msg: "" };
    if (!localFrom || !localTo) return { ok: false, msg: "Pick both dates." };
    if (new Date(localFrom) > new Date(localTo))
      return { ok: false, msg: "`From` must be before `To`." };
    return { ok: true, msg: "" };
  }, [showCustom, localFrom, localTo]);

  function applyCustom() {
    if (!validity.ok) return;
    onChangeFrom?.(localFrom);
    onChangeTo?.(localTo);
  }

  // Auto-apply when both dates picked
  useEffect(() => {
    if (autoApply && showCustom && validity.ok) applyCustom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApply, showCustom, validity.ok, localFrom, localTo]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="border rounded p-2"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="custom">Custom</option>
      </select>

      {showCustom && (
        <>
          <input
            className="border rounded p-2"
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
          />
          <input
            className="border rounded p-2"
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
          />

          {!autoApply && (
            <button
              className="border rounded px-3 py-2"
              disabled={!validity.ok}
              onClick={applyCustom}
              title={validity.msg || "Apply range"}
            >
              Apply
            </button>
          )}
          {!validity.ok && (
            <span className="text-xs text-red-600">{validity.msg}</span>
          )}
        </>
      )}
    </div>
  );
}
