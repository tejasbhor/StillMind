import Link from "next/link";
import CustomCursor from "@/components/layout/CustomCursor";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <div
        className="min-h-screen flex"
        style={{ background: "linear-gradient(135deg, #E8F2EE 0%, #F5F3EF 60%, #EAE7E1 100%)" }}
      >
        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col justify-between p-14 w-[42%] relative overflow-hidden">
          {/* Orbs */}
          <div aria-hidden className="orb animate-float-slow w-72 h-72 -top-12 -left-12"
            style={{ background: "radial-gradient(circle, #B8D4C0, transparent 70%)" }} />
          <div aria-hidden className="orb animate-float-medium w-48 h-48 bottom-24 left-16"
            style={{ background: "radial-gradient(circle, #C4D4E8, transparent 70%)", animationDelay: "1s" }} />
          <div aria-hidden className="orb animate-float-fast w-36 h-36 top-1/2 right-4"
            style={{ background: "radial-gradient(circle, #E8D4B0, transparent 70%)", animationDelay: "0.5s" }} />

          <Link href="/" className="relative z-10 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#7BA89A] inline-block" />
            <span className="font-serif text-2xl text-[#3D5A54]">StillMind</span>
          </Link>

          <div className="relative z-10 flex flex-col gap-6">
            <h2 className="font-serif text-[2.6rem] leading-[1.15] text-[#3D5A54]">
              Your campus<br />has a quiet<br />corner.
            </h2>
            <p className="font-sans font-light text-[#3D5A54]/60 leading-relaxed max-w-xs">
              Mental health support that prioritises fairly, moves quickly, and always keeps a counsellor in the loop.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            {["Explainable", "Human-in-the-loop", "Privacy-first"].map((tag) => (
              <span key={tag} className="font-sans text-xs font-light text-[#3D5A54]/40">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
            <span className="w-7 h-7 rounded-full bg-[#7BA89A] inline-block" />
            <span className="font-serif text-xl text-[#3D5A54]">StillMind</span>
          </Link>

          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </>
  );
}
