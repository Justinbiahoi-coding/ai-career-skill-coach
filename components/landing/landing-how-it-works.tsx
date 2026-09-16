import { Search, Compass, BookOpen, Mic, CheckCircle2 } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Tìm Việc Tuyển Dụng Thật",
      description:
        "Nhập từ khóa tìm kiếm việc làm trực tiếp từ VietnamWorks, ITviec, TopDev, CareerLink hoặc dán bất kỳ mô tả công việc (JD) nào bạn đang nhắm tới.",
      tag: "Live Job Scraping",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      number: "02",
      icon: Compass,
      title: "Đo Khoảng Trống Kỹ Năng",
      description:
        "AI bóc tách 5 kỹ năng then chốt (Hard/Soft skills). Bạn tự chấm độ tự tin từ 1–5 sao. Hệ thống phân tích và xác định chính xác kỹ năng ưu tiên cần bù đắp.",
      tag: "Skill Gap Analysis",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    },
    {
      number: "03",
      icon: BookOpen,
      title: "Học Vi Mô 5 Bước",
      description:
        "Bài học 5 phút bám sát đúng ngữ cảnh công việc đã chọn. Luyện tập qua 5 câu hỏi tương tác phong cách Duolingo, chấm điểm tự động từ 0–10 kèm nhận xét cụ thể.",
      tag: "Targeted Micro-Lesson",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    },
    {
      number: "04",
      icon: Mic,
      title: "Phỏng Vấn Thoại Rảnh Tay",
      description:
        "Mô phỏng phỏng vấn thực tế: AI đọc câu hỏi bằng tiếng Anh, micro tự động kích hoạt để bạn trả lời bằng giọng nói và chỉ cần nói \"I'm done\" để hoàn thành.",
      tag: "Hands-free Voice AI",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    {
      number: "05",
      icon: CheckCircle2,
      title: "Báo Cáo Sẵn Sàng Toàn Diện",
      description:
        "Đối chiếu mức độ tự tin ban đầu với năng lực thực chiến được đo lường qua phỏng vấn. Mở khóa vòng phỏng vấn tổng hợp để đánh giá toàn diện khả năng trúng tuyển.",
      tag: "Readiness Score",
      badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200",
    },
  ];

  return (
    <section id="how-it-works" className="py-28 md:py-36 lg:py-44">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-extrabold tracking-widest text-primary uppercase">
            Chu trình 5 bước khép kín
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Từ tin tuyển dụng đến phản xạ phỏng vấn tự tin
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Quy trình được thiết kế theo đúng yêu cầu của Challenge Track 1 — Future Skills Readiness:
            Nhận diện ➔ Phát triển ➔ Thực hành có ý nghĩa.
          </p>
        </div>

        {/* 5-Step Stepper Cards */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 sm:p-9 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div>
                  {/* Step Number & Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-muted-foreground/30 group-hover:text-primary transition-colors">
                      {step.number}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${step.badgeColor}`}
                    >
                      {step.tag}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-8 flex items-center gap-3.5">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Step Flow Indicator */}
                <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Bước {step.number}/05</span>
                  <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Khám phá →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
