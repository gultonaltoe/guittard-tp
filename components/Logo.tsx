export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded bg-[#1c1f22] text-[#f4c430] font-bold text-sm">
        GT
      </span>
      <span className="font-semibold leading-tight text-[#1c1f22]">
        Guittard TP
        <span className="block text-xs font-normal text-neutral-500">
          &amp; Terrassement
        </span>
      </span>
    </div>
  );
}
