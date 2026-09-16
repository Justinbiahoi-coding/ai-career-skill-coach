import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, PlayCircle, Mic, ShieldCheck } from "lucide-react";
import { Mascot } from "@/components/mascot";

export function LandingHero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-16 pb-28 md:pt-24 md:pb-36 lg:pt-28 lg:pb-44">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-52 right-[8%] size-80 rounded-full bg-accent/40 blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-8 shadow-xs">
              <Sparkles className="size-3.5" />
              <span>Global Hackathon 2026 · Team 15 · Track 1</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08]">
              Tìm khoảng trống kỹ năng &amp;{" "}
              <span className="text-primary underline decoration-primary/30 underline-offset-8">
                phỏng vấn thử giọng nói
              </span>{" "}
              cùng AI.
            </h1>

            {/* Supporting Tagline */}
            <p className="mt-8 max-w-xl text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground">
              Không chỉ là lý thuyết suông. Quét tin tuyển dụng thật từ{" "}
              <strong className="text-foreground font-semibold">VietnamWorks, ITviec, TopDev</strong>,
              tìm kỹ năng bạn còn thiếu, thực hành vi mô 5 phút và luyện phản xạ giọng nói bằng tiếng Anh.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <Link
                href="/home"
                className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>Bắt đầu trải nghiệm ngay</span>
                <ArrowRight className="size-4.5" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background/80 px-7 py-4 text-base font-bold text-foreground transition-colors hover:bg-muted"
              >
                <PlayCircle className="size-4.5 text-primary" />
                <span>Xem quy trình 5 bước</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-border/60 pt-8 text-sm text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4.5 text-primary" />
                <span>Không cần tài khoản ban đầu</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4.5 text-primary" />
                <span>Dữ liệu việc làm thực tế 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Mic className="size-4.5 text-primary" />
                <span>Luyện nói tiếng Anh rảnh tay</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Job Buddy Preview Card */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7 sm:p-8 shadow-2xl clay-press">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between pb-5 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="size-3.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-foreground">AI Career Coach Live</span>
                </div>
                <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-extrabold text-foreground">
                  Streak: 5 Days 🔥
                </span>
              </div>

              {/* Central Mascot Illustration */}
              <div className="relative my-8 flex justify-center items-center py-6">
                <Mascot mood="happy" size="xl" priority decorative className="drop-shadow-lg" />

                {/* Floating Skill Badge 1 (Top Left) */}
                <div className="absolute -top-4 -left-4 animate-float rounded-2xl border border-border bg-background p-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                      ★
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-extrabold text-muted-foreground">Phát hiện Gap</p>
                      <p className="text-sm font-bold text-foreground">System Design</p>
                    </div>
                  </div>
                </div>

                {/* Floating Skill Badge 2 (Bottom Right) */}
                <div className="absolute -bottom-3 -right-4 rounded-2xl border border-border bg-background p-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mic className="size-4" />
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-extrabold text-muted-foreground">Voice Mock Turn</p>
                      <p className="text-sm font-bold text-foreground">Score: 9.2/10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Mini Mock Audio Wave & Action */}
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                  <span className="text-muted-foreground">Mô phỏng Phỏng vấn thoại</span>
                  <span className="text-primary">Hands-free</span>
                </div>
                <div className="flex items-center gap-1.5 h-8 justify-center">
                  {[40, 75, 55, 95, 60, 85, 45, 90, 70, 50, 80, 40, 65, 85].map((height, i) => (
                    <span
                      key={i}
                      style={{ height: `${height}%` }}
                      className="w-1.5 rounded-full bg-primary/70 transition-all duration-300"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
