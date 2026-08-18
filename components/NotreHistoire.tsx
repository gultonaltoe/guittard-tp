import Image from "next/image";

export default function NotreHistoire({
  titre,
  contenu,
}: {
  titre: string;
  contenu: string;
}) {
  return (
    <div className="bg-[#f6f5f2] px-4 py-10 md:py-20">
      <div className="mx-auto max-w-[500px] text-center">
        <div className="mx-auto h-[22px] w-[3px] bg-[#e9cc1b]" />
        <h2 className="mt-4 text-2xl font-medium text-[#464746]">{titre}</h2>
        <p className="mt-4 leading-relaxed text-[#6b6b67]">{contenu}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Image
            src="/logo-guittard-badge.png"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className="rounded-full"
          />
          <span className="font-medium text-[#464746]">
            Vincent Guittard, fondateur
          </span>
        </div>
      </div>
    </div>
  );
}
