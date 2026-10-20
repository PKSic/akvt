import os

new_inner = '''	<div class="entry-content">
		<p class="lead-text" style="font-size: 1.08rem; line-height: 1.6; color: var(--ink, #26251f); margin-bottom: 20px;"><strong>Целевое обучение</strong> — это форма получения среднего профессионального образования в ГБПОУ АО «АКВТ», при которой абитуриент или студент заключает договор с организацией-заказчиком (будущим работодателем). Обучение осуществляется за счёт бюджетных ассигнований или средств заказчика с обязательным последующим трудоустройством выпускника.</p>

		<div class="target-edu-alert" style="background: var(--surface-warm, #faf7f3); border: 1.5px solid var(--line, #dcd6ce); border-left: 5px solid var(--accent, #2b59d1); border-radius: var(--radius-sm, 16px); padding: 20px 24px; margin: 24px 0 28px;">
			<p style="margin: 0 0 10px; font-weight: 700; color: var(--accent, #2b59d1); font-size: 1.05rem;">Нормативно-правовая база с 1 мая 2024 года:</p>
			<p style="margin: 0 0 8px; font-size: 0.95rem; color: var(--ink, #26251f); line-height: 1.55;">С 1 мая 2024 года вступили в силу изменения в Федеральный закон от 14 апреля 2023 года <strong>№ 124-ФЗ</strong> «О внесении изменений в Федеральный закон «Об образовании в Российской Федерации» и <strong>Постановление Правительства РФ от 27 апреля 2024 г. № 555</strong> «О целевом обучении по образовательным программам среднего профессионального и высшего образования».</p>
			<p style="margin: 0; font-size: 0.95rem; color: var(--ink-soft, #4b4941); line-height: 1.5;">Все предложения предприятий-заказчиков о заключении договоров о целевом обучении размещаются на <strong>Единой цифровой платформе «Работа в России»</strong>: <a href="https://trudvsem.ru" target="_blank" rel="noopener noreferrer" style="color: var(--accent, #2b59d1); font-weight: 600; text-decoration: underline;">trudvsem.ru</a>.</p>
		</div>

		<h2 style="margin: 28px 0 14px; font-size: 1.35rem; color: var(--ink, #26251f);">Преимущества целевого обучения для поступающих</h2>
		<ul class="features-list" style="margin: 14px 0 28px; padding-left: 22px; line-height: 1.65; color: var(--ink, #26251f);">
			<li><strong>100% бесплатное образование:</strong> обучение финансируется за счёт средств бюджета или предприятия-заказчика.</li>
			<li><strong>Отдельный конкурс:</strong> поступление по целевой квоте проходит по отдельному конкурсу среди абитуриентов-целевиков.</li>
			<li><strong>Гарантированное трудоустройство:</strong> рабочее место закрепляется за студентом уже на этапе поступления на срок от 3 до 5 лет.</li>
			<li><strong>Меры поддержки во время учёбы:</strong> выплата дополнительной стипендии от заказчика, оплата проезда, предоставление жилья/общежития и оплачиваемая производственная практика.</li>
			<li><strong>Практика и наставничество:</strong> прохождение практической подготовки и быстрая адаптация на будущем рабочем месте под руководством опытных наставников предприятия.</li>
		</ul>

		<h2 style="margin: 28px 0 14px; font-size: 1.35rem; color: var(--ink, #26251f);">Ключевые правила и условия заключения договора</h2>
		<div class="rules-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 18px 0 32px;">
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.5rem; margin-bottom: 8px;">🌐</div>
				<h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--ink, #26251f);">Где искать заказчика</h3>
				<p style="margin: 0; font-size: 0.9rem; color: var(--ink-soft, #4b4941); line-height: 1.5;">Все открытые предложения работодателей Астраханской области и всей России собраны на портале <a href="https://trudvsem.ru" target="_blank" rel="noopener noreferrer" style="color: var(--accent, #2b59d1); font-weight: 600;">«Работа в России»</a>.</p>
			</div>
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
				<h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--ink, #26251f);">Подача заявки</h3>
				<p style="margin: 0; font-size: 0.9rem; color: var(--ink-soft, #4b4941); line-height: 1.5;">Через портал <strong>«Госуслуги»</strong> при подаче заявления в колледж либо в бумажном виде лично в приёмную комиссию АКВТ.</p>
			</div>
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.5rem; margin-bottom: 8px;">🤝</div>
				<h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--ink, #26251f);">Сроки заключения</h3>
				<p style="margin: 0; font-size: 0.9rem; color: var(--ink-soft, #4b4941); line-height: 1.5;">Договор о целевом обучении заключается <strong>после зачисления</strong> абитуриента и строго <strong>до 1 сентября</strong> (до начала учебного года).</p>
			</div>
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); padding: 18px 20px;">
				<div style="font-size: 1.5rem; margin-bottom: 8px;">⏳</div>
				<h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--ink, #26251f);">Отработка у заказчика</h3>
				<p style="margin: 0; font-size: 0.9rem; color: var(--ink-soft, #4b4941); line-height: 1.5;">Срок обязательной трудовой деятельности после завершения обучения составляет <strong>от 3 до 5 лет</strong> по условиям договора.</p>
			</div>
		</div>

		<h2 style="margin: 28px 0 14px; font-size: 1.35rem; color: var(--ink, #26251f);">Порядок действий для абитуриентов и студентов</h2>
		<p style="margin-bottom: 18px; color: var(--ink-soft, #4b4941);">Ознакомьтесь с подробными пошаговыми инструкциями и инфографикой (нажмите на изображение для просмотра в полном размере):</p>

		<div class="infographics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin: 18px 0 32px;">
			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); overflow: hidden; display: flex; flex-direction: column;">
				<a href="../../wp-content/uploads/2025/03/kortinka_czelevoe.jpg" target="_blank" style="display: block; overflow: hidden; background: #efece7;">
					<img decoding="async" src="../../wp-content/uploads/2025/03/kortinka_czelevoe-1024x768.jpg" alt="Общая информация о целевом обучении" style="width: 100%; height: 210px; object-fit: cover; display: block;" />
				</a>
				<div style="padding: 14px 16px;">
					<strong style="display: block; color: var(--ink, #26251f); margin-bottom: 4px; font-size: 1rem;">Общие правила целевого обучения</strong>
					<span style="font-size: 0.85rem; color: var(--muted, #7b786e);">Платформа «Работа в России», права и обязанности сторон</span>
				</div>
			</div>

			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); overflow: hidden; display: flex; flex-direction: column;">
				<a href="../../wp-content/uploads/2025/03/instrukcziya-abiturientu.jpg" target="_blank" style="display: block; overflow: hidden; background: #efece7;">
					<img decoding="async" src="../../wp-content/uploads/2025/03/instrukcziya-abiturientu.jpg" alt="Инструкция абитуриенту по целевому обучению" style="width: 100%; height: 210px; object-fit: cover; display: block;" />
				</a>
				<div style="padding: 14px 16px;">
					<strong style="display: block; color: var(--ink, #26251f); margin-bottom: 4px; font-size: 1rem;">Инструкция для абитуриента</strong>
					<span style="font-size: 0.85rem; color: var(--muted, #7b786e);">Пошаговый алгоритм подачи заявки через портал «Госуслуги»</span>
				</div>
			</div>

			<div style="background: var(--surface, #fdfcfb); border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); overflow: hidden; display: flex; flex-direction: column;">
				<a href="../../wp-content/uploads/2025/03/instrukcziya-studentu.jpg" target="_blank" style="display: block; overflow: hidden; background: #efece7;">
					<img decoding="async" src="../../wp-content/uploads/2025/03/instrukcziya-studentu.jpg" alt="Инструкция студенту по заключению целевого договора" style="width: 100%; height: 210px; object-fit: cover; display: block;" />
				</a>
				<div style="padding: 14px 16px;">
					<strong style="display: block; color: var(--ink, #26251f); margin-bottom: 4px; font-size: 1rem;">Инструкция для студента АКВТ</strong>
					<span style="font-size: 0.85rem; color: var(--muted, #7b786e);">Заключение договора на 1–4 курсах через личный кабинет</span>
				</div>
			</div>
		</div>

		<h2 style="margin: 28px 0 14px; font-size: 1.35rem; color: var(--ink, #26251f);">Памятки и методические материалы</h2>
		<table class="akvt-doc-table" style="width: 100%; margin: 16px 0 28px; border-collapse: separate; border-spacing: 0; border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); overflow: hidden;">
			<tbody>
				<tr style="border-bottom: 1px solid var(--line, #dcd6ce); background: var(--surface, #fdfcfb);">
					<td class="akvt-doc-title" style="padding: 16px 20px; vertical-align: middle;">
						<a href="../../wp-content/uploads/2025/03/pamyatka-dlya-abiturienta.pdf" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: var(--accent, #2b59d1); text-decoration: none; font-size: 1rem;">Памятка по целевому обучению для абитуриента</a>
						<div style="font-size: 0.85rem; color: var(--muted, #7b786e); margin-top: 4px;">Пошаговый порядок действий поступающего при подаче заявления на целевые места (PDF)</div>
					</td>
					<td style="width: 80px; text-align: center; vertical-align: middle; padding: 16px 20px;">
						<a href="../../wp-content/uploads/2025/03/pamyatka-dlya-abiturienta.pdf" target="_blank" class="doc-badge" style="display: inline-block; padding: 6px 14px; background: #e8edfb; color: #2b59d1; font-weight: 700; border-radius: 999px; text-decoration: none; font-size: 0.85rem;">PDF</a>
					</td>
				</tr>
				<tr style="background: var(--surface-warm, #faf7f3);">
					<td class="akvt-doc-title" style="padding: 16px 20px; vertical-align: middle;">
						<a href="../../wp-content/uploads/2025/03/pyamyatka-studentu.pdf" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: var(--accent, #2b59d1); text-decoration: none; font-size: 1rem;">Памятка по целевому обучению для студента</a>
						<div style="font-size: 0.85rem; color: var(--muted, #7b786e); margin-top: 4px;">Руководство для обучающихся колледжа, желающих заключить целевой договор в процессе учебы (PDF)</div>
					</td>
					<td style="width: 80px; text-align: center; vertical-align: middle; padding: 16px 20px;">
						<a href="../../wp-content/uploads/2025/03/pyamyatka-studentu.pdf" target="_blank" class="doc-badge" style="display: inline-block; padding: 6px 14px; background: #e8edfb; color: #2b59d1; font-weight: 700; border-radius: 999px; text-decoration: none; font-size: 0.85rem;">PDF</a>
					</td>
				</tr>
			</tbody>
		</table>

		<h2 style="margin: 28px 0 14px; font-size: 1.35rem; color: var(--ink, #26251f);">Нормативные документы</h2>
		<table class="akvt-doc-table" style="width: 100%; margin: 16px 0 28px; border-collapse: separate; border-spacing: 0; border: 1.5px solid var(--line, #dcd6ce); border-radius: var(--radius-sm, 16px); overflow: hidden;">
			<tbody>
				<tr style="border-bottom: 1px solid var(--line, #dcd6ce); background: var(--surface, #fdfcfb);">
					<td class="akvt-doc-title" style="padding: 16px 20px; vertical-align: middle;">
						<a href="../../wp-content/uploads/2025/03/postanovlenie-pravitelstva-o-czelevom-obuchenii.pdf" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: var(--accent, #2b59d1); text-decoration: none; font-size: 1rem;">Постановление Правительства РФ от 27 апреля 2024 г. № 555 «О целевом обучении по образовательным программам среднего профессионального и высшего образования»</a>
						<div style="font-size: 0.85rem; color: var(--muted, #7b786e); margin-top: 4px;">Официальное положение о целевом обучении, типовая форма договора и порядок квотирования (PDF)</div>
					</td>
					<td style="width: 80px; text-align: center; vertical-align: middle; padding: 16px 20px;">
						<a href="../../wp-content/uploads/2025/03/postanovlenie-pravitelstva-o-czelevom-obuchenii.pdf" target="_blank" class="doc-badge" style="display: inline-block; padding: 6px 14px; background: #e8edfb; color: #2b59d1; font-weight: 700; border-radius: 999px; text-decoration: none; font-size: 0.85rem;">PDF</a>
					</td>
				</tr>
				<tr style="background: var(--surface-warm, #faf7f3);">
					<td class="akvt-doc-title" style="padding: 16px 20px; vertical-align: middle;">
						<a href="../../wp-content/uploads/2025/03/tipovaya_forma_dogovora_o_czelevom_obuchenii.pdf" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: var(--accent, #2b59d1); text-decoration: none; font-size: 1rem;">Типовая форма договора о целевом обучении по образовательной программе среднего профессионального образования</a>
						<div style="font-size: 0.85rem; color: var(--muted, #7b786e); margin-top: 4px;">Утвержденная форма трёхстороннего/двустороннего договора между заказчиком, гражданином и колледжем (PDF)</div>
					</td>
					<td style="width: 80px; text-align: center; vertical-align: middle; padding: 16px 20px;">
						<a href="../../wp-content/uploads/2025/03/tipovaya_forma_dogovora_o_czelevom_obuchenii.pdf" target="_blank" class="doc-badge" style="display: inline-block; padding: 6px 14px; background: #e8edfb; color: #2b59d1; font-weight: 700; border-radius: 999px; text-decoration: none; font-size: 0.85rem;">PDF</a>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="contacts-callout" style="background: #e8edfb; border: 1.5px solid rgba(43, 89, 209, 0.25); border-radius: var(--radius-sm, 16px); padding: 22px 26px; margin: 32px 0 16px;">
			<h3 style="margin: 0 0 10px; color: var(--accent, #2b59d1); font-size: 1.15rem;">Остались вопросы по целевому обучению?</h3>
			<p style="margin: 0 0 12px; color: var(--ink, #26251f); font-size: 0.95rem; line-height: 1.5;">Специалисты приёмной комиссии АКВТ готовы проконсультировать вас по выбору предприятий-партнёров, подаче заявки через портал «Работа в России» и оформлению документов:</p>
			<ul style="margin: 0; padding-left: 20px; font-size: 0.95rem; color: var(--ink-soft, #4b4941); line-height: 1.65;">
				<li><strong>Телефон приёмной комиссии:</strong> <a href="tel:+78512540843" style="color: var(--accent, #2b59d1); font-weight: 600;">8 (8512) 54-08-43</a></li>
				<li><strong>Горячая линия колледжа:</strong> <a href="tel:+78512667503" style="color: var(--accent, #2b59d1); font-weight: 600;">8 (8512) 66-75-03</a>, <a href="tel:+78512999954" style="color: var(--accent, #2b59d1); font-weight: 600;">99-99-54</a></li>
				<li><strong>Электронная почта:</strong> <a href="mailto:office@akvt.astrobl.ru" style="color: var(--accent, #2b59d1); font-weight: 600;">office@akvt.astrobl.ru</a></li>
				<li><strong>Адрес приёмной комиссии:</strong> г. Астрахань, ул. Луконина, д. 2 / ул. Космонавтов, 8</li>
				<li><strong>Полезные разделы:</strong> <a href="../pravila-priema/index.html" style="color: var(--accent, #2b59d1); text-decoration: underline;">Правила приёма в колледж</a> · <a href="../index.html" style="color: var(--accent, #2b59d1); text-decoration: underline;">Приёмная кампания АКВТ</a></li>
			</ul>
		</div>
	</div><!-- .entry-content -->'''

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = '<div class="entry-content">'
    end_marker = '</div><!-- .entry-content -->'

    start_pos = content.find(start_marker)
    end_pos = content.find(end_marker)

    if start_pos != -1 and end_pos != -1:
        updated = content[:start_pos] + new_inner.strip() + content[end_pos + len(end_marker):]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated)
        print('Successfully updated:', path)
    else:
        print('Markers not found in:', path, 'start:', start_pos, 'end:', end_pos)

update_file(r'E:\аквт\AKVT\site\postupayushhim\czelevoe-obuchenie\index.html')
update_file(r'E:\аквт\site\postupayushhim\czelevoe-obuchenie\index.html')
