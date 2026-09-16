import { Award } from "lucide-react";

export function LandingTeam() {
  const members = [
    {
      name: "Liang Rong Xuan",
      role: "Fullstack & AI Engineering",
      country: "Singapore",
      flag: "🇸🇬",
    },
    {
      name: "Bùi Văn Thiện",
      role: "Product Strategy & Lead Developer",
      country: "Việt Nam",
      flag: "🇻🇳",
    },
    {
      name: "Nguyễn Gia Phát",
      role: "Frontend & Voice UX Specialist",
      country: "Việt Nam",
      flag: "🇻🇳",
    },
    {
      name: "Nguyễn Minh Quang",
      role: "Data Scraping & AI Logic Pipelines",
      country: "Việt Nam",
      flag: "🇻🇳",
    },
    {
      name: "Phan Trần Hoàng Trân",
      role: "UI/UX Research & Design Systems",
      country: "Việt Nam",
      flag: "🇻🇳",
    },
  ];

  return (
    <section id="team" className="py-28 md:py-36 lg:py-44 border-t border-border/60">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-extrabold tracking-widest text-primary uppercase">
            Về đội ngũ tác giả
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Team 15 · Global Hackathon 2026
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Dự án được xây dựng bởi đội thi đa quốc gia (Việt Nam &amp; Singapore) trong khuôn khổ cuộc thi
            FPT Global Hackathon 2026 với chủ đề &quot;The New Era of Education: Driving the Future Learning With AI&quot;.
          </p>
        </div>

        {/* Mentors Badge Card */}
        <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center shadow-xs">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Award className="size-4.5" />
            <span>Đội ngũ Cố vấn (Mentors Lab)</span>
          </div>
          <p className="mt-2 text-base font-bold text-foreground">
            Hồ Quốc Đạt · Nguyễn Quốc An
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Business &amp; Technical Mentors hỗ trợ định hình kiến trúc sản phẩm
          </p>
        </div>

        {/* Member Cards Grid */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {members.map((member) => (
            <div
              key={member.name}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 text-center shadow-xs transition-all hover:-translate-y-1.5 hover:shadow-lg"
            >
              <div>
                {/* Avatar Fallback Circle */}
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted border border-border text-xl font-black text-foreground">
                  {member.name
                    .split(" ")
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")}
                </div>

                <h3 className="mt-5 text-base font-bold text-foreground line-clamp-1">{member.name}</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-snug">{member.role}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="text-base">{member.flag}</span>
                <span>{member.country}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
