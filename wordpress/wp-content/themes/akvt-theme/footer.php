<?php
if (!defined('ABSPATH')) exit;

$phone         = function_exists('akvt_get_option') ? akvt_get_option('contact_phone', '54-08-35') : '54-08-35';
$admissions    = function_exists('akvt_get_option') ? akvt_get_option('contact_admissions', '54-08-35') : '54-08-35';
$email         = function_exists('akvt_get_option') ? akvt_get_option('contact_email', 'akvt@astrobl.ru') : 'akvt@astrobl.ru';
$address       = function_exists('akvt_get_option') ? akvt_get_option('contact_address', 'г. Астрахань, пер. Смоляной, д. 2') : 'г. Астрахань, пер. Смоляной, д. 2';
$hours         = function_exists('akvt_get_option') ? akvt_get_option('contact_hours', 'Пн-Пт: 8:30 - 17:00, Сб: 8:30 - 14:00') : 'Пн-Пт: 8:30 - 17:00, Сб: 8:30 - 14:00';
$vk            = function_exists('akvt_get_option') ? akvt_get_option('contact_vk', 'https://vk.com/akvt_ru') : 'https://vk.com/akvt_ru';
$tg            = function_exists('akvt_get_option') ? akvt_get_option('contact_telegram', 'https://t.me/akvt_official') : 'https://t.me/akvt_official';
$copyright     = function_exists('akvt_get_option') ? akvt_get_option('footer_copyright', '© 2026 ГБПОУ АО «Астраханский колледж вычислительной техники».') : '© 2026 ГБПОУ АО «Астраханский колледж вычислительной техники».';
$anti_corrupt  = function_exists('akvt_get_option') ? akvt_get_option('footer_anti_corrupt', '54-08-35') : '54-08-35';
?>
</main><!-- #main-content -->

<footer id="colophon" role="contentinfo">
  <!-- Верхняя полоса подвала: контакты и соцсети -->
  <div id="footer-top">
    <div class="wrap footer-compact">
      <span>Приёмная: <a href="tel:+78512<?php echo esc_attr(preg_replace('/\D/', '', $phone)); ?>">+7 (8512) <?php echo esc_html($phone); ?></a></span>
      <span class="sep">·</span>
      <span>Приёмная комиссия: <a href="tel:+78512<?php echo esc_attr(preg_replace('/\D/', '', $admissions)); ?>">+7 (8512) <?php echo esc_html($admissions); ?></a></span>
      <span class="sep">·</span>
      <span><a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></span>
      <span class="sep">·</span>
      <span><?php echo esc_html($address); ?></span>
      <span class="sep">·</span>
      <span><?php echo esc_html($hours); ?></span>
      <?php if (!empty($vk)): ?>
        <span class="sep">·</span>
        <span><a href="<?php echo esc_url($vk); ?>" target="_blank" rel="noopener">ВКонтакте</a></span>
      <?php endif; ?>
      <?php if (!empty($tg)): ?>
        <span class="sep">·</span>
        <span><a href="<?php echo esc_url($tg); ?>" target="_blank" rel="noopener">Telegram</a></span>
      <?php endif; ?>
    </div>
  </div>

  <!-- Нижний блок подвала -->
  <div class="wrap site-info">
    <div class="footer-links">
      <a href="<?php echo esc_url(home_url('/postupayushhim/')); ?>">Поступающим</a>
      <a href="<?php echo esc_url(home_url('/students/')); ?>">Студентам</a>
      <a href="<?php echo esc_url(home_url('/teachers/')); ?>">Преподавателям</a>
      <a href="<?php echo esc_url(home_url('/parents/')); ?>">Родителям</a>
      <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/')); ?>">Сведения об организации</a>
      <a href="<?php echo esc_url(home_url('/dokumenty/')); ?>">Документы</a>
      <a href="<?php echo esc_url(home_url('/shema-proezda/')); ?>">Схема проезда</a>
      <a href="http://sdo2.akvt.ru" target="_blank" rel="noopener">Образовательный портал</a>
    </div>

    <div class="footer-bottom" style="margin-top: 14px; font-size: 0.82rem; color: var(--muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
      <div><?php echo esc_html($copyright); ?></div>
      <?php if (!empty($anti_corrupt)): ?>
        <div>Горячая линия противодействия коррупции: <strong><?php echo esc_html($anti_corrupt); ?></strong></div>
      <?php endif; ?>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
