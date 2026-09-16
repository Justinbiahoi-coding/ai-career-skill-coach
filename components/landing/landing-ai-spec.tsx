import { ShieldCheck, UserCheck, Eye, Lock } from "lucide-react";

export function LandingAiSpec() {
  const principles = [
    {
      title: "Build What You Can Explain",
      description: "Mọi luồng xử lý prompt, trích xuất kỹ năng và thuật toán chấm điểm đều minh bạch, có thể giải thích được mà không phụ thuộc vào hộp đen.",
      icon: Eye,
    },
    {
      title: "Human in the Loop",
      description: "AI chỉ đóng vai trò gợi ý và đồng hành. Sinh viên luôn có quyền tự đánh giá lại mức độ tự tin và ghi đè lựa chọn kỹ năng ưu tiên.",
      icon: UserCheck,
    },
    {
      title: "Bảo Vệ Quyền Riêng Tư & An Toàn",
      description: "Không lưu trữ PII hay dữ liệu nhạy cảm. Hệ thống proxy ngăn chặn triệt để tấn công SSRF khi người dùng cào dữ liệu từ các đường dẫn tuyển dụng.",
      icon: Lock,
    },
    {
      title: "Chống Ảo Giác & Bịa Đặt Dữ Liệu",
      description: "Sử dụng JSON schema nghiêm ngặt trên model Gemini 3.6 Flash để đảm bảo câu trả lời luôn bám sát ngữ cảnh thực tế của JD.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="ai-spec" className="py-28 md:py-36 lg:py-44 bg-zinc-950 text-zinc-50 relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/20 px-4 py-1.5 text-xs font-bold text-primary-foreground uppercase tracking-widest">
            Responsible AI Architecture
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white">
            Kiến trúc AI có trách nhiệm &amp; Minh bạch
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-400">
            Tuân thủ nghiêm ngặt 6 quy tắc Responsible AI được quy định tại Global Hackathon 2026:
            đặt sự an toàn, bảo mật và quyền kiểm soát của sinh viên lên hàng đầu.
          </p>
        </div>

        {/* AI Logic Flow Diagram */}
        <div className="mt-16 sm:mt-20 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 sm:p-10 backdrop-blur-sm shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 text-center mb-8">
            Mô hình luồng dữ liệu 5 tầng (AI Logic Flow)
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-center">
            {/* Stage 1 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <span className="text-[11px] font-bold text-primary uppercase">Bước 1</span>
              <p className="mt-1.5 text-base font-bold text-white">User Input</p>
              <p className="mt-1 text-xs text-zinc-400">Từ khóa việc làm / Link JD</p>
            </div>

            {/* Stage 2 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <span className="text-[11px] font-bold text-blue-400 uppercase">Bước 2</span>
              <p className="mt-1.5 text-base font-bold text-white">Data &amp; Context</p>
              <p className="mt-1 text-xs text-zinc-400">Nội dung JD bóc tách sạch</p>
            </div>

            {/* Stage 3 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <span className="text-[11px] font-bold text-purple-400 uppercase">Bước 3</span>
              <p className="mt-1.5 text-base font-bold text-white">Gemini Flash</p>
              <p className="mt-1 text-xs text-zinc-400">JSON Schema Prompt</p>
            </div>

            {/* Stage 4 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <span className="text-[11px] font-bold text-amber-400 uppercase">Bước 4</span>
              <p className="mt-1.5 text-base font-bold text-white">AI Output</p>
              <p className="mt-1 text-xs text-zinc-400">Kỹ năng, bài tập &amp; phỏng vấn</p>
            </div>

            {/* Stage 5 */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center ring-1 ring-emerald-500/30">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Bước 5</span>
              <p className="mt-1.5 text-base font-bold text-emerald-300">Human Review</p>
              <p className="mt-1 text-xs text-emerald-200/80">Sinh viên kiểm tra &amp; quyết định</p>
            </div>
          </div>
        </div>

        {/* 4 Core Principles Cards */}
        <div className="mt-12 sm:mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 transition-colors hover:border-zinc-700"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30">
                  <Icon className="size-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-zinc-400">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
