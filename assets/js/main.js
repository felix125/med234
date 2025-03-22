// 立即執行函式，確保 HTML 加載前就設定主題，避免 FOUC
(function() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
})();

// 當 DOM 加載完成後，處理按鈕邏輯
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');

  if (!themeToggle) return; // 確保按鈕存在

  // 點擊按鈕切換主題
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // 監聽系統主題變化 (只有當使用者沒手動切換時才生效)
  if (!localStorage.getItem('theme')) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  }
});
