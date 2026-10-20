"""E2E-проверка админки в настоящем Chromium. Запуск: python3 admin/test/e2e.py <папка-копии> <папка-для-скриншотов>"""
import sys, os, re, json, time, subprocess, urllib.request
from playwright.sync_api import sync_playwright

ROOT, SHOTS = sys.argv[1], sys.argv[2]
os.makedirs(SHOTS, exist_ok=True)
srv = subprocess.Popen(['node', os.path.join(ROOT, 'admin/test/dev-server.mjs'), ROOT], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
time.sleep(1.5)
ok_n = fail_n = 0
errors = []
STEP = ['init']

def ok(name, cond, extra=''):
    global ok_n, fail_n
    if cond: ok_n += 1; print('  ✔', name)
    else: fail_n += 1; print('  ✘', name, extra)

def rd(p):
    f = os.path.join(ROOT, p)
    return open(f, encoding='utf-8').read() if os.path.exists(f) else None

def go_publish(page, click, timeout=30000):
    page.evaluate("document.getElementById('toast').className='toast'")
    click()
    page.wait_for_selector('#toast.show', timeout=timeout)
    cls = page.locator('#toast').get_attribute('class'); txt = page.locator('#toast').inner_text()
    if 'err' in cls: raise Exception('Ошибка публикации: ' + txt)
    time.sleep(0.3)

def stats():
    return json.load(urllib.request.urlopen('http://localhost:8788/__stats'))

try:
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        ctx = br.new_context(viewport={'width': 1360, 'height': 900})
        ctx.add_init_script("window.AKVT_GITHUB_API='http://localhost:8788'")
        page = ctx.new_page()
        page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
        # 'Blocked script execution in about:srcdoc' — шум от самого Playwright (он подсовывает свой скрипт в iframe без allow-scripts); при ручной работе не воспроизводится
        page.on('console', lambda m: errors.append('CONSOLE ' + m.text[:40] + ' @ step ' + STEP[0] + ' loc=' + str(m.location)[:120]) if m.type == 'error' and 'favicon' not in m.text and 'ERR_NAME_NOT_RESOLVED' not in m.text and 'Blocked script execution in' not in m.text and 'ERR_INTERNET_DISCONNECTED' not in m.text and 'ERR_CONNECTION' not in m.text else None)
        page.on('dialog', lambda d: d.accept())
        B = 'http://localhost:8790/admin/'

        print('\n1. Вход'); STEP[0]='1'
        page.goto(B)
        page.wait_for_selector('.login-card')
        page.screenshot(path=f'{SHOTS}/01-login.png')
        page.fill('input[type=password]', 'ghp_fake')
        page.locator('button.btn.primary.big').click()
        page.wait_for_selector('.shell')
        ok('вошли, виден обзор', page.locator('h1.page-title').inner_text() == 'Обзор')
        ok('показана статистика (292 − 130 страниц, 130 новостей)', '130' in page.locator('.stats').inner_text())
        page.screenshot(path=f'{SHOTS}/02-dashboard.png')

        print('\n2. Список страниц и редактирование'); STEP[0]='2'
        page.goto(B + '#/pages'); page.wait_for_selector('.tbl tbody tr')
        page.fill('input.search', 'общежитие')
        time.sleep(0.4)
        ok('поиск находит страницу', page.locator('.tbl tbody tr').count() >= 1)
        page.screenshot(path=f'{SHOTS}/03-pages.png')
        page.goto(B + '#/page/postupayushhim/obshhezhitie')
        page.wait_for_selector('iframe.ed-frame')
        fr = page.frame_locator('iframe.ed-frame')
        fr.locator('[data-akvt-edit]').wait_for()
        time.sleep(0.6)
        page.screenshot(path=f'{SHOTS}/04-editor.png')
        region = fr.locator('[data-akvt-edit]')
        region.click()
        page.keyboard.press('Control+End')
        page.keyboard.type(' ТЕСТОВАЯ-ПРАВКА-АДМИНКИ')
        go_publish(page, lambda: page.click('text=Сохранить и опубликовать'))
        html = rd('site/postupayushhim/obshhezhitie/index.html')
        ok('правка текста попала в файл страницы', 'ТЕСТОВАЯ-ПРАВКА-АДМИНКИ' in html)
        ok('шапка и подвал страницы не повреждены', '<!--akvt-header:start-->' in html and '<!--akvt-footer:end-->' in html)
        ok('остальной HTML страницы на месте (боковое меню, хлебные крошки)', 'id="side-navi"' in html and 'class="breadcrumb"' in html)
        ok('в файл не попали служебные атрибуты редактора', 'contenteditable' not in html and 'data-akvt-edit' not in html)
        ok('создан ровно один коммит', stats()['commits'] == 1, str(stats()))

        print('\n3. Жирный шрифт и заголовок через панель инструментов'); STEP[0]='3'
        region = fr.locator('[data-akvt-edit]')
        region.click(); page.keyboard.press('Control+End'); page.keyboard.press('Enter')
        page.keyboard.type('Подзаголовок-раздела')
        page.keyboard.press('Shift+Home')
        page.select_option('.tb-select', 'H2')
        page.keyboard.press('Control+End'); page.keyboard.press('Enter')
        page.keyboard.type('жирное-слово'); page.keyboard.press('Shift+Home')
        page.click('button.tb.b')
        go_publish(page, lambda: page.click('text=Сохранить и опубликовать'))
        html = rd('site/postupayushhim/obshhezhitie/index.html')
        ok('заголовок H2 применён через список стилей', re.search(r'<h2[^>]*>(<[^>]+>)*Подзаголовок-раздела', html) is not None)
        ok('жирный шрифт применён кнопкой «Ж»', re.search(r'<(b|strong)[^>]*>(<[^>]+>)*жирное-слово', html) is not None)

        print('\n4. Новая страница'); STEP[0]='4'
        page.goto(B + '#/new-page/postupayushhim'); page.wait_for_selector('.form.box')
        page.fill('input[placeholder^="Например"]', 'Дни открытых дверей')
        slug = page.input_value('input[placeholder="adres-stranicy"]')
        ok('адрес сформирован автоматически', slug == 'dni-otkrytyh-dverej', slug)
        page.click('text=Далее — написать текст')
        page.wait_for_selector('iframe.ed-frame'); fr = page.frame_locator('iframe.ed-frame'); fr.locator('[data-akvt-edit]').wait_for(); time.sleep(0.5)
        fr.locator('[data-akvt-edit]').click(); page.keyboard.type('Приходите на день открытых дверей в субботу!')
        page.screenshot(path=f'{SHOTS}/05-new-page.png')
        go_publish(page, lambda: page.click('text=Опубликовать страницу'), 20000)
        np = rd('site/postupayushhim/dni-otkrytyh-dverej/index.html')
        ok('страница создана с текстом', np is not None and 'Приходите на день открытых дверей' in np)
        ok('после создания открылся её редактор', 'postupayushhim/dni-otkrytyh-dverej' in page.url)
        ok('у соседней страницы появился пункт в боковом меню', 'dni-otkrytyh-dverej' in rd('site/postupayushhim/pravila-priema/index.html'))
        ok('страница есть в sitemap.xml и карте сайта', 'dni-otkrytyh-dverej' in rd('site/sitemap.xml') and 'dni-otkrytyh-dverej' in rd('site/karta-sajta/index.html'))

        print('\n5. Новая новость'); STEP[0]='5'
        page.goto(B + '#/new-news'); page.wait_for_selector('.form.box')
        page.fill('input[placeholder="Заголовок новости"]', 'Проверка админки: первая новость')
        page.wait_for_selector('iframe.ed-frame'); fr = page.frame_locator('iframe.ed-frame'); fr.locator('[data-akvt-edit]').wait_for(); time.sleep(0.5)
        fr.locator('[data-akvt-edit]').click(); page.keyboard.type('Сегодня мы запустили новую админ-панель колледжа. Теперь сайт можно редактировать без программистов.')
        page.screenshot(path=f'{SHOTS}/06-new-news.png')
        go_publish(page, lambda: page.click('text=Опубликовать новость'), 20000)
        today = time.strftime('%Y/%m/%d')
        newsp = rd(f'site/{today}/proverka-adminki-pervaya-novost/index.html')
        ok('страница новости создана по адресу с датой', newsp is not None, today)
        home = rd('site/index.html')
        ok('новость первая на главной (6 карточек)', home.count('class="news-card') == 6 and 'Проверка админки: первая новость' in home[home.index('news-card featured'):home.index('news-card featured') + 600])
        ok('новость в архиве и рубрике', 'proverka-adminki' in rd('site/archives/index.html') and 'proverka-adminki' in rd('site/category/news/index.html'))
        page.goto(B + '#/news'); page.wait_for_selector('.tbl tbody tr')
        ok('новость первая в списке админки', 'Проверка админки' in page.locator('.tbl tbody tr').first.inner_text())

        print('\n6. Меню'); STEP[0]='6'
        page.goto(B + '#/menu'); page.wait_for_selector('.mlist')
        page.screenshot(path=f'{SHOTS}/07-menu.png')
        page.locator('.mlist').first.locator('.mi').first.locator('text=＋ подпункт').click()
        last = page.locator('.mlist').first.locator('.mi').first.locator('.mi.lvl1').last
        last.locator('input.lbl').fill('Дни открытых дверей')
        last.locator('input.url').fill('/postupayushhim/dni-otkrytyh-dverej/index.html')
        go_publish(page, lambda: page.click('text=Сохранить меню на всех страницах'), 60000)
        deep = rd('site/2026/09/23/zashhita-ot-moshennikov-v-seti/index.html')
        ok('новый пункт меню виден на глубокой странице с верными ссылками', '../../../../postupayushhim/dni-otkrytyh-dverej/index.html">Дни открытых дверей' in deep)
        ok('и на главной', 'postupayushhim/dni-otkrytyh-dverej/index.html">Дни открытых дверей' in rd('site/index.html'))

        print('\n7. Контакты'); STEP[0]='7'
        page.goto(B + '#/contacts'); page.wait_for_selector('.form.box')
        page.screenshot(path=f'{SHOTS}/08-contacts.png')
        page.locator('.form.box input').nth(2).fill('11-22-33')
        page.locator('.form.box input').nth(3).fill('+78510112233')
        go_publish(page, lambda: page.click('text=Сохранить на всех страницах'), 60000)
        ok('телефон обновлён в шапке/подвале страниц', 'tel:+78510112233">11-22-33' in rd('site/students/index.html'))

        print('\n8. Файлы'); STEP[0]='8'
        page.goto(B + '#/files'); page.wait_for_selector('.form.box')
        png = os.path.join(SHOTS, 'тест картинка.png')
        open(png, 'wb').write(bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082'))
        page.set_input_files('input[type=file]', png)
        go_publish(page, lambda: page.locator('button:has-text("Загрузить")').first.click())
        up = [f for f in subprocess.run(['find', f'{ROOT}/site/wp-content/uploads', '-name', '*test-kartinka*'], capture_output=True, text=True).stdout.split('\n') if f]
        ok('картинка записана под транслитерированным именем', len(up) == 1, str(up))
        page.screenshot(path=f'{SHOTS}/09-files.png')

        print('\n9. Расписание'); STEP[0]='9'
        page.goto(B + '#/schedule'); page.wait_for_selector('.tbl tbody tr')
        ok('видны 2 файла расписания', page.locator('.tbl tbody tr').count() == 2)
        xls = os.path.join(SHOTS, 'new.xls'); open(xls, 'wb').write(b'FAKE-XLS-DATA')
        page.locator('.tbl tbody tr').first.locator('input[type=file]').set_input_files(xls)
        go_publish(page, lambda: page.locator('.tbl tbody tr').first.locator('text=Заменить').click())
        ok('файл расписания и копия в _xls-proxy заменены', open(f'{ROOT}/site/wp-content/uploads/2026/09/bolshoe-raspisanie-s-2-5.xls', 'rb').read() == b'FAKE-XLS-DATA' and open(f'{ROOT}/site/_xls-proxy/s-2-5.xls', 'rb').read() == b'FAKE-XLS-DATA')
        page.screenshot(path=f'{SHOTS}/10-schedule.png')

        print('\n10. Удаление страницы и новости'); STEP[0]='10'
        page.goto(B + '#/page/postupayushhim/dni-otkrytyh-dverej'); page.wait_for_selector('iframe.ed-frame')
        page.click('button:has-text("Удалить")'); go_publish(page, lambda: page.click('.modal-actions >> text=Удалить'))
        pm = rd('site/postupayushhim/pravila-priema/index.html'); side = pm[pm.index('id="side-navi"'):pm.index('id="primary_page"')]
        ok('страница удалена, из бокового меню раздела пропала', rd('site/postupayushhim/dni-otkrytyh-dverej/index.html') is None and 'dni-otkrytyh-dverej' not in side)
        page.goto(B + f'#/page/{today}/proverka-adminki-pervaya-novost'); page.wait_for_selector('iframe.ed-frame')
        page.click('button:has-text("Удалить")'); go_publish(page, lambda: page.click('.modal-actions >> text=Удалить'))
        home = rd('site/index.html')
        ok('новость удалена, на главной снова 6 прежних карточек', rd(f'site/{today}/proverka-adminki-pervaya-novost/index.html') is None and home.count('class="news-card') == 6 and 'Проверка админки' not in home)

        print('\n11. История, проверка ссылок, справка, параметры страницы, HTML-код'); STEP[0]='11'
        page.goto(B + '#/history'); page.wait_for_selector('.tbl'); ok('история показывает коммиты', page.locator('.tbl tbody tr').count() >= 5)
        page.goto(B + '#/links'); page.click('text=Запустить проверку')
        page.wait_for_selector('.notice.ok, .tbl', timeout=120000); time.sleep(0.3)
        ok('проверка ссылок завершилась', 'Готово' in page.locator('.muted').last.inner_text() or page.locator('.tbl').count() > 0)
        page.screenshot(path=f'{SHOTS}/11-links.png')
        page.goto(B + '#/help'); page.wait_for_selector('.help')
        page.goto(B + '#/page/students/biblioteka'); page.wait_for_selector('iframe.ed-frame')
        page.click('.tabs >> text=Параметры'); page.fill('.form input.wide >> nth=0', 'Библиотека колледжа')
        page.click('.tabs >> text=Содержимое'); page.locator('.subtabs >> text=HTML-код').click()
        ok('вкладка HTML-кода показывает разметку', '<' in page.input_value('textarea.ed-code >> nth=0'))
        go_publish(page, lambda: page.click('text=Сохранить и опубликовать'))
        ok('переименование страницы дошло до <title>, меню соседей и карты сайта', '<title>Библиотека колледжа | АКВТ</title>' in rd('site/students/biblioteka/index.html') and 'Библиотека колледжа</a>' in rd('site/karta-sajta/index.html'))
        page.screenshot(path=f'{SHOTS}/12-final.png')

        print('\n12. Выход / вход без запоминания'); STEP[0]='12'
        page.click('text=Выйти'); page.wait_for_selector('.login-card'); ok('выход возвращает на экран входа', True)
        br.close()
finally:
    srv.terminate()

print('\nОшибки браузера в консоли:', errors if errors else 'нет')
ok('в консоли браузера нет ошибок и исключений', not errors, str(errors[:5]))
print(f'\nИтог: {ok_n} успешно, {fail_n} с ошибками')
sys.exit(1 if fail_n else 0)
