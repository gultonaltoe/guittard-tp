import Image from "next/image";

export default function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-guittard-badge.png"
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        priority={priority}
      />
      <span className="font-semibold leading-tight text-[#464746]">
        Guittard TP
        <span className="block text-xs font-normal text-neutral-500">
          &amp; Terrassement
        </span>
      </span>
    </div>
  );
}
