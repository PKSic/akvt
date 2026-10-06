<?php
if (!defined('ABSPATH')) exit;

$code          = get_post_meta(get_the_ID(), '_akvt_spec_code', true);
$qualification = get_post_meta(get_the_ID(), '_akvt_spec_qualification', true);
$duration      = get_post_meta(get_the_ID(), '_akvt_spec_duration', true);
$budget        = get_post_meta(get_the_ID(), '_akvt_spec_budget', true);
$commercial    = get_post_meta(get_the_ID(), '_akvt_spec_commercial', true);
?>
<div class="spec-card">
  <?php if (!empty($code)): ?>
    <div class="spec-code-badge" style="display:inline-block; background:var(--accent-wash); color:var(--accent-deep); font-family:var(--font-mono); font-size:0.85rem; font-weight:700; padding:4px 10px; border-radius:6px; margin-bottom:12px;">
      <?php echo esc_html($code); ?>
    </div>
  <?php endif; ?>

  <h3 class="spec-title" style="margin: 0 0 8px 0;">
    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
  </h3>

  <?php if (!empty($qualification)): ?>
    <div style="font-weight:600; color:var(--ink-soft); margin-bottom:8px; font-size:0.92rem;">
      Квалификация: <?php echo esc_html($qualification); ?>
    </div>
  <?php endif; ?>

  <?php if (!empty($duration)): ?>
    <div style="color:var(--muted); font-size:0.88rem; margin-bottom:14px;">
      ⏱ Срок обучения: <?php echo esc_html($duration); ?>
    </div>
  <?php endif; ?>

  <div class="spec-kcp" style="display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
    <?php if ($budget !== ''): ?>
      <span style="background:#e4efe9; color:#2e5e48; font-size:0.8rem; font-weight:600; padding:3px 8px; border-radius:4px;">
        Бюджет: <?php echo esc_html($budget); ?> мест
      </span>
    <?php endif; ?>
    <?php if ($commercial !== ''): ?>
      <span style="background:#f1f5f9; color:#475569; font-size:0.8rem; font-weight:600; padding:3px 8px; border-radius:4px;">
        Коммерция: <?php echo esc_html($commercial); ?> мест
      </span>
    <?php endif; ?>
  </div>

  <a class="link-arrow" href="<?php the_permalink(); ?>">Учебный план и описание <span class="arr">→</span></a>
</div>
