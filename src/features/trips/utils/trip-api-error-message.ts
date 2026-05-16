/** Maps backend `AppError.message` codes to UI copy (Nest returns e.g. `trip_item_time_overlap`). */
export function formatTripApiUserMessage(raw: string): string {
  const code = raw.trim()
  const messages: Record<string, string> = {
    trip_item_time_overlap:
      'Không thể lưu: có hai hoạt động trong cùng một ngày bị trùng khung giờ. Hãy chỉnh lại giờ để các slot không gối nhau.',
    trip_item_date_out_of_range: 'Hoạt động nằm ngoài ngày của chuyến đi.',
    trip_item_not_found: 'Không tìm thấy hoạt động trên lịch trình.',
    resource_not_found: 'Không tìm thấy dữ liệu.',
    trip_not_found: 'Không tìm thấy chuyến đi.',
    trip_save_no_temp_slot:
      'Không thể lưu: quá nhiều hoạt động trong một ngày, không chỗ trống tạm để đổi giờ an toàn. Thử chỉnh tay hoặc tách sang ngày khác.',
  }
  return messages[code] ?? raw
}
