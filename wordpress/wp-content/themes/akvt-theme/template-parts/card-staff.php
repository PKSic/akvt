<?php
if (!defined('ABSPATH')) exit;

$role      = get_post_meta(get_the_ID(), '_akvt_staff_role', true);
$phone     = get_post_meta(get_the_ID(), '_akvt_staff_phone', true);
$email     = get_post_meta(get_the_ID(), '_akvt_staff_email', true);
$education = get_post_meta(get_the_ID(), '_akvt_staff_education', true);
$hours     = get_post_meta(get_the_ID(), '_akvt_staff_hours', true);
?>
<div class="biography">
  <?php if (has_post_thumbnail()): ?>
    <?php the_post_thumbnail('akvt-square', ['alt' => get_the_title()]); ?>
  <?php else: ?>
    <div style="width:120px; height:140px; background:#e2e8f0; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
      <span class="dashicons dashicons-businessman" style="font-size:48px; width:48px; height:48px;"></span>
    </div>
  <?php endif; ?>

  <div class="b-content">
    <div class="b1"><?php the_title(); ?></div>
    <?php if (!empty($role)): ?>
      <div class="b2"><?php echo esc_html($role); ?></div>
    <?php endif; ?>
    <?php if (!empty($phone)): ?>
      <div class="b3">тел.: <?php echo esc_html($phone); ?></div>
    <?php endif; ?>
    <?php if (!empty($email)): ?>
      <div class="b4"><a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></div>
    <?php endif; ?>
    <?php if (!empty($education)): ?>
      <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;"><?php echo esc_html($education); ?></div>
    <?php endif; ?>
    <?php if (!empty($hours)): ?>
      <div style="font-size:0.82rem; color:var(--ink-soft); margin-top:4px;">Приём: <?php echo esc_html($hours); ?></div>
    <?php endif; ?>
  </div>
</div>
