export default function EmptyNotifications() {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        🔔
      </span>

      <h3>صندوق اعلانات خالی است</h3>
      <p>در حال حاضر هیچ اعلانی برای نمایش وجود ندارد.</p>
    </div>
  );
}