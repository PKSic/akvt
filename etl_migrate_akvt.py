import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup

SITE_ROOT = Path(r"e:\аквт\site")
OUTPUT_JSON = Path(r"e:\аквт\akvt_migrated_database.json")
REDIRECTS_JSON = Path(r"e:\аквт\redirects_301.json")

def clean_html_content(raw_html):
    if not raw_html:
        return ""
    # 1. Удаление шорткодов WordPress [vc_...], [gallery...], [contact-form-7...], и т.д.
    cleaned = re.sub(r'\[\/?(?:vc_|wp_|gallery|contact-form-7|rpwe|su_)[^\]]*\]', '', raw_html, flags=re.IGNORECASE)
    # 2. Нормализация относительных путей wp-content/uploads/ в /storage/uploads/
    cleaned = re.sub(r'(?:\.\.\/)+wp-content\/uploads\/', '/storage/uploads/', cleaned)
    cleaned = re.sub(r'\/wp-content\/uploads\/', '/storage/uploads/', cleaned)
    # 3. Удаление пустых тегов и инлайн мусора
    cleaned = re.sub(r'<p>\s*(&nbsp;|\s)*<\/p>', '', cleaned)
    cleaned = re.sub(r'style="[^"]*font-family:[^"]*"', '', cleaned)
    return cleaned.strip()

def parse_article(html_path):
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
            html = f.read()
    except Exception as e:
        return None

    soup = BeautifulSoup(html, 'html.parser')
    
    # 1. Заголовок
    title_el = soup.select_one('h1.entry-title') or soup.select_one('h1')
    title = title_el.get_text(strip=True) if title_el else ""
    if not title:
        # Fallback to <title>
        title_tag = soup.select_one('title')
        if title_tag:
            title = title_tag.get_text(strip=True).split('—')[0].split('|')[0].strip()

    # 2. Дата публикации
    time_el = soup.select_one('time.entry-date')
    pub_date = time_el.get('datetime', '') if time_el else ""
    if not pub_date and time_el:
        pub_date = time_el.get_text(strip=True)

    # 3. Тело статьи (entry-content)
    content_el = soup.select_one('.entry-content') or soup.select_one('#content_single') or soup.select_one('#main')
    raw_content = str(content_el) if content_el else ""
    cleaned_content = clean_html_content(raw_content)

    # 4. Категории и рубрики
    category_el = soup.select_one('.taxonomy.category') or soup.select_one('.category')
    category = category_el.get_text(strip=True) if category_el else "Новости"

    # 5. Изображения внутри статьи
    images = []
    if content_el:
        for img in content_el.find_all('img'):
            src = img.get('src', '')
            if src:
                images.append(src)

    # 6. Slug и относительный путь
    rel_path = html_path.relative_to(SITE_ROOT).as_posix()
    parent_dir = html_path.parent.name
    slug = parent_dir if parent_dir not in ['site', '2020', '2021', '2022', '2023', '2024', '2026'] else html_path.stem

    return {
        'type': 'post',
        'title': title,
        'slug': slug,
        'published_at': pub_date,
        'category': category,
        'content_html': cleaned_content,
        'images': images,
        'original_path': '/' + rel_path.replace('index.html', '')
    }

def parse_static_page(html_path):
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
            html = f.read()
    except Exception as e:
        return None

    soup = BeautifulSoup(html, 'html.parser')
    
    title_el = soup.select_one('h1.entry-title') or soup.select_one('h1')
    title = title_el.get_text(strip=True) if title_el else ""
    if not title:
        title_tag = soup.select_one('title')
        if title_tag:
            title = title_tag.get_text(strip=True).split('—')[0].split('|')[0].strip()

    content_el = soup.select_one('.entry-content') or soup.select_one('#content') or soup.select_one('#main')
    raw_content = str(content_el) if content_el else ""
    cleaned_content = clean_html_content(raw_content)

    rel_path = html_path.relative_to(SITE_ROOT).as_posix()
    slug = html_path.parent.name if html_path.name == 'index.html' else html_path.stem

    # Рособрнадзор разметка (Приказ № 831)
    has_itemprop = bool(soup.select('[itemprop]'))
    itemprop_sections = [el.get('itemprop') for el in soup.select('[itemprop]') if el.get('itemprop')]

    return {
        'type': 'page',
        'title': title,
        'slug': slug,
        'content_html': cleaned_content,
        'has_rosobramadzor_markup': has_itemprop,
        'itemprop_elements_count': len(itemprop_sections),
        'original_path': '/' + rel_path.replace('index.html', '')
    }

def run_etl():
    print("=== ЗАПУСК ETL-МИГРАЦИИ АКВТ ===")
    posts = []
    pages = []
    redirects = {}
    total_docs = 0

    year_folders = {'2020', '2021', '2022', '2023', '2024', '2026'}

    for root, dirs, files in os.walk(SITE_ROOT):
        # Исключаем служебные папки
        if any(skip in root for skip in ['.agents', '.web-uplift', 'node_modules', 'css', 'js', 'icons', 'admin']):
            continue

        for file in files:
            if file == 'index.html':
                full_path = Path(root) / file
                parts = full_path.relative_to(SITE_ROOT).parts
                
                # Если путь начинается с года — это новостная статья
                if len(parts) > 1 and parts[0] in year_folders:
                    post_data = parse_article(full_path)
                    if post_data and post_data['title']:
                        posts.append(post_data)
                        old_url = post_data['original_path']
                        new_url = f"/news/{post_data['slug']}/"
                        redirects[old_url] = new_url
                else:
                    # Иначе — статическая страница
                    page_data = parse_static_page(full_path)
                    if page_data and page_data['title']:
                        pages.append(page_data)
                        old_url = page_data['original_path']
                        new_url = f"/{page_data['slug']}/"
                        if old_url != new_url and old_url != '/':
                            redirects[old_url] = new_url

    # Поиск документов и PDF
    doc_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.sig'}
    documents = []
    for root, dirs, files in os.walk(SITE_ROOT):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in doc_extensions:
                fpath = Path(root) / file
                documents.append({
                    'name': file,
                    'extension': ext,
                    'size_bytes': fpath.stat().st_size,
                    'rel_path': '/' + fpath.relative_to(SITE_ROOT).as_posix()
                })

    print(f"-> Найдено и очищено новостей: {len(posts)}")
    print(f"-> Найдено статических страниц: {len(pages)}")
    print(f"-> Найдено нормативных файлов и документов: {len(documents)}")
    print(f"-> Сгенерировано 301-редиректов: {len(redirects)}")

    export_data = {
        'meta': {
            'source': 'АКВТ WordPress Dump / Static Archive',
            'exported_entities': {
                'posts_count': len(posts),
                'pages_count': len(pages),
                'documents_count': len(documents),
                'redirects_count': len(redirects)
            }
        },
        'posts': posts,
        'pages': pages,
        'documents': documents
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)

    with open(REDIRECTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(redirects, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Экспорт успешно сохранен в:\n - {OUTPUT_JSON}\n - {REDIRECTS_JSON}")

if __name__ == '__main__':
    run_etl()
