export type AtlasLocale = 'en' | 'vi';

/** Discovery return links must stay on this origin, including after URL normalization. */
export function discoveryReturn(value: string | null, locale: AtlasLocale, origin: string): string {
  const fallback = `/${locale}/${locale==='vi'?'kham-pha':'discovery'}`;
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const url = new URL(value, origin);
    const discoveryPath = /^\/(?:en(?:\/stores\/[a-z0-9-]+|\/discovery)?|vi(?:\/cua-hang\/[a-z0-9-]+|\/kham-pha)?)\/?$/i;
    if (url.origin !== origin || !discoveryPath.test(url.pathname) || (url.searchParams.get('view') !== 'discovery' && !/\/(discovery|kham-pha)\/?$/.test(url.pathname))) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}

// Translations preserve the bounded plan instructions; they add no route edges.
export const planInstructionVi: Record<string, string> = {
  'From the public aisle in front of MLB, follow the marked aisle toward the central atrium and Zone A lifts. Stay outside the emergency/service rectangle.': 'Từ lối đi chung trước MLB, theo lối được đánh dấu về phía giếng trời trung tâm và thang máy Zone A. Đi bên ngoài khu kỹ thuật/thoát hiểm hình chữ nhật.',
  'At Zone A, check that the lift serves L2. Take it to L2; if unavailable, ask mall staff. This transfer is paired from the named areas on the plans.': 'Tại Zone A, kiểm tra thang máy có phục vụ L2. Đi đến L2; nếu không sử dụng được, hãy hỏi nhân viên. Kết nối này được đối chiếu theo các khu có tên trên sơ đồ.',
  'After reaching L2, use the public concourse beside Zone A. Follow the marked bend past Weekend by Max Mara and around LYN.': 'Sau khi đến L2, theo lối đi chung cạnh Zone A. Theo đoạn rẽ được đánh dấu qua Weekend by Max Mara và vòng quanh LYN.',
  'Continue along the outer shopping aisle past ALDO, Pedro and Armani Exchange toward CALVIN KLEIN.': 'Tiếp tục theo lối mua sắm phía ngoài, qua ALDO, Pedro và Armani Exchange về phía CALVIN KLEIN.',
  'Stop at the CALVIN KLEIN area frontage. The map does not identify an exact doorway.': 'Dừng trước khu CALVIN KLEIN. Sơ đồ không xác định chính xác cửa ra vào.',
  'Start in the public aisle beside CALVIN KLEIN. Follow the marked outer shopping aisle past Armani Exchange, Pedro and ALDO.': 'Bắt đầu tại lối đi chung cạnh CALVIN KLEIN. Theo lối mua sắm phía ngoài được đánh dấu, qua Armani Exchange, Pedro và ALDO.',
  'Follow the bend around LYN, then continue along the public concourse in front of Weekend by Max Mara toward Zone A.': 'Theo đoạn rẽ vòng quanh LYN, rồi tiếp tục theo lối đi chung trước Weekend by Max Mara về phía Zone A.',
  'Reach the public landing beside the Zone A lifts. Stay in the concourse outside the marked service areas.': 'Đến sảnh chung cạnh thang máy Zone A. Đi trong lối chung, bên ngoài các khu kỹ thuật được đánh dấu.',
  'Check that the Zone A lift serves L3, then take it to L3. If unavailable, ask mall staff. This transfer is paired from the named areas on the plans.': 'Kiểm tra thang máy Zone A có phục vụ L3, rồi đi đến L3. Nếu không sử dụng được, hãy hỏi nhân viên. Kết nối này được đối chiếu theo các khu có tên trên sơ đồ.',
  'After reaching L3, follow the marked public aisle around the service rectangle beside Zone A, toward MLB.': 'Sau khi đến L3, theo lối đi chung được đánh dấu vòng quanh khu kỹ thuật hình chữ nhật cạnh Zone A, về phía MLB.',
  'Stop at the MLB area frontage. The map does not identify an exact doorway.': 'Dừng trước khu MLB. Sơ đồ không xác định chính xác cửa ra vào.',
};
