import { MAX_JD_LENGTH } from "./prompts";
import type { JobListing, JobSource } from "./types";

// Dùng chung đúng một hằng số với các API route nhận jdText — cắt dài hơn mức
// route chấp nhận là JD bị trả lỗi 400 ngay giữa luồng.
const MAX_JD_CHARS = MAX_JD_LENGTH;
const FETCH_TIMEOUT_MS = 8000;
const MAX_PER_SOURCE = 6;

// Các trang tuyển dụng chặn request không có User-Agent trông giống trình
// duyệt thật. Đây là header công khai, không phải cách né bảo mật.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Chỉ 2 trang này cần tải thêm trang chi tiết để lấy JD, nên cũng chỉ 2 tên
// miền này được phép. Route /api/jobs/jd nhận URL từ client rồi tự đi fetch,
// nếu không khoá danh sách thì thành lỗ hổng SSRF (client ép server gọi vào
// địa chỉ nội bộ). So khớp hostname chính xác, không dùng includes().
const JD_FETCH_ALLOWED_HOSTS = new Set(["itviec.com", "www.topcv.vn"]);

/**
 * URL này có được phép cho server đi tải hộ không. Dùng ở cả route (để trả mã
 * lỗi đúng) lẫn trong `fetchJobDescription` (lớp chặn thứ hai, phòng khi sau
 * này có nơi khác gọi thẳng vào hàm đó).
 */
export function isAllowedJobUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && JD_FETCH_ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

/** Bỏ thẻ HTML, gộp khoảng trắng, cắt còn tối đa `maxChars`. */
export function stripHtml(html: string, maxChars = MAX_JD_CHARS): string {
  const text = decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      // Giữ ranh giới đoạn/dòng trước khi xoá thẻ, nếu không cả JD dính thành
      // một khối chữ liền không đọc được.
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .replace(/^[ \t]+/gm, "")
    .trim();

  // Dấu … phải nằm TRONG giới hạn: /api/extract-skills từ chối jdText dài hơn
  // 3000 ký tự, nên cắt 3000 rồi thêm dấu sẽ thành 3001 và bị trả lỗi 400.
  return text.length > maxChars ? `${text.slice(0, maxChars - 1).trimEnd()}…` : text;
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": BROWSER_UA, ...init?.headers },
  });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.text();
}

function makeListing(
  source: JobSource,
  title: string,
  company: string,
  url: string,
  jdText?: string
): JobListing {
  return { id: `${source}:${url}`, source, title, company, url, jdText };
}

// --- VietnamWorks -----------------------------------------------------------
// Trang này render bằng JS nên scrape HTML sẽ ra trang trống — nhưng chính vì
// vậy nó buộc phải có API JSON công khai để trang tự gọi, và API đó trả luôn
// cả JD trong kết quả tìm kiếm (không cần tải trang chi tiết).
interface VnwJob {
  jobTitle?: string;
  companyName?: string;
  jobUrl?: string;
  jobDescription?: string;
  jobRequirement?: string;
}

async function searchVietnamWorks(query: string): Promise<JobListing[]> {
  const raw = await fetchText("https://ms.vietnamworks.com/job-search/v1.0/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      filter: [],
      ranges: [],
      order: [],
      hitsPerPage: MAX_PER_SOURCE,
      page: 0,
    }),
  });

  const parsed = JSON.parse(raw) as { data?: VnwJob[] };
  if (!Array.isArray(parsed.data)) return [];

  return parsed.data
    .filter((job) => job.jobTitle && job.companyName && job.jobUrl)
    .map((job) => {
      const jdHtml = [job.jobDescription, job.jobRequirement].filter(Boolean).join("<br>");
      return makeListing(
        "VietnamWorks",
        job.jobTitle!.trim(),
        job.companyName!.trim(),
        job.jobUrl!,
        stripHtml(jdHtml) || undefined
      );
    });
}

// --- ITviec -----------------------------------------------------------------
// Trang kết quả là HTML tĩnh: mỗi thẻ job mở đầu bằng thuộc tính data-url chứa
// link chi tiết, ngay sau đó là tiêu đề và tên công ty.
async function searchItviec(query: string): Promise<JobListing[]> {
  const html = await fetchText(`https://itviec.com/it-jobs/${encodeURIComponent(query)}`);
  const cards = html.split("data-search--job-selection-target='jobTitle'").slice(1);
  const listings: JobListing[] = [];

  for (const card of cards) {
    if (listings.length >= MAX_PER_SOURCE) break;
    const url = /data-url='([^']+)'/.exec(card)?.[1];
    const title = /<a[^>]*>([^<]+)<\/a>\s*<\/h3>/.exec(card)?.[1];
    const company = /text-hover-underline'>\s*<a[^>]*>([^<]+)<\/a>/.exec(card)?.[1];
    if (!url || !title || !company) continue;
    listings.push(
      makeListing("ITviec", decodeEntities(title).trim(), decodeEntities(company).trim(), url)
    );
  }
  return listings;
}

// --- TopCV ------------------------------------------------------------------
// Mỗi thẻ job bắt đầu bằng data-job-id; tên công ty nằm ở thuộc tính alt của
// logo, tiêu đề nằm ở aria-label của link.
async function searchTopCv(query: string): Promise<JobListing[]> {
  const html = await fetchText(`https://www.topcv.vn/tim-viec-lam-${encodeURIComponent(query)}`);
  const cards = html.split('data-job-id="').slice(1);
  const listings: JobListing[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    if (listings.length >= MAX_PER_SOURCE) break;
    const url = /href="(https:\/\/www\.topcv\.vn\/viec-lam\/[^"?]+)/.exec(card)?.[1];
    const title = /aria-label="([^"]+)"/.exec(card)?.[1];
    const company = /<img[^>]*alt="([^"]+)"/.exec(card)?.[1];
    if (!url || !title || !company || seen.has(url)) continue;
    seen.add(url);
    listings.push(
      makeListing("TopCV", decodeEntities(title).trim(), decodeEntities(company).trim(), url)
    );
  }
  return listings;
}

// --- RemoteOK ---------------------------------------------------------------
// API JSON công khai, không cần key. Phần tử đầu tiên là thông báo điều khoản
// của họ chứ không phải job, nên phải bỏ qua.
interface RemoteOkJob {
  position?: string;
  company?: string;
  url?: string;
  description?: string;
}

async function searchRemoteOk(query: string): Promise<JobListing[]> {
  const raw = await fetchText("https://remoteok.com/api");
  const parsed = JSON.parse(raw) as RemoteOkJob[];
  if (!Array.isArray(parsed)) return [];

  const needle = query.toLowerCase();
  return parsed
    .slice(1)
    .filter(
      (job) =>
        job.position &&
        job.company &&
        job.url &&
        `${job.position} ${job.company}`.toLowerCase().includes(needle)
    )
    .slice(0, MAX_PER_SOURCE)
    .map((job) =>
      makeListing(
        "RemoteOK",
        job.position!.trim(),
        job.company!.trim(),
        job.url!,
        stripHtml(job.description ?? "") || undefined
      )
    );
}

/**
 * Gọi song song cả 4 nguồn. Nguồn nào lỗi/timeout thì bị bỏ qua chứ không làm
 * hỏng cả kết quả — cùng tinh thần fallback với các route AI hiện có.
 * Kết quả được trộn xen kẽ để danh sách không bị một nguồn chiếm hết đầu trang.
 */
export async function searchAllSources(query: string): Promise<JobListing[]> {
  const settled = await Promise.allSettled([
    searchVietnamWorks(query),
    searchItviec(query),
    searchTopCv(query),
    searchRemoteOk(query),
  ]);

  const perSource = settled.map((result) => (result.status === "fulfilled" ? result.value : []));
  const interleaved: JobListing[] = [];
  const longest = Math.max(...perSource.map((list) => list.length), 0);
  for (let i = 0; i < longest; i += 1) {
    for (const list of perSource) {
      if (list[i]) interleaved.push(list[i]);
    }
  }
  return interleaved;
}

/**
 * Tải trang chi tiết của ITviec/TopCV để lấy JD. Chỉ gọi khi người dùng đã
 * chọn một job cụ thể — tải sẵn hết ~40 trang chi tiết lúc search sẽ rất chậm.
 *
 * @throws nếu hostname không nằm trong danh sách cho phép (chống SSRF).
 */
export async function fetchJobDescription(rawUrl: string): Promise<string> {
  if (!isAllowedJobUrl(rawUrl)) {
    throw new Error("Refusing to fetch job description from a non-allowlisted URL");
  }
  const url = new URL(rawUrl);
  const html = await fetchText(url.toString());

  if (url.hostname === "itviec.com") {
    const marker = html.indexOf("data-jobs--jd-scroll-target='jobContent'");
    if (marker === -1) throw new Error("ITviec job content block not found");
    // Nhảy qua phần còn lại của thẻ mở, nếu không tên thuộc tính sẽ lọt vào JD.
    const start = html.indexOf(">", marker) + 1;
    // Cắt trước khối "job liên quan" ở cuối trang để không lẫn JD của job khác.
    const rest = html.slice(start);
    const end = rest.indexOf("relative-jobs");
    return stripHtml(end === -1 ? rest : rest.slice(0, end));
  }

  const start = html.indexOf("Mô tả công việc");
  if (start === -1) throw new Error("TopCV job description block not found");
  return stripHtml(html.slice(start));
}
