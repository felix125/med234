document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggle.addEventListener('click', function() {
    mobileMenu.classList.toggle('hidden');
  });

  // 點擊菜單外部關閉菜單
  document.addEventListener('click', function(event) {
    if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
      mobileMenu.classList.add('hidden');
    }
  });
});
