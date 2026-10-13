import type { Locale } from '../runtime/scene-contract';
export const copy = {
  vi: {
    guide: 'Hướng dẫn tham quan', floors: 'Các tầng mua sắm', map: 'Sơ đồ tầng', exterior: 'Ngoại cảnh', overview: 'Tổng quan tầng', discovery: 'Khám phá',
    uncertainty: 'Sơ đồ tham khảo; hình học và độ cao ước tính, chưa xác minh tại hiện trường. Tên trên ảnh tham khảo không phải danh bạ cửa hàng hiện tại.',
    unavailableGeometry: 'Hình học sơ đồ chưa có trong phiên bản này. Các liên kết tầng vẫn sử dụng được.',
    directory: 'Danh bạ cửa hàng đã duyệt chưa có. Hãy dùng sơ đồ tham khảo để định hướng; thông tin cửa hàng cần được xác minh.',
    discoveryPending: 'Danh mục và bộ sưu tập được duyệt chưa có. Chế độ này hiện chỉ cung cấp sơ đồ tham khảo.',
    preparing: 'Đang chuẩn bị toàn bộ chi tiết 3D…', wait: 'Vui lòng chờ. Mục tiêu tải không phải giới hạn chờ.',
    decoding: 'Đang dựng toàn bộ hình học và vật liệu…', gpu: 'Đang chuẩn bị kết cấu và khung hình hoàn chỉnh…',
    error: 'Không thể chuẩn bị 3D. Bạn vẫn có thể dùng hướng dẫn và ảnh tham khảo bên dưới.',
    retry: 'Thử lại 3D', pause: 'Tạm dừng xoay', resume: 'Tiếp tục xoay', preview: 'Ảnh sơ đồ tham khảo',
    heading: 'Tầng', missing: 'Không tìm thấy trang', home: 'Về hướng dẫn', skip: 'Đến các tầng',
  },
  en: {
    guide: 'Visitor guide', floors: 'Shopping levels', map: 'Floor map', exterior: 'Exterior', overview: 'Floor overview', discovery: 'Discovery',
    uncertainty: 'Reference diagram; estimated geometry and heights, not surveyed or registered. Names in reference images are not an approved current directory.',
    unavailableGeometry: 'Floor geometry is unavailable in this revision. Floor links remain usable.',
    directory: 'No approved current store directory is available. Use the reference maps for orientation; store information still needs verification.',
    discoveryPending: 'Approved categories and Highlights are unavailable. This view currently supplies a reference floor diagram.',
    preparing: 'Preparing complete 3D detail…', wait: 'Please wait. The loading goal is not a timeout.',
    decoding: 'Building complete geometry and materials…', gpu: 'Preparing textures and a complete rendered frame…',
    error: '3D could not be prepared. The guide and static previews below remain usable.',
    retry: 'Retry 3D', pause: 'Pause rotation', resume: 'Resume rotation', preview: 'Reference floor preview',
    heading: 'Level', missing: 'Page not found', home: 'Open the guide', skip: 'Explore shopping levels',
  },
} satisfies Record<Locale, Record<string, string>>;
