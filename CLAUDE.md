# Global Hackathon 2026 — Team 15, Track 1

Bối cảnh dự án: prototype dự thi **Global Hackathon 2026** (FPT University HCMC Campus,
15–17/09/2026), chủ đề *"The New Era of Education: Driving the Future Learning With AI"*.

Nguồn tài liệu (đã gom vào `docs/`):
- `docs/Global_Hackathon_2026_GiaiThich.pdf` — Student Handbook
- `docs/Global_Hackathon_2026_ChallengeBuildPack_GiaiThich.pdf` — Challenge & Build Pack
- `docs/images/` — ảnh chụp slide **"Workshop — Build an AI Product in 48 Hours"** (guide chính
  thức của BTC, phát tại Workshop #0 ngày Kickoff), dùng case study **VIETEK BlindSpot** làm ví dụ
  minh họa xuyên suốt 5 phần: 0 Prepare → 1 Brainstorm → 2 Idea → 3 Target → 4 Prototype. Lưu ý:
  "VIETEK BlindSpot" là sản phẩm ví dụ của tài liệu hướng dẫn, KHÔNG PHẢI sản phẩm của Team 15 —
  chỉ tham khảo cách trình bày/quy trình, không copy domain/tên sản phẩm này.

## Đội của bạn

- **Team 15**, cụm 13–16, Mentor: Business/Technical Mentor — Ho Quoc Dat · Nguyen Quoc An.
- Thành viên: Liang Rong Xuan (Singapore), Nguyen Gia Phat, **Bui Van Thien**, Nguyen Minh Quang,
  Phan Tran Hoang Tran (Việt Nam).
- Mỗi đội tối đa 8 đội/track, một khi track đã xác nhận thì **không đổi được**.

## Track đã chọn: TRACK 1 — Future Skills Readiness

> **Challenge Question:** How can AI help students identify, develop, and practice the skills
> they need to be ready for the future of learning and work in the AI era?

Mọi ý tưởng, kiến trúc AI, và prototype của đội nên xoay quanh câu hỏi này: giúp sinh viên
**nhận diện** kỹ năng còn thiếu → **phát triển** kỹ năng đó → **luyện tập/thực hành** kỹ năng đó,
hướng tới sẵn sàng cho tương lai học tập & công việc thời AI.

### Context (từ Challenge Brief chính thức)

AI đang thay đổi nhanh chóng các kỹ năng cần thiết cho nghề nghiệp tương lai. Nhiều sinh viên gặp
khó khăn trong việc **nhận diện kỹ năng hiện có, khoảng trống kỹ năng (skill gap), thứ tự ưu tiên,
và lộ trình đúng để cải thiện**.

### Teams may explore (đội có thể khai thác các hướng sau)

- Skills mapping (lập bản đồ kỹ năng)
- Skill-gap analysis (phân tích khoảng trống kỹ năng)
- Personalized learning pathways (lộ trình học tập cá nhân hóa)
- Project-based practice (luyện tập qua dự án thực tế)
- Career readiness (sẵn sàng cho nghề nghiệp)
- AI-era competencies (năng lực thời đại AI)
- Learning recommendations (đề xuất học tập)

### Your solution should demonstrate (giải pháp bắt buộc phải chứng minh được)

Giải pháp phải cho thấy **AI hoặc công nghệ giúp sinh viên**:
1. Đưa ra quyết định học tập & nghề nghiệp tốt hơn (better learning and career decisions)
2. Xây dựng kỹ năng liên quan/phù hợp (build relevant skills)
3. Luyện tập kỹ năng đó một cách có ý nghĩa (practice them meaningfully) — không chỉ dừng ở lý
   thuyết/gợi ý suông, phải có cơ chế thực hành thật.

⇒ Đây chính là 3 tiêu chí tối thiểu để tự kiểm tra khi chốt ý tưởng: nếu prototype không chạm đủ
cả 3 (quyết định tốt hơn — xây kỹ năng — thực hành có ý nghĩa), cần xem lại phạm vi bài toán.

## Hành trình phát triển giải pháp (bắt buộc theo đúng thứ tự)

1. Select the track (đã xong — Track 1)
2. Define a focused problem (một vấn đề trọng tâm, không dàn trải)
3. Design an AI-enabled solution
4. Build & test a prototype

Nguyên tắc của BTC: một giải pháp tập trung, giải quyết đúng trọng tâm một vấn đề cụ thể và được
làm prototype kỹ lưỡng sẽ mạnh hơn một giải pháp ôm đồm nhiều thứ.

## Workshop Guide chính thức — "Build an AI Product in 48 Hours"

Guide 5 phần (0–4), minh họa bằng case study VIETEK BlindSpot. Đội nên áp dụng đúng quy trình và
mốc thời gian này (đã khớp với AI Logic Flow yêu cầu ở Team Build Canvas).

### Part 0 — Prepare (~2.5h, làm **trước** ngày build 48h)
Goal: setup & test xong mọi account/server/tool. Kết quả: một trang HTTPS chạy được.

- **Cần chuẩn bị:** Laptop + điện thoại thật · Google Cloud account có billing · Gemini API key
  (gọi model **Gemini 2.5 Flash-Lite**) · VM `e2-standard-2` (2 vCPU, 8GB RAM) · Domain riêng
  (~$10/năm) · Node.js 22 LTS, Git, GitHub CLI, VS Code.
- **0.1 Set up laptop** (20 phút): cài Node.js 22 LTS, Git, GitHub CLI, VS Code; code & test local,
  đẩy lên server qua GitHub.
- **0.2 Tạo Google Cloud project** (20 phút): console.cloud.google.com → New project → đặt tên
  project theo sản phẩm của đội → Billing → link thẻ + tạo budget alert nhỏ (vd: 200.000đ ≈ $8) để
  tránh phát sinh chi phí ngoài ý muốn.
- **0.3 Lấy Gemini API key** (15 phút): aistudio.google.com → Get API key → Create API key. Coi API
  key như mật khẩu (đúng nguyên tắc Data & Privacy đã nêu ở trên).
- **VM setup:** Machine type `e2-standard-2`, Boot disk Debian 13 (20GB), Firewall tick **Allow
  HTTP** và **Allow HTTPS** (cần cho SSL certificate). Sau khi Create → vào VPC network → IP
  addresses → gán **static external IP** cho VM → dùng nút **SSH** để mở terminal ngay trên browser
  (không cần cài SSH client riêng).
- **DNS:** Trỏ A record của domain đội về static IP của VM, kiểm tra bằng
  `nslookup <domain-cua-doi>` (phải trả về đúng IP đã gán).
- **0.7 Đưa trang HTTPS lên mạng** (10 phút): dùng **Caddy** làm reverse proxy/tự động HTTPS —
  sửa `sudo nano /etc/caddy/Caddyfile`, nội dung tối thiểu:
  ```
  <domain-cua-doi> {
      respond "Coming soon"
  }
  ```
  rồi `sudo systemctl reload caddy`. **Checkpoint:** điện thoại mở được `https://<domain>` và thấy
  "Coming soon" kèm icon ổ khóa (SSL) — làm bước này SỚM, trước khi có code, để phát hiện lỗi
  domain/DNS sớm (case study ghi nhận: bước này từng phát hiện ra một lỗi gõ sai domain).

### Part 1 — Brainstorm (2 giờ)
Goal: tìm một vấn đề đáng giải quyết. Kết quả: 1 ý tưởng được chọn + lý do loại 2 ý tưởng còn lại.

Nguyên tắc: **bắt đầu từ một nỗi bực bội (frustration) có thật, không bắt đầu từ công nghệ.** Một
vấn đề khiến người thật khó chịu lặp đi lặp lại là bằng chứng rẻ nhất cho thấy nó đáng giải quyết.

- **Step 1:** Viết ra 10 frustration mà bản thân/người xung quanh gặp mỗi tuần.
- **Step 2:** Chọn đúng 1 field + 1 frustration mà chính mình đã từng thấy và có thể hỏi người
  thật ngay ngày mai (không phải điều nghe kể lại).
- **Step 3:** Viết 3 ý tưởng giải quyết frustration đó theo **3 cách khác nhau thật sự** (không
  phải 3 biến thể của cùng 1 ý tưởng) — mỗi ý tưởng liệt kê: AI làm gì cụ thể + vì sao nó có thể
  thất bại (why it could fail) — ép bản thân nhìn ra điểm yếu ngay từ đầu.
- **Step 4:** Lọc bằng 3 câu hỏi yes/no, giữ lại ý tưởng có nhiều "yes" nhất:
  1. Solves the frustration? (có giải quyết đúng frustration đã chọn không)
  2. A product, not a feature? (là một sản phẩm hoàn chỉnh, không phải 1 tính năng lẻ)
  3. Buildable in 48h? (làm được thật trong 48 giờ)

### Part 3 — Target (1 giờ)
Goal: chọn một user cụ thể đến mức có thể phỏng vấn được ngay ngày mai. Kết quả: 1 câu Target +
1 bảng design rules.

- **"Everyone" không phải là target.** Một user cụ thể mới cho biết nên xây gì — quan trọng hơn,
  KHÔNG nên xây gì.
- **Step 1 — Công thức viết Target:** `[role] who [situation], using [device], with [time limit]`.
  Ví dụ mẫu: *"A workshop attendee who has a rough AI idea, using a phone, with five minutes."*
- **Step 2 — Test độ cụ thể:** tự hỏi "ngày mai mình có gặp được người này không?" — "product
  builders" → KHÔNG đạt (quá rộng); "a workshop attendee with a phone" → ĐẠT (ai trong phòng cũng
  là ứng viên).
- **Step 3 — Biến mỗi đặc điểm (trait) của user thành 1 design rule cụ thể**, ví dụ:
  | Trait | Design rule |
  |---|---|
  | Cầm điện thoại | Trang mobile-first, chạy tốt từ 375px |
  | Vào từ QR code | Không cần đăng nhập, không cần cài đặt |
  | Chỉ có 5 phút | Một trang cuộn (scroll), không menu rườm rà |
  | Bỏ đi nếu phải chờ | Trả kết quả dưới 10 giây, hiển thị từng phần ngay khi xong |
- **Step 4 — Validate:** đem đúng 1 câu mô tả sản phẩm cho 2–3 người khớp target hỏi: *"Bạn đang
  xử lý việc này thế nào?"*, *"Lần gần nhất việc này xảy ra là khi nào?"*, *"Điều gì khiến bạn
  KHÔNG dùng sản phẩm này vào ngày mai?"*
- **Responsible AI check** (áp cho phần Target): người dùng mục tiêu có đủ khả năng nhận ra một câu
  trả lời SAI của AI không? Nếu target là người mới/không chuyên, cần thiết kế thêm cảnh báo/rà
  soát rõ ràng hơn (khớp nguyên tắc **Human Review** đã nêu ở trên).

### Còn thiếu (cần đội bổ sung thêm ảnh nếu có)
Chưa có nội dung đầy đủ của **Part 2 — Idea** (đúc kết ý tưởng thành 1 câu định nghĩa sản phẩm) và
phần giữa của **Part 4 — Prototype** (44h build). Khi có thêm ảnh, cập nhật tiếp vào đây.

## Team Build Canvas (bắt buộc cập nhật liên tục)

Tài liệu làm việc duy nhất của đội, mang bản mới nhất tới mọi Mentoring Lab/Checkpoint. Hoàn
thành Canvas là điều kiện để được tham gia Mini-Pitch.

| Phần | Nội dung | Hạn |
|---|---|---|
| A — Xác định vấn đề | Problem Statement (rào cản/nỗi đau/nguyên nhân gốc rễ), Solution Idea (persona, bối cảnh, insight) | Sau Workshop #1 |
| B — Định hình giải pháp | Solution Hypothesis, Value Proposition, Core User Journey, AI Role, AI Logic Flow, link Prototype | Sau Workshop #2 |
| C — Nộp bài Mini-Pitch | Slide Pitch Deck, Demo trực tiếp (nếu có) | Trước Checkpoint #3 |

**AI Logic Flow** đội phải giải thích được:
`USER INPUT → DATA/CONTEXT → PROMPT/MODEL → AI OUTPUT → HUMAN REVIEW`

## Lịch trình chính (2026)

- **15/09 (Ngày 1 – Kickoff & Explore):** Khai mạc & công bố 3 Challenge Track, chọn track, Team
  Brainstorming, Workshop #0 (AI Product Journey), tham quan FPT Software.
- **16/09 (Ngày 2 – Design & Build):** Workshop #1 Design Thinking → Checkpoint #1 (Problem
  Statement & Solution Hypothesis); Workshop #2 AI Architecture → Build Sprint #2 → Checkpoint #2
  (AI Logic Flow) → Build Sprint #3.
- **17/09 (Ngày 3 – Test & Showcase):** Workshop #3 Pitching → Checkpoint #3 (Prototype, Pitch
  Deck, chạy thử) → **Mini-Pitch (10:00 hạn nộp) → 10:40–11:30 thi Mini-Pitch** → công bố Top 9 →
  **Demo Day (hạn nộp 13:00) → 14:35–16:35 Final Pitch & Demo** → trao giải → Gala Dinner.

Checkpoint/Mentoring Lab **không phải vòng loại** — chỉ định hướng & kiểm soát chất lượng. Vào
Final Demo do điểm Mini-Pitch quyết định.

## Thể lệ thi

- **Vòng 1 — Mini-Pitch** (24 đội → Top 9): 3 phút/đội, **không Q&A**, 3 slide (Problem & Target
  User · Solution Idea & AI Role · Prototype demo/preview tùy chọn). Top 3 mỗi track (8 đội/track)
  vào chung kết.
- **Vòng 2 — Demo Day** (Top 9 → Top 3 giải Nhất/Nhì/Ba, không tách theo track): 5 phút thuyết
  trình + demo trực tiếp, 5 phút Q&A với giám khảo. Nộp Pitch Deck + link Prototype + Validation
  Findings (nếu có).

## Tiêu chí chấm điểm cần bám sát khi build

**Mini-Pitch:** Problem Clarity & User Understanding · Creativity/Innovation & Differentiation
(không chỉ "gắn thêm AI") · AI Role & Technical Feasibility · Clarity of Presentation.

**Final Demo:** Problem Statement & Evidence · Solution & Value Proposition · AI Role & Technical
Prototype (kèm cân nhắc trách nhiệm khi dùng AI) · Validation & Implementation Pathway (có kiểm
thử người dùng thật + lặp cải tiến) · Pitching Skills & Presentation/Q&A.

⇒ Khi code prototype: ưu tiên (1) một AI logic flow rõ ràng, giải thích được, (2) một user journey
lõi chạy được thật (không chỉ mockup), (3) có vết tích kiểm thử với người dùng thật (3–5 sinh viên)
để đưa vào Validation & Implementation Pathway.

## AI Toolkit gợi ý (không bắt buộc, không chấm điểm việc chọn công cụ)

- Ideate & Research: Gemini / Google AI Studio / GenAI khác.
- Coding: Copilot, Claude Code, Gemini CLI, Cursor.
- No-code/Low-code: Replit, Lovable, Google AI Studio/Gemini.
- Pitch & Present: Canva, Google Slides.

## Quy tắc dùng AI có trách nhiệm (bắt buộc tuân thủ trong toàn bộ code & pitch)

1. **Build what you can explain** — phải hiểu và giải thích được mọi prompt, logic, code, kết quả.
2. **Data & Privacy** — chỉ dùng dữ liệu công khai/đã ẩn danh/được phép; không đưa PII, mật khẩu,
   API key, dữ liệu hạn chế vào công cụ AI.
3. **AI Disclosure** — nêu rõ đã dùng công cụ AI nào, dùng để làm gì, phần nào AI hỗ trợ đáng kể.
4. **No Fabrication** — không bịa bằng chứng, trích dẫn, phản hồi người dùng, kết quả kiểm thử,
   tính năng không thể chứng minh được.
5. **Verify Before Use** — fact → kiểm tra nguồn; code → chạy thử/kiểm thử; claim → phải chứng
   minh/truy vết được.
6. **Human Review** — duy trì rà soát của con người khi đầu ra AI ảnh hưởng đến người dùng/quyết định.

## Điều lệ chung cần nhớ

- Được phép: công cụ AI hợp pháp, mã nguồn mở, API/nền tảng phát triển, tham khảo mentor, nghiên
  cứu & kiểm thử người dùng thật.
- Không được phép: đạo văn, dùng dữ liệu trái phép/nhạy cảm, trình bày sai sự thật (fabrication),
  vi phạm sở hữu trí tuệ, gây rối/can thiệp đội khác, xâm phạm hệ thống/tài khoản người khác.
- Track đã xác nhận thì không đổi; mỗi track tối đa 8 đội.
