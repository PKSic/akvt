<?php
if (!defined('ABSPATH')) exit;

$file_url = get_post_meta(get_the_ID(), '_akvt_doc_file_url', true);
$date     = get_post_meta(get_the_ID(), '_akvt_doc_date', true);
$has_sig  = get_post_meta(get_the_ID(), '_akvt_doc_has_sig', true);
$sig_file = get_post_meta(get_the_ID(), '_akvt_doc_sig_file', true);
$signer   = get_post_meta(get_the_ID(), '_akvt_doc_signer', true);
?>
<tr class="akvt-doc-row">
  <td class="akvt-doc-title">
    <a href="<?php echo esc_url($file_url ?: '#'); ?>" target="_blank" rel="noopener">
      <?php the_title(); ?>
    </a>
    <?php if ($has_sig === '1'): ?>
      <span class="akvt-sig-badge" title="<?php echo esc_attr('Подписано ЭЦП: ' . $signer); ?>" style="display:inline-block; font-size:11px; background:#e8edfb; color:#1e3f9e; padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">
        ✓ ЭЦП
      </span>
      <?php if (!empty($sig_file)): ?>
        <a href="<?php echo esc_url($sig_file); ?>" download title="Скачать открепленную подпись (.sig)" style="font-size:11px; color:var(--muted); margin-left:4px;">[.sig]</a>
      <?php endif; ?>
    <?php endif; ?>
    <?php if (!empty($date)): ?>
      <div style="font-size:0.8rem; color:var(--muted); margin-top:2px;">
        Дата: <?php echo esc_html(date_i18n('d.m.Y', strtotime($date))); ?>
      </div>
    <?php endif; ?>
  </td>
  <td style="width: 50px; text-align:center;">
    <a href="<?php echo esc_url($file_url ?: '#'); ?>" target="_blank" rel="noopener" aria-label="Скачать документ">
      <span class="dashicons dashicons-pdf" style="font-size:28px; width:28px; height:28px; color:#e11d48;"></span>
    </a>
  </td>
</tr>
