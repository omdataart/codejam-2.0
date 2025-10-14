export default function InfoTip({ title }) {
  return (
    <span
      className="ml-1 inline-flex items-center justify-center rounded-full border w-4 h-4 text-[10px] leading-none cursor-help"
      title={title}
      aria-label={title}
      role="note"
    >
      i
    </span>
  );
}
