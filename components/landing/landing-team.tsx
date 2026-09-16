"use client";

import { motion } from "motion/react";

export function LandingTeam() {
  const members = [
    {
      name: "Bui Van Thien",
      role: "Team Lead",
      tagColor: "bg-sunburst text-carbon",
      avatarBg: "bg-sky-wash",
      initials: "BT",
    },
    {
      name: "Neo Rong Xuan",
      role: "Team Member",
      tagColor: "bg-lavender text-carbon",
      avatarBg: "bg-mint-pop",
      initials: "NX",
    },
    {
      name: "Nguyen Thi Thanh Nhan",
      role: "Team Member",
      tagColor: "bg-mint-pop text-carbon",
      avatarBg: "bg-lavender",
      initials: "TN",
    },
    {
      name: "Nguyen Phuc Phi",
      role: "Team Member",
      tagColor: "bg-voltage-violet text-paper-white",
      avatarBg: "bg-sunburst",
      initials: "PP",
    },
    {
      name: "Karis Huang",
      role: "Team Member",
      tagColor: "bg-sky-wash text-carbon",
      avatarBg: "bg-voltage-violet",
      initials: "KH",
    },
  ];

  return (
    <section id="team" className="w-full bg-paper-white border-b border-carbon py-24 md:py-32 select-none">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-mint-pop px-4 py-1 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
            GLOBAL HACKATHON 2026
          </div>
          <h2 className="font-lateral text-[clamp(40px,7vw,96px)] font-extrabold uppercase leading-[0.92] tracking-normal text-carbon">
            MEET THE TEAM
          </h2>
          <p className="mt-6 max-w-2xl mx-auto font-aeonik text-base sm:text-xl font-medium leading-[1.3] text-carbon/80">
            Crafted by Team 24 for Global Hackathon 2026 — Empowering students to bridge skill gaps and master interviews.
          </p>
        </motion.div>

        {/* Team Grid with Staggered Scroll-Triggered Entrance */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{
                duration: 0.45,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col justify-between rounded-[24px] border border-carbon bg-paper-white p-7 text-carbon transition-colors hover:bg-soft-mist cursor-default"
            >
              <div>
                {/* Circular Hand-cut Avatar with Spring Hover */}
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`flex size-14 items-center justify-center rounded-full border border-carbon ${member.avatarBg} font-lateral text-xl font-extrabold text-carbon`}
                >
                  {member.initials}
                </motion.div>

                <div className="mt-6">
                  <span
                    className={`inline-block rounded-full border border-carbon px-3 py-0.5 text-[11px] font-bold tracking-[0.032em] ${member.tagColor}`}
                  >
                    {member.role}
                  </span>
                  <h3 className="mt-3 text-xl font-extrabold tracking-tight text-carbon">
                    {member.name}
                  </h3>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-carbon/20 text-[11px] font-bold tracking-[0.032em] text-carbon/60">
                Team 24 Member
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
