<?php
if (!defined('ABSPATH')) exit;

get_header();

$code          = get_post_meta(get_the_ID(), '_akvt_spec_code', true);
$qualification = get_post_meta(get_the_ID(), '_akvt_spec_qualification', true);
$duration      = get_post_meta(get_the_ID(), '_akvt_spec_duration', true);
$budget        = get_post_meta(get_the_ID(), '_akvt_spec_budget', true);
$commercial    = get_post_meta(get_the_ID(), '_akvt_spec_commercial', true);
$cost          = get_post_meta(get_the_ID(), '_akvt_spec_cost', true);
$curriculum    = get_post_meta(get_the_ID(), '_akvt_spec_curriculum', true);
$syllabus      = get_post_meta(get_the_ID(), '_akvt_spec_syllabus', true);
?>

<div id="tape-wrap">
  <div class="wrap title">
    <?php akvt_breadcrumbs(); ?>
  </div>
</div>

<div class="wrap above">
  <div id="primary_page">
    <div id="content_page" role="main">
      <?php while (have_posts()) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
          <header class="entry-header">
            <?php if (!empty($code)): ?>
              <div style="font-family:var(--font-mono); font-size:1.1rem; font-weight:700; color:var(--accent); margin-bottom:8px;">
                КОД: <?php echo esc_html($code); ?>
              </div>
            <?php endif; ?>
            <h1 class="entry-title"><?php the_title(); ?></h1>
          </header>

          <!-- Инфокарточки параметров специальности -->
          <div class="spec-detail-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin: 24px 0; background:var(--surface); padding:20px; border-radius:12px; border:1px solid var(--line);">
            <?php if (!empty($qualification)): ?>
              <div>
                <span style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">Квалификация</span>
                <div style="font-weight:600; font-size:1rem;"><?php echo esc_html($qualification); ?></div>
              </div>
            <?php endif; ?>

            <?php if (!empty($duration)): ?>
              <div>
                <span style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">Срок обучения</span>
                <div style="font-weight:600; font-size:1rem;"><?php echo esc_html($duration); ?></div>
              </div>
            <?php endif; ?>

            <div>
              <span style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">Бюджетные места</span>
              <div style="font-weight:700; color:var(--green-deep); font-size:1.1rem;"><?php echo esc_html($budget ?: 'По запросу'); ?></div>
            </div>

            <div>
              <span style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">Платное обучение</span>
              <div style="font-weight:700; color:var(--ink-soft); font-size:1.1rem;"><?php echo esc_html($commercial ?: 'Есть'); ?></div>
            </div>
          </div>

          <!-- Документы образовательной программы -->
          <?php if (!empty($curriculum) || !empty($syllabus)): ?>
            <div style="margin: 28px 0; padding: 20px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
              <h3 style="margin-top:0;">Официальные документы программы:</h3>
              <div style="display:flex; flex-wrap:wrap; gap:12px;">
                <?php if (!empty($curriculum)): ?>
                  <a href="<?php echo esc_url($curriculum); ?>" target="_blank" rel="noopener" class="btn btn-ghost" style="font-size:0.9rem;">
                    📄 Скачать учебный план (PDF)
                  </a>
                <?php endif; ?>
                <?php if (!empty($syllabus)): ?>
                  <a href="<?php echo esc_url($syllabus); ?>" target="_blank" rel="noopener" class="btn btn-ghost" style="font-size:0.9rem;">
                    📑 Рабочая программа (PDF)
                  </a>
                <?php endif; ?>
              </div>
            </div>
          <?php endif; ?>

          <div class="entry-content">
            <?php the_content(); ?>
          </div>

          <div style="margin-top: 36px; padding: 24px; background:var(--accent-wash); border-radius:12px; text-align:center;">
            <h3 style="margin: 0 0 8px 0; color:var(--accent-deep);">Хотите поступить на данную специальность?</h3>
            <p style="margin: 0 0 16px 0; color:var(--ink-soft);">Подайте заявление в приёмную комиссию онлайн или запишитесь на консультацию.</p>
            <a href="<?php echo esc_url(home_url('/postupayushhim/priemnaya-kampaniya-2026/')); ?>" class="btn btn-primary">
              Подать заявление на поступление <span class="arr">→</span>
            </a>
          </div>
        </article>
      <?php endwhile; ?>
    </div>
  </div>

  <div id="side-navi">
    <div>
      <li class="page_item"><a href="<?php echo esc_url(home_url('/speczialnosti/')); ?>">← Все специальности</a></li>
      <li class="page_item"><a href="<?php echo esc_url(home_url('/postupayushhim/priemnaya-kampaniya-2026/')); ?>">Приёмная кампания 2026</a></li>
      <li class="page_item"><a href="<?php echo esc_url(home_url('/postupayushhim/kontrolnye-cifry-priema/')); ?>">Контрольные цифры приёма</a></li>
      <li class="page_item"><a href="<?php echo esc_url(home_url('/postupayushhim/pravila-priema/')); ?>">Правила приёма</a></li>
      <li class="page_item"><a href="<?php echo esc_url(home_url('/postupayushhim/obshhezhitie/')); ?>">Общежитие</a></li>
    </div>
  </div>
</div>

<?php
get_footer();
