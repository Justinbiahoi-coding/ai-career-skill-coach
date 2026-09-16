import { Globe, Cpu, Mic, Flame, Shield, Sparkles, Volume2 } from "lucide-react";

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border/60 bg-muted/20 py-28 md:py-36 lg:py-44">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-extrabold tracking-widest text-primary uppercase">
            Công nghệ đột phá
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Được xây dựng cho tốc độ, độ chính xác &amp; trải nghiệm mượt mà
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Sự kết hợp giữa công nghệ thu thập dữ liệu thời gian thực, mô hình AI tiên tiến và giao diện
            phản hồi tức thì giúp bạn sẵn sàng cho thị trường lao động thời đại AI.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-3">
          {/* Bento Card 1: Multi-source Scraping (Spans 2 columns on tablet/desktop) */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xs transition-all duration-300 hover:shadow-xl md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <Globe className="size-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                  <Shield className="size-3.5" />
                  SSRF Protected
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-foreground">
                Thu thập việc làm thời gian thực đa nguồn
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-muted-foreground max-w-2xl">
                Tích hợp crawler trực tiếp từ <strong>VietnamWorks, ITviec, TopDev, CareerLink</strong> và{" "}
                <strong>RemoteOK</strong>. Hệ thống hỗ trợ tìm kiếm không dấu (như gõ <code>ke toan</code> tìm{" "}
                <em>Kế toán</em>) và tự động lọc mã độc với cơ chế xác thực host nghiêm ngặt.
              </p>
            </div>

            {/* Simulated Live Portal Tags */}
            <div className="mt-8 flex flex-wrap gap-2.5 pt-6 border-t border-border/60">
              {["ITviec Live", "VietnamWorks", "TopDev", "CareerLink", "RemoteOK (Global)"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-4 py-1.5 text-xs sm:text-sm font-semibold text-foreground/80 border border-border/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Card 2: Voice AI Mock Interviewer */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xs transition-all duration-300 hover:shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600">
                  <Mic className="size-6" />
                </span>
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600">
                  en-US Engine
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-foreground">
                Phỏng vấn thoại rảnh tay
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
                Câu hỏi được đọc to tự động, micro kích hoạt ngay lập tức. Bạn trả lời bằng giọng nói và chỉ cần
                nói <em>&quot;I&apos;m done&quot;</em> để gửi bài.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-purple-500/5 p-4 border border-purple-200/50 text-xs sm:text-sm font-semibold text-purple-700">
              <Volume2 className="size-5 shrink-0" />
              <span>Phản xạ phỏng vấn như nói chuyện với người thật.</span>
            </div>
          </div>

          {/* Bento Card 3: Gemini 3.6 Flash JSON Engine */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xs transition-all duration-300 hover:shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <Cpu className="size-6" />
                </span>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
                  Gemini 3.6 Flash
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-foreground">
                Trích xuất kỹ năng chuẩn cấu trúc
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
                Ứng dụng schema JSON nghiêm ngặt để phân định chính xác Hard Skill và Soft Skill, đánh giá mức độ
                ưu tiên và tạo bài giảng cá nhân hóa dưới 3 giây.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-muted/60 p-4 font-mono text-xs text-muted-foreground border border-border/60">
              <code>{`{ "skills": ["FastAPI", "Postgres"], "priority": "System Design" }`}</code>
            </div>
          </div>

          {/* Bento Card 4: Gamification Duolingo Experience (Spans 2 columns on tablet/desktop) */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xs transition-all duration-300 hover:shadow-xl md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Flame className="size-6" />
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                  Gamified Learning
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-foreground">
                Học kỹ năng hào hứng như chơi game
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-muted-foreground max-w-2xl">
                Mỗi bài tập hoàn thành mang lại điểm kinh nghiệm XP, duy trì chuỗi ngày học liên tục (Streak),
                và mở khóa cấp độ phỏng vấn nâng cao. Không còn cảm giác chán nản khi tự học một mình.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 pt-6 border-t border-border/60 text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-2 text-amber-500">
                <Flame className="size-4.5" /> Streak Tracker
              </span>
              <span className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4.5" /> Instant XP Rewards
              </span>
              <span className="flex items-center gap-2 text-emerald-600">
                <Shield className="size-4.5" /> Skill Mastery Badge
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
