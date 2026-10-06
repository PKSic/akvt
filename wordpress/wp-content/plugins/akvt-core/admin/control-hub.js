/**
 * AKVT Control Hub JS — Логика модального предпросмотра
 */

function akvtOpenPreview(url) {
  var modal = document.getElementById('akvtPreviewModal');
  var frame = document.getElementById('akvtPreviewFrame');
  if (modal && frame) {
    frame.src = url;
    modal.style.display = 'flex';
  }
}

function akvtClosePreview() {
  var modal = document.getElementById('akvtPreviewModal');
  var frame = document.getElementById('akvtPreviewFrame');
  if (modal && frame) {
    modal.style.display = 'none';
    frame.src = '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var devBtns = document.querySelectorAll('.akvt-dev-btn');
  var frame = document.getElementById('akvtPreviewFrame');

  devBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      devBtns.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var w = btn.getAttribute('data-w');
      var h = btn.getAttribute('data-h');

      if (frame) {
        frame.style.width = w;
        frame.style.height = h;
      }
    });
  });

  // Закрытие по клавише Esc
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      akvtClosePreview();
    }
  });
});
