"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Mascot } from "@/components/mascot";

export function LandingCtaBanner() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-28 pb-36 md:py-36 md:pb-48">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-10 sm:p-16 lg:p-20 text-center shadow-2xl">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Cheering Mascot Job Buddy */}
            <div className="mb-6">
              <Mascot mood="encourage" size="xl" decorative />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl max-w-3xl leading-[1.12]">
              Biến khoảng trống kỹ năng thành tấm vé tuyển dụng ngay hôm nay.
            </h2>

            {/* Subhead */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Trải nghiệm chu trình khép kín: Quét JD thật ➔ Đo độ tự tin ➔ Luyện tập 5 bước ➔ Phỏng vấn phản xạ giọng nói.
              Hoàn toàn miễn phí, không rào cản.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/home"
                className="inline-flex items-center gap-2.5 rounded-full bg-primary px-9 py-4.5 text-base font-bold text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                <span>Bắt đầu trải nghiệm ngay</span>
                <ArrowRight className="size-5" />
              </Link>

              {/* Placeholder Sign In button as requested */}
              <button
                type="button"
                className="cursor-pointer rounded-full border border-border bg-background px-9 py-4.5 text-base font-bold text-foreground transition-colors hover:bg-muted"
                onClick={() => alert("Chức năng Đăng nhập đang được kích hoạt...")}
              >
                Đăng nhập tài khoản
              </button>
            </div>

            {/* Quick Micro Assurance */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Không cần thẻ ngân hàng
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Tương thích mọi thiết bị
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Gemini 3.6 Flash Native
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
