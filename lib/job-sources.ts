import { normalizeForSearch } from "./fallback-data";
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

// Ba trang này trả JD ở trang chi tiết nên phải tải thêm một lượt; cũng chỉ
// đúng ba tên miền này được phép. Route /api/jobs/jd nhận URL từ client rồi tự
// đi fetch, nếu không khoá danh sách thì thành lỗ hổng SSRF (client ép server
// gọi vào địa chỉ nội bộ). So khớp hostname chính xác, không dùng includes().
const JD_FETCH_ALLOWED_HOSTS = new Set(["itviec.com", "www.careerlink.vn", "topdev.vn"]);

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

// Chỉ những thực thể có TÊN mới cần bảng tra; dạng số (&#233; &#x1EA1;) được
// giải mã tổng quát bên dưới — và tiếng Việt chủ yếu rơi vào dạng số vì các
// chữ ă/ơ/ư cùng dấu thanh không có tên riêng trong HTML.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  bull: "•", hellip: "…", ndash: "–", mdash: "—", middot: "·",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  deg: "°", copy: "©", reg: "®", trade: "™", euro: "€", pound: "£",
  aacute: "á", agrave: "à", acirc: "â", atilde: "ã", auml: "ä",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë",
  iacute: "í", igrave: "ì", icirc: "î", iuml: "ï",
  oacute: "ó", ograve: "ò", ocirc: "ô", otilde: "õ", ouml: "ö",
  uacute: "ú", ugrave: "ù", ucirc: "û", uuml: "ü",
  yacute: "ý", ntilde: "ñ", ccedil: "ç",
  Aacute: "Á", Agrave: "À", Acirc: "Â", Atilde: "Ã",
  Eacute: "É", Egrave: "È", Ecirc: "Ê",
  Iacute: "Í", Igrave: "Ì",
  Oacute: "Ó", Ograve: "Ò", Ocirc: "Ô", Otilde: "Õ",
  Uacute: "Ú", Ugrave: "Ù", Yacute: "Ý", Ntilde: "Ñ", Ccedil: "Ç",
};

/**
 * Giải mã thực thể HTML trong MỘT lượt duy nhất. Làm nhiều lượt `.replace()`
 * nối nhau sẽ sai: đổi `&amp;` thành `&` trước sẽ biến `&amp;iacute;` thành
 * `&iacute;` rồi để nguyên đó — đúng lỗi đã gặp thật, khiến JD tiếng Việt của
 * TopDev gửi tới Gemini ở dạng "Chuy&ecirc;n vi&ecirc;n".
 */
function decodeEntities(text: string): string {
  return text.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body: string) => {
    if (body.startsWith("#")) {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body] ?? match;
  });
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

// --- CareerLink -------------------------------------------------------------
// Tham số tìm kiếm là `keyword` — biết được là nhờ chính trang khai báo
// SearchAction trong JSON-LD ("urlTemplate": ".../tim-kiem-viec-lam?keyword=").
// Đoán sai thành `searchKeyword` thì trang vẫn trả HTTP 200 nhưng là TOÀN BỘ
// hơn 32.000 job không lọc — hỏng âm thầm, không có lỗi nào báo ra.
async function searchCareerLink(query: string): Promise<JobListing[]> {
  const html = await fetchText(
    `https://www.careerlink.vn/vieclam/tim-kiem-viec-lam?keyword=${encodeURIComponent(query)}`
  );
  const cards = html.split("job-item").slice(1);
  const listings: JobListing[] = [];

  for (const card of cards) {
    if (listings.length >= MAX_PER_SOURCE) break;
    const path = /href="(\/tim-viec-lam\/[^"?]+)/.exec(card)?.[1];
    const title = /class="job-link[^"]*"\s+title="([^"]+)"/.exec(card)?.[1];
    const company = /class="text-dark job-company[^"]*"\s+title="([^"]+)"/.exec(card)?.[1];
    if (!path || !title || !company) continue;
    listings.push(
      makeListing(
        "CareerLink",
        decodeEntities(title).trim(),
        decodeEntities(company).trim(),
        `https://www.careerlink.vn${path}`
      )
    );
  }
  return listings;
}

// --- TopDev -----------------------------------------------------------------
// Trang dùng class Tailwind nên không có tên class ngữ nghĩa để bám. Neo vào
// hai class màu ổn định nhất (`text-brand-600` cho tiêu đề, `text-text-500` cho
// tên công ty) — đây là chỗ dễ vỡ nhất nếu TopDev đổi giao diện, và khi đó
// nguồn này chỉ đơn giản là không trả job chứ không làm hỏng tìm kiếm.
const TOPDEV_CARD_RE =
  /<a class="[^"]*text-brand-600[^"]*"\s+href="(\/viec-lam\/[^"?]+)[^"]*">([^<]+)<\/a>\s*<span class="[^"]*text-text-500[^"]*">([^<]+)<\/span>/g;

async function searchTopDev(query: string): Promise<JobListing[]> {
  const html = await fetchText(
    `https://topdev.vn/viec-lam/tim-kiem?keyword=${encodeURIComponent(query)}`
  );
  const listings: JobListing[] = [];
  const seen = new Set<string>();

  // TopDev không trả rỗng khi không khớp — nó rơi về danh sách job nổi bật.
  // Tìm "zzzqqqxxnothing" vẫn ra 6 job hoàn toàn lạc đề, trông như kết quả
  // thật. Lọc lại phía mình: giữ job nếu có BẤT KỲ từ nào trong truy vấn xuất
  // hiện ở tiêu đề hoặc tên công ty (bỏ dấu, bỏ từ quá ngắn để không khớp bừa).
  const terms = normalizeForSearch(query)
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  for (const match of html.matchAll(TOPDEV_CARD_RE)) {
    if (listings.length >= MAX_PER_SOURCE) break;
    const [, path, title, company] = match;
    if (seen.has(path)) continue;
    const haystack = normalizeForSearch(decodeEntities(`${title} ${company}`));
    if (terms.length > 0 && !terms.some((t) => haystack.includes(t))) continue;
    seen.add(path);
    listings.push(
      makeListing(
        "TopDev",
        decodeEntities(title).trim(),
        decodeEntities(company).trim(),
        `https://topdev.vn${path}`
      )
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
  const sources: [JobSource, Promise<JobListing[]>][] = [
    ["VietnamWorks", searchVietnamWorks(query)],
    ["ITviec", searchItviec(query)],
    ["CareerLink", searchCareerLink(query)],
    ["TopDev", searchTopDev(query)],
    ["RemoteOK", searchRemoteOk(query)],
  ];
  const settled = await Promise.allSettled(sources.map(([, promise]) => promise));

  // allSettled nuốt lỗi để một nguồn hỏng không kéo sập cả tìm kiếm — nhưng
  // nuốt im lặng thì không thể biết nguồn nào đang hỏng và vì sao. Ghi log tên
  // nguồn kèm lý do (timeout/chặn/đổi HTML) để còn lần ra được trên production.
  settled.forEach((result, i) => {
    const [name] = sources[i];
    if (result.status === "rejected") {
      console.warn(`job source "${name}" failed:`, result.reason);
    } else if (result.value.length === 0) {
      console.warn(`job source "${name}" returned no jobs for query "${query}"`);
    }
  });

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

function extractItviecJd(html: string): string {
  const marker = html.indexOf("data-jobs--jd-scroll-target='jobContent'");
  if (marker === -1) throw new Error("ITviec job content block not found");
  // Nhảy qua phần còn lại của thẻ mở, nếu không tên thuộc tính sẽ lọt vào JD.
  const start = html.indexOf(">", marker) + 1;
  // Cắt trước khối "job liên quan" ở cuối trang để không lẫn JD của job khác.
  const rest = html.slice(start);
  const end = rest.indexOf("relative-jobs");
  return stripHtml(end === -1 ? rest : rest.slice(0, end));
}

function extractCareerLinkJd(html: string): string {
  const marker = html.indexOf("job-description");
  if (marker === -1) throw new Error("CareerLink job description block not found");
  // Nhảy qua phần còn lại của thẻ mở, nếu không tên class sẽ lọt vào đầu JD.
  const start = html.indexOf(">", marker) + 1;
  return stripHtml(html.slice(start));
}

// TopDev là app Next.js: JD không nằm trong HTML thường mà trong payload của
// React, nơi các thẻ bị escape thành <p>. Phải bỏ <script> TRƯỚC khi
// giải mã (để không kéo theo mã JS), giải mã, rồi bỏ <script> lần nữa vì sau
// khi giải mã có thể lộ ra thẻ script mới.
function extractTopDevJd(html: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  const decoded = withoutScripts
    .replace(/\\u003c/gi, "<")
    .replace(/\\u003e/gi, ">")
    .replace(/\\u0026/gi, "&")
    .replace(/<script[\s\S]*?<\/script>/gi, " ");

  const blocks = decoded.match(/<p[^>]*>[\s\S]{0,3000}?<\/p>|<li[^>]*>[\s\S]{0,2000}?<\/li>/gi);
  if (!blocks || blocks.length === 0) throw new Error("TopDev job description blocks not found");
  // \r và \n trong payload còn ở dạng chuỗi escape hai ký tự, không phải xuống
  // dòng thật — đổi lại trước khi strip để JD không dính thành một khối chữ.
  const joined = blocks.join("\n").replace(/\\r/g, " ").replace(/\\n/g, "\n");
  return stripHtml(joined);
}

/**
 * Tải trang chi tiết để lấy JD. Chỉ gọi khi người dùng đã chọn một job cụ thể —
 * tải sẵn hết ~40 trang chi tiết lúc search sẽ rất chậm.
 *
 * @throws nếu hostname không nằm trong danh sách cho phép (chống SSRF).
 */
export async function fetchJobDescription(rawUrl: string): Promise<string> {
  if (!isAllowedJobUrl(rawUrl)) {
    throw new Error("Refusing to fetch job description from a non-allowlisted URL");
  }
  const url = new URL(rawUrl);
  const html = await fetchText(url.toString());

  if (url.hostname === "www.careerlink.vn") return extractCareerLinkJd(html);
  if (url.hostname === "topdev.vn") return extractTopDevJd(html);
  return extractItviecJd(html);
}
