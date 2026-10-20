import os

kolichestvo_content = '''	<div class="entry-content">
		<p class="lead-text" style="font-size: 1.05rem; line-height: 1.6; color: var(--ink, #26251f); margin-bottom: 24px;">Сводные данные о ходе приёмной кампании в ГБПОУ АО «Астраханский колледж вычислительной техники» по всем специальностям и формам обучения на 2026/2027 учебный год.</p>

		<!-- Статистическая сводка -->
		<div class="stats-overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0 32px;">
			<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px; text-align: center;">
				<div style="font-size: 0.85rem; font-weight: 700; color: var(--muted, #7b786e); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Всего заявлений</div>
				<div style="font-size: 2.1rem; font-weight: 800; color: var(--accent, #2b59d1); line-height: 1.1;">1 748</div>
				<div style="font-size: 0.8rem; color: var(--ink-soft, #4b4941); margin-top: 4px;">по всем направлениям</div>
			</div>
			<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px; text-align: center;">
				<div style="font-size: 0.85rem; font-weight: 700; color: var(--muted, #7b786e); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Бюджет (очно)</div>
				<div style="font-size: 2.1rem; font-weight: 800; color: var(--green, #3e7a5f); line-height: 1.1;">1 408</div>
				<div style="font-size: 0.8rem; color: var(--ink-soft, #4b4941); margin-top: 4px;">на 350 мест</div>
			</div>
			<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px; text-align: center;">
				<div style="font-size: 0.85rem; font-weight: 700; color: var(--muted, #7b786e); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Средний конкурс</div>
				<div style="font-size: 2.1rem; font-weight: 800; color: var(--gold, #c2933a); line-height: 1.1;">4.02</div>
				<div style="font-size: 0.8rem; color: var(--ink-soft, #4b4941); margin-top: 4px;">чел. на бюджетное место</div>
			</div>
			<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px; text-align: center;">
				<div style="font-size: 0.85rem; font-weight: 700; color: var(--muted, #7b786e); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Договор (платно)</div>
				<div style="font-size: 2.1rem; font-weight: 800; color: var(--ink, #26251f); line-height: 1.1;">340</div>
				<div style="font-size: 0.8rem; color: var(--ink-soft, #4b4941); margin-top: 4px;">304 очно + 36 заочно</div>
			</div>
		</div>

		<!-- Таблица 1: Очная форма, бюджет -->
		<div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 32px; margin-bottom: 12px;">
			<h2 style="font-size: 1.25rem; color: var(--ink, #26251f); margin: 0;">1. Очная форма обучения — Бюджетная основа (9 классов)</h2>
			<span style="font-size: 0.85rem; font-weight: 600; color: var(--green, #3e7a5f); background: var(--green-wash, #e4efe9); padding: 4px 12px; border-radius: 999px;">Бюджет АО</span>
		</div>
		<div class="akvt-table-wrap">
			<table class="akvt-data-table">
				<thead>
					<tr>
						<th style="width: 46px; text-align: center;">№</th>
						<th style="text-align: left;">Наименование специальности</th>
						<th style="width: 140px; text-align: center;">КЦП (мест)</th>
						<th style="width: 150px; text-align: center;">Подано заявлений</th>
						<th style="width: 130px; text-align: center;">Конкурс</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">1</td>
						<td><strong>09.02.01</strong> Компьютерные системы и комплексы</td>
						<td style="text-align: center;">50</td>
						<td style="text-align: center;"><span class="akvt-num-badge">180</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">3.60</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">2</td>
						<td><strong>09.02.07</strong> Разработка и управление программным обеспечением</td>
						<td style="text-align: center;">50</td>
						<td style="text-align: center;"><span class="akvt-num-badge">224</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">4.48</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">3</td>
						<td><strong>09.02.10</strong> Веб-разработка</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">149</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">5.96</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">4</td>
						<td><strong>10.02.05</strong> Обеспечение информационной безопасности автоматизированных систем</td>
						<td style="text-align: center;">50</td>
						<td style="text-align: center;"><span class="akvt-num-badge">194</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">3.88</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">5</td>
						<td><strong>09.02.06</strong> Сетевое и системное администрирование</td>
						<td style="text-align: center;">50</td>
						<td style="text-align: center;"><span class="akvt-num-badge">215</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">4.30</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">6</td>
						<td><strong>15.02.14</strong> Автоматические системы управления</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">128</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">5.12</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">7</td>
						<td><strong>13.02.11</strong> Эксплуатация и обслуживание электрического и электромеханического оборудования</td>
						<td style="text-align: center;">50</td>
						<td style="text-align: center;"><span class="akvt-num-badge">209</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">4.18</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">8</td>
						<td><strong>25.02.08</strong> Эксплуатация беспилотных авиационных систем</td>
						<td style="text-align: center;">50</td>
						<td style="text-align: center;"><span class="akvt-num-badge">109</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">2.18</span></td>
					</tr>
				</tbody>
				<tfoot>
					<tr class="total-row">
						<td colspan="2" style="text-align: right; font-weight: 700; font-size: 0.95rem;">ИТОГО (бюджетная основа):</td>
						<td style="text-align: center; font-size: 1rem;">350</td>
						<td style="text-align: center; font-size: 1.05rem;">1 408</td>
						<td style="text-align: center; font-size: 1rem;"><span class="akvt-ratio-badge" style="background:#e8edfb; color:#2b59d1;">4.02</span></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Таблица 2: Очная форма, договор -->
		<div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 36px; margin-bottom: 12px;">
			<h2 style="font-size: 1.25rem; color: var(--ink, #26251f); margin: 0;">2. Очная форма обучения — Договорная основа (платно, 9 классов)</h2>
			<span style="font-size: 0.85rem; font-weight: 600; color: var(--accent, #2b59d1); background: #e8edfb; padding: 4px 12px; border-radius: 999px;">Платные места</span>
		</div>
		<div class="akvt-table-wrap">
			<table class="akvt-data-table">
				<thead>
					<tr>
						<th style="width: 46px; text-align: center;">№</th>
						<th style="text-align: left;">Наименование специальности</th>
						<th style="width: 140px; text-align: center;">План приёма</th>
						<th style="width: 150px; text-align: center;">Подано заявлений</th>
						<th style="width: 130px; text-align: center;">Конкурс</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">1</td>
						<td><strong>09.02.01</strong> Компьютерные системы и комплексы</td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center;"><span class="akvt-num-badge">18</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">1.80</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">2</td>
						<td><strong>09.02.07</strong> Разработка и управление программным обеспечением</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">72</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">2.88</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">3</td>
						<td><strong>09.02.10</strong> Веб-разработка</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">73</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">2.92</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">4</td>
						<td><strong>10.02.05</strong> Обеспечение информационной безопасности автоматизированных систем</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">36</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">1.44</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">5</td>
						<td><strong>09.02.06</strong> Сетевое и системное администрирование</td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center;"><span class="akvt-num-badge">28</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">2.80</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">6</td>
						<td><strong>15.02.14</strong> Автоматические системы управления</td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center;"><span class="akvt-num-badge">21</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">2.10</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">7</td>
						<td><strong>13.02.11</strong> Эксплуатация и обслуживание электрического и электромеханического оборудования</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">36</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">1.44</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">8</td>
						<td><strong>25.02.08</strong> Эксплуатация беспилотных авиационных систем</td>
						<td style="text-align: center;">20</td>
						<td style="text-align: center;"><span class="akvt-num-badge">20</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">1.00</span></td>
					</tr>
				</tbody>
				<tfoot>
					<tr class="total-row">
						<td colspan="2" style="text-align: right; font-weight: 700; font-size: 0.95rem;">ИТОГО (очное, договор):</td>
						<td style="text-align: center; font-size: 1rem;">150</td>
						<td style="text-align: center; font-size: 1.05rem;">304</td>
						<td style="text-align: center; font-size: 1rem;"><span class="akvt-ratio-badge" style="background:#e8edfb; color:#2b59d1;">2.03</span></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Таблица 3: Заочная форма, договор -->
		<div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 36px; margin-bottom: 12px;">
			<h2 style="font-size: 1.25rem; color: var(--ink, #26251f); margin: 0;">3. Заочная форма обучения — Договорная основа (платно, 11 классов)</h2>
			<span style="font-size: 0.85rem; font-weight: 600; color: var(--muted, #7b786e); background: var(--paper-deep, #efece7); padding: 4px 12px; border-radius: 999px;">Заочное</span>
		</div>
		<div class="akvt-table-wrap">
			<table class="akvt-data-table">
				<thead>
					<tr>
						<th style="width: 46px; text-align: center;">№</th>
						<th style="text-align: left;">Наименование специальности</th>
						<th style="width: 140px; text-align: center;">План приёма</th>
						<th style="width: 150px; text-align: center;">Подано заявлений</th>
						<th style="width: 130px; text-align: center;">Конкурс</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">1</td>
						<td><strong>09.02.06</strong> Сетевое и системное администрирование</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">12</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">0.48</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">2</td>
						<td><strong>09.02.10</strong> Веб-разработка</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">18</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">0.72</span></td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">3</td>
						<td><strong>13.02.11</strong> Эксплуатация и обслуживание электрического и электромеханического оборудования</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;"><span class="akvt-num-badge">6</span></td>
						<td style="text-align: center;"><span class="akvt-ratio-badge">0.24</span></td>
					</tr>
				</tbody>
				<tfoot>
					<tr class="total-row">
						<td colspan="2" style="text-align: right; font-weight: 700; font-size: 0.95rem;">ИТОГО (заочное, договор):</td>
						<td style="text-align: center; font-size: 1rem;">75</td>
						<td style="text-align: center; font-size: 1.05rem;">36</td>
						<td style="text-align: center; font-size: 1rem;"><span class="akvt-ratio-badge" style="background:#e8edfb; color:#2b59d1;">0.48</span></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Полезные ссылки и контакты -->
		<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 22px 24px; margin: 36px 0 16px;">
			<h3 style="margin: 0 0 10px; font-size: 1.1rem; color: var(--accent, #2b59d1);">Информация для абитуриентов</h3>
			<p style="margin: 0 0 12px; font-size: 0.95rem; color: var(--ink, #26251f); line-height: 1.55;">Количество поданных заявлений обновляется секретариатом приёмной комиссии ежедневно в период приёма документов. Для поступления на бюджет необходимо своевременно предоставить оригинал документа об образовании (аттестата).</p>
			<div style="display: flex; gap: 14px; flex-wrap: wrap;">
				<a href="../priemnaya-kampaniya-2026/index.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--accent, #2b59d1); color: #ffffff; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.88rem;">Приёмная кампания 2026 →</a>
				<a href="../pravila-priema/index.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #e8edfb; color: var(--accent, #2b59d1); border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.88rem;">Правила приёма</a>
				<a href="../czelevoe-obuchenie/index.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #e8edfb; color: var(--accent, #2b59d1); border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.88rem;">Целевое обучение</a>
			</div>
		</div>
	</div><!-- .entry-content -->'''

priem_content = '''	<div class="entry-content">
		<p class="lead-text" style="font-size: 1.05rem; line-height: 1.6; color: var(--ink, #26251f); margin-bottom: 24px;">Добро пожаловать в приёмную комиссию Астраханского колледжа вычислительной техники! Здесь представлена актуальная информация о приёме на 2026/2027 учебный год, плане приёма, контактах и способах подачи документов.</p>

		<!-- Карточки контактов приёмной комиссии -->
		<div class="contacts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 20px 0 28px;">
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.3rem; margin-bottom: 6px;">📞</div>
				<div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--muted, #7b786e); letter-spacing: 0.05em;">Телефоны комиссии</div>
				<div style="margin-top: 6px; font-size: 1rem; font-weight: 700; line-height: 1.4;">
					<a href="tel:+78512996603" style="color: var(--accent, #2b59d1); text-decoration: none;">99-66-03</a>, 
					<a href="tel:+78512999954" style="color: var(--accent, #2b59d1); text-decoration: none;">99-99-54</a><br/>
					<a href="tel:+78512667503" style="color: var(--accent, #2b59d1); text-decoration: none;">66-75-03</a>
				</div>
			</div>
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.3rem; margin-bottom: 6px;">✉️</div>
				<div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--muted, #7b786e); letter-spacing: 0.05em;">Электронная почта</div>
				<div style="margin-top: 6px; font-size: 0.95rem; font-weight: 600;">
					<a href="mailto:priem@akvt.ru" style="color: var(--accent, #2b59d1);">priem@akvt.ru</a>
				</div>
				<div style="font-size: 0.82rem; color: var(--muted, #7b786e); margin-top: 4px;">Telegram: <a href="https://t.me/akvt30rus" target="_blank" rel="noopener noreferrer" style="color: var(--accent, #2b59d1);">@akvt30rus</a></div>
			</div>
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.3rem; margin-bottom: 6px;">📍</div>
				<div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--muted, #7b786e); letter-spacing: 0.05em;">Адрес приёмной</div>
				<div style="margin-top: 6px; font-size: 0.92rem; color: var(--ink, #26251f); line-height: 1.45;">
					414056, г. Астрахань, ул. Луконина, д. 2 / пер. Смоляной, д. 2
				</div>
			</div>
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.3rem; margin-bottom: 6px;">⏰</div>
				<div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--muted, #7b786e); letter-spacing: 0.05em;">График работы</div>
				<div style="margin-top: 6px; font-size: 0.9rem; color: var(--ink, #26251f); line-height: 1.45;">
					<strong>Пн – Пт:</strong> 9:00 – 16:00 (без перерыва)<br/>
					<strong>Суббота:</strong> 9:00 – 13:00
				</div>
			</div>
		</div>

		<!-- Сроки и зачисление -->
		<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin: 24px 0 32px;">
			<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 20px 22px;">
				<h3 style="margin: 0 0 10px; font-size: 1.05rem; color: var(--accent, #2b59d1); display: flex; align-items: center; gap: 8px;">
					<span>📅</span> Сроки подачи документов
				</h3>
				<p style="margin: 0 0 12px; font-size: 0.95rem; color: var(--ink, #26251f); font-weight: 700;">
					С 19 июня по 15 августа 2026 г.
				</p>
				<div style="font-size: 0.88rem; color: var(--ink-soft, #4b4941); line-height: 1.5;">
					<strong>Способы подачи:</strong>
					<ul style="margin: 6px 0 0; padding-left: 18px;">
						<li>Лично в приёмную комиссию колледжа</li>
						<li>Через портал «Госуслуги»</li>
						<li><a href="podacha-dokumentov-cherez-operatorov-pochtovoj-svyazi/index.html" style="color: var(--accent, #2b59d1);">Через операторов почтовой связи</a></li>
					</ul>
				</div>
			</div>

			<div style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 20px 22px;">
				<h3 style="margin: 0 0 10px; font-size: 1.05rem; color: var(--green, #3e7a5f); display: flex; align-items: center; gap: 8px;">
					<span>🎓</span> Сроки зачисления
				</h3>
				<ul style="margin: 0; padding-left: 18px; font-size: 0.92rem; color: var(--ink, #26251f); line-height: 1.6;">
					<li><strong>20 августа 2026 г.</strong> — бюджетная основа (9 классов, очное обучение)</li>
					<li><strong>28 августа 2026 г.</strong> — договорная основа (9 классов, очное обучение)</li>
					<li><strong>1 декабря 2026 г.</strong> — договорная основа (11 классов, заочное обучение)</li>
				</ul>
			</div>
		</div>

		<!-- Главная таблица: Общее количество мест -->
		<div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 36px; margin-bottom: 12px;">
			<h2 style="font-size: 1.3rem; color: var(--ink, #26251f); margin: 0;">Общее количество мест для приёма на 2026/2027 учебный год</h2>
			<span style="font-size: 0.85rem; font-weight: 600; color: var(--accent, #2b59d1); background: #e8edfb; padding: 4px 12px; border-radius: 999px;">План приёма: 560 мест</span>
		</div>

		<div class="akvt-table-wrap">
			<table class="akvt-data-table">
				<thead>
					<tr>
						<th rowspan="2" style="width: 44px; text-align: center;">№</th>
						<th rowspan="2" style="text-align: left; min-width: 220px;">Специальность / Профессия</th>
						<th colspan="2" style="text-align: center; border-bottom: 1px solid var(--line-soft, #e9e3db) !important;">Очная форма (9 кл.)</th>
						<th style="width: 140px; text-align: center;">Заочная (11 кл.)</th>
						<th rowspan="2" style="width: 100px; text-align: center;">Всего мест</th>
					</tr>
					<tr>
						<th style="width: 110px; text-align: center;">Бюджет АО</th>
						<th style="width: 110px; text-align: center;">Договор (платно)</th>
						<th style="width: 140px; text-align: center;">Договор (платно)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">1</td>
						<td><strong>09.02.01</strong> Компьютерные системы и комплексы</td>
						<td style="text-align: center;"><span class="akvt-num-badge">50</span></td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center; color: var(--muted, #7b786e);">—</td>
						<td style="text-align: center; font-weight: 700;">60</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">2</td>
						<td><strong>09.02.07</strong> Разработка и управление программным обеспечением</td>
						<td style="text-align: center;"><span class="akvt-num-badge">50</span></td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center; color: var(--muted, #7b786e);">—</td>
						<td style="text-align: center; font-weight: 700;">75</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">3</td>
						<td><strong>09.02.10</strong> Веб-разработка</td>
						<td style="text-align: center;"><span class="akvt-num-badge">25</span></td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center; font-weight: 700;">75</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">4</td>
						<td><strong>09.02.06</strong> Сетевое и системное администрирование</td>
						<td style="text-align: center;"><span class="akvt-num-badge">50</span></td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center; font-weight: 700;">85</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">5</td>
						<td><strong>10.02.05</strong> Обеспечение информационной безопасности автоматизированных систем</td>
						<td style="text-align: center;"><span class="akvt-num-badge">50</span></td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center; color: var(--muted, #7b786e);">—</td>
						<td style="text-align: center; font-weight: 700;">75</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">6</td>
						<td><strong>13.02.11</strong> Эксплуатация и обслуживание электрического и электромеханического оборудования</td>
						<td style="text-align: center;"><span class="akvt-num-badge">50</span></td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center;">25</td>
						<td style="text-align: center; font-weight: 700;">85</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">7</td>
						<td><strong>15.02.14</strong> Автоматические системы управления</td>
						<td style="text-align: center;"><span class="akvt-num-badge">25</span></td>
						<td style="text-align: center;">10</td>
						<td style="text-align: center; color: var(--muted, #7b786e);">—</td>
						<td style="text-align: center; font-weight: 700;">35</td>
					</tr>
					<tr>
						<td style="text-align: center; color: var(--muted, #7b786e); font-weight: 600;">8</td>
						<td><strong>25.02.08</strong> Эксплуатация беспилотных авиационных систем</td>
						<td style="text-align: center;"><span class="akvt-num-badge">50</span></td>
						<td style="text-align: center;">20</td>
						<td style="text-align: center; color: var(--muted, #7b786e);">—</td>
						<td style="text-align: center; font-weight: 700;">70</td>
					</tr>
				</tbody>
				<tfoot>
					<tr class="total-row">
						<td colspan="2" style="text-align: right; font-weight: 700; font-size: 0.95rem;">ИТОГО МЕСТ:</td>
						<td style="text-align: center; font-size: 1.05rem; color: var(--green, #3e7a5f);">350</td>
						<td style="text-align: center; font-size: 1.05rem;">135</td>
						<td style="text-align: center; font-size: 1.05rem;">75</td>
						<td style="text-align: center; font-size: 1.15rem; color: var(--accent, #2b59d1);">560</td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Документы приёма и приказы -->
		<h2 style="margin: 32px 0 14px; font-size: 1.25rem; color: var(--ink, #26251f);">Документы приёмной кампании</h2>
		<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
			<a href="https://www.akvt.ru/wp-content/uploads/2026/02/prikaz-18-ot-06.02.2026-o-stoimosti-obucheniya-na-2026-2027-gg-1.pdf" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); text-decoration: none; color: var(--ink, #26251f); transition: border-color 0.2s, box-shadow 0.2s;">
				<div style="display: flex; align-items: center; gap: 14px;">
					<span style="font-size: 1.5rem;">📄</span>
					<div>
						<div style="font-weight: 600; color: var(--accent, #2b59d1);">Приказ об утверждении стоимости обучения на 2026/2027 учебный год</div>
						<div style="font-size: 0.85rem; color: var(--muted, #7b786e);">Стоимость платных образовательных услуг по основным программам СПО (PDF)</div>
					</div>
				</div>
				<span class="doc-badge" style="padding: 6px 14px; background: #e8edfb; color: #2b59d1; font-weight: 700; border-radius: 999px; font-size: 0.85rem;">PDF</span>
			</a>

			<a href="https://www.akvt.ru/wp-content/uploads/2023/05/obrazecz-dogovora.docx" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); text-decoration: none; color: var(--ink, #26251f); transition: border-color 0.2s, box-shadow 0.2s;">
				<div style="display: flex; align-items: center; gap: 14px;">
					<span style="font-size: 1.5rem;">📝</span>
					<div>
						<div style="font-weight: 600; color: var(--accent, #2b59d1);">Образец договора на оказание платных образовательных услуг</div>
						<div style="font-size: 0.85rem; color: var(--muted, #7b786e);">Типовой договор об обучении по образовательным программам среднего профессионального образования (DOCX)</div>
					</div>
				</div>
				<span class="doc-badge" style="padding: 6px 14px; background: #f6edda; color: #c2933a; font-weight: 700; border-radius: 999px; font-size: 0.85rem;">DOCX</span>
			</a>
		</div>

		<!-- Быстрые ссылки -->
		<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px;">
			<a href="../kolichestvo-podannyx-zayavlenij-2/index.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; background: var(--accent, #2b59d1); color: #ffffff; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Количество поданных заявлений →</a>
			<a href="../czelevoe-obuchenie/index.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; background: #e8edfb; color: var(--accent, #2b59d1); border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Целевое обучение</a>
			<a href="../pravila-priema/index.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; background: #e8edfb; color: var(--accent, #2b59d1); border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Правила приёма</a>
		</div>
	</div><!-- .entry-content -->'''

def update_entry_content(path, new_html):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = '<div class="entry-content">'
    end_marker = '</div><!-- .entry-content -->'

    start_pos = content.find(start_marker)
    end_pos = content.find(end_marker)

    if start_pos != -1 and end_pos != -1:
        updated = content[:start_pos] + new_html.strip() + content[end_pos + len(end_marker):]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated)
        print('Updated:', path)
    else:
        print('Could not find markers in:', path)

# 1. kolichestvo
update_entry_content(r'E:\аквт\AKVT\site\postupayushhim\kolichestvo-podannyx-zayavlenij-2\index.html', kolichestvo_content)
update_entry_content(r'E:\аквт\site\postupayushhim\kolichestvo-podannyx-zayavlenij-2\index.html', kolichestvo_content)

# 2. priemnaya-kampaniya
update_entry_content(r'E:\аквт\AKVT\site\postupayushhim\priemnaya-kampaniya-2026\index.html', priem_content)
update_entry_content(r'E:\аквт\site\postupayushhim\priemnaya-kampaniya-2026\index.html', priem_content)
