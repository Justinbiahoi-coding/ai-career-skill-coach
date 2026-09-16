import { AlertTriangle, CheckCircle, Target, Brain, Award, Clock } from "lucide-react";

export function LandingOverview() {
  return (
    <section id="overview" className="border-t border-border/60 bg-muted/20 py-28 md:py-36 lg:py-44">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-extrabold tracking-widest text-primary uppercase">
            Bối cảnh &amp; Nỗi đau thực tế
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Tại sao học lý thuyết thôi là chưa bao giờ đủ?
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Hầu hết các công cụ học tập dừng lại ở việc đưa ra lời khuyên. Khi bước vào phỏng vấn thực tế,
            sinh viên vẫn lúng túng vì thiếu trải nghiệm cọ xát trực tiếp với yêu cầu của nhà tuyển dụng.
          </p>
        </div>

        {/* Comparison Bento Grid (Z-Pattern) */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Traditional Way Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-destructive/20 bg-destructive/5 p-8 sm:p-10">
            <div>
              <div className="flex items-center gap-2.5 text-destructive">
                <AlertTriangle className="size-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Cách chuẩn bị truyền thống</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-foreground">
                Mông lung và thiếu áp lực thực chiến
              </h3>
              <ul className="mt-8 space-y-5 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-3.5">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold text-destructive">
                    ✕
                  </span>
                  <span>
                    <strong>Đọc JD mơ hồ:</strong> Không biết những từ khóa kỹ thuật nào là trọng yếu, những kỹ năng nào chỉ là phụ.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold text-destructive">
                    ✕
                  </span>
                  <span>
                    <strong>Khóa học dài lê thê:</strong> Tốn hàng chục giờ xem video thụ động mà không giải quyết đúng điểm yếu cấp bách.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold text-destructive">
                    ✕
                  </span>
                  <span>
                    <strong>Thiếu phản xạ nói tiếng Anh:</strong> Đông cứng khi nhà tuyển dụng hỏi xoáy vào kinh nghiệm giải quyết vấn đề.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-10 rounded-2xl border border-destructive/20 bg-background/60 p-5 text-xs sm:text-sm font-semibold text-destructive">
              Kết quả: Trượt phỏng vấn mới biết mình hổng kiến thức ở đâu.
            </div>
          </div>

          {/* Joblingo Closed Loop Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-10 shadow-lg">
            <div>
              <div className="flex items-center gap-2.5 text-primary">
                <CheckCircle className="size-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Chu trình khép kín của Joblingo</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-foreground">
                Tập trung trúng đích &amp; Luyện nói trực tiếp
              </h3>
              <ul className="mt-8 space-y-5 text-sm sm:text-base text-foreground/80">
                <li className="flex items-start gap-3.5">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    ✓
                  </span>
                  <span>
                    <strong>Bóc tách JD thật 5 giây:</strong> AI Gemini phân tích trực tiếp tin tuyển dụng, chỉ ra ngay top 5 kỹ năng cốt lõi.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    ✓
                  </span>
                  <span>
                    <strong>Micro-Lesson 5 bước:</strong> Bài học vi mô cô đọng kèm bài tập tương tác, chấm điểm phản hồi tức thì 0–10.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    ✓
                  </span>
                  <span>
                    <strong>AI Voice Interviewer:</strong> Mô phỏng phỏng vấn thoại rảnh tay chuẩn tiếng Anh, hỏi đáp phản xạ tự nhiên.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-xs sm:text-sm font-semibold text-primary">
              Kết quả: Thấy rõ điểm số sẵn sàng (Readiness Score) trước khi nộp CV thật.
            </div>
          </div>
        </div>

        {/* Supporting Stat Pills */}
        <div className="mt-14 sm:mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-xs">
            <Clock className="mx-auto size-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">5 Phút</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Thời lượng mỗi bài học</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-xs">
            <Target className="mx-auto size-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">100%</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Tin tuyển dụng thật</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-xs">
            <Brain className="mx-auto size-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">5 Bước</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Chu trình học khép kín</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-xs">
            <Award className="mx-auto size-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">en-US</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Giọng AI phỏng vấn chuẩn</p>
          </div>
        </div>
      </div>
    </section>
  );
}
