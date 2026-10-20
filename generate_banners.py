import os
import asyncio
from playwright.async_api import async_playwright
from PIL import Image

OUTPUT_DIR = r"E:\аквт\AKVT\site\wp-content\uploads"
ALT_OUTPUT_DIR = r"E:\аквт\site\wp-content\uploads"
ARTIFACTS_DIR = r"C:\Users\user\.gemini\antigravity\brain\14fdb1ad-c3e7-49a3-a60c-64d782a45a46"

# Design specifications:
# Canvas: 1080 x 480 (Exact 2.25 aspect ratio, 4x of 270x120)
# Card radius: 64px (16px @ 1x)
# Card border: 6px solid #dcd6ce (1.5px @ 1x)
# Background: linear-gradient(135deg, #fdfcfb 0%, #faf7f3 50%, #f6f3f1 100%)
# Text primary: #26251f (--ink)
# Text secondary: #7b786e (--muted)
# Accent: #2b59d1 (--accent)
# Font: 'Golos Text', 'Segoe UI', system-ui, -apple-system, sans-serif

CARDS = [
    {
        "id": "10",
        "rel_path": r"2022\11\10.webp",
        "title_lines": ["СТУДЕНЧЕСКОЕ", "САМОУПРАВЛЕНИЕ"],
        "badge": "СТУДЕНЧЕСКИЙ СОВЕТ · АКВТ",
        "icon_type": "council"
    },
    {
        "id": "02",
        "rel_path": r"2022\11\02.webp",
        "title_lines": ["РАСПИСАНИЕ", "ЗАНЯТИЙ"],
        "badge": "УЧЕБНЫЕ ЗАНЯТИЯ И ЗВОНКИ",
        "icon_type": "schedule"
    },
    {
        "id": "11.1",
        "rel_path": r"2022\11\11.1.webp",
        "alt_legacy": r"2022\11\11.1.png",
        "title_lines": ["БИБЛИОТЕКА", "КОЛЛЕДЖА"],
        "badge": "ЭЛЕКТРОННО-БИБЛИОТЕЧНЫЙ ФОНД",
        "icon_type": "library"
    },
    {
        "id": "071",
        "rel_path": r"2022\12\071.webp",
        "alt_legacy": r"2022\12\071.jpg",
        "title_lines": ["ОФОРМЛЕНИЕ", "ДОКУМЕНТАЦИИ"],
        "badge": "БЛАНКИ, ЗАЯВЛЕНИЯ И ПРИКАЗЫ",
        "icon_type": "docs"
    },
    {
        "id": "01-2",
        "rel_path": r"2025\10\01-2.webp",
        "title_lines": ["КАЛЕНДАРНЫЙ", "УЧЕБНЫЙ ГРАФИК"],
        "badge": "ГРАФИК СЕССИЙ И ПРАКТИКИ",
        "icon_type": "calendar_graph"
    }
]

def get_icon_svg(icon_type):
    if icon_type == "council":
        # Student council: leadership shield, avatars, star
        return '''
        <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b6ee8" />
                    <stop offset="100%" stop-color="#1e3f9e" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f5d47a" />
                    <stop offset="100%" stop-color="#c2933a" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#1e3f9e" flood-opacity="0.25" />
                </filter>
                <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#26251f" flood-opacity="0.12" />
                </filter>
            </defs>

            <!-- Base decorative circle backdrop -->
            <circle cx="140" cy="140" r="116" fill="#e8edfb" />
            <circle cx="140" cy="140" r="104" fill="#faf7f3" stroke="#dcd6ce" stroke-width="3" />

            <!-- Shield -->
            <g filter="url(#softShadow)">
                <path d="M140 44 C190 44, 218 64, 218 120 C218 184, 168 226, 140 240 C112 226, 62 184, 62 120 C62 64, 90 44, 140 44 Z" 
                      fill="url(#shieldGrad)" />
            </g>

            <!-- Inner shield line -->
            <path d="M140 56 C180 56, 204 72, 204 120 C204 172, 162 210, 140 224 C118 210, 76 172, 76 120 C76 72, 100 56, 140 56 Z" 
                  fill="none" stroke="#6b92f2" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.7" />

            <!-- Three student figures inside shield -->
            <!-- Left student -->
            <g opacity="0.85">
                <circle cx="108" cy="120" r="15" fill="#fdfcfb" />
                <path d="M88 160 C88 142, 96 138, 108 138 C120 138, 128 142, 128 160 Z" fill="#cfdaf5" />
            </g>
            <!-- Right student -->
            <g opacity="0.85">
                <circle cx="172" cy="120" r="15" fill="#fdfcfb" />
                <path d="M152 160 C152 142, 160 138, 172 138 C184 138, 192 142, 192 160 Z" fill="#cfdaf5" />
            </g>
            <!-- Center student leader -->
            <g filter="url(#subtleGlow)">
                <circle cx="140" cy="112" r="19" fill="#ffffff" />
                <!-- Graduation cap -->
                <polygon points="140,86 168,98 140,108 112,98" fill="#26251f" />
                <polygon points="138,97 142,97 142,105 138,105" fill="#26251f" />
                <circle cx="166" cy="103" r="3" fill="url(#goldGrad)" />
                <path d="M166 103 C166 112, 168 116, 169 119" stroke="url(#goldGrad)" stroke-width="2" fill="none" />
                <!-- Torso -->
                <path d="M116 168 C116 142, 126 135, 140 135 C154 135, 164 142, 164 168 Z" fill="#ffffff" />
                <path d="M132 144 L140 156 L148 144 Z" fill="#3b6ee8" />
            </g>

            <!-- Golden achievement badge / star below -->
            <g filter="url(#subtleGlow)">
                <circle cx="140" cy="192" r="22" fill="#faf7f3" stroke="#dcd6ce" stroke-width="2" />
                <circle cx="140" cy="192" r="18" fill="url(#goldGrad)" />
                <!-- 5-pointed star -->
                <polygon points="140,179 144,188 153,188 146,194 149,203 140,197 131,203 134,194 127,188 136,188" fill="#ffffff" />
            </g>
        </svg>
        '''

    elif icon_type == "schedule":
        # Schedule: modern timetable clock + calendar sheet
        return '''
        <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="clockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b6ee8" />
                    <stop offset="100%" stop-color="#1e3f9e" />
                </linearGradient>
                <linearGradient id="sheetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" />
                    <stop offset="100%" stop-color="#faf7f3" />
                </linearGradient>
                <filter id="softShadow2" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#1e3f9e" flood-opacity="0.20" />
                </filter>
                <filter id="subtleGlow2" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#26251f" flood-opacity="0.10" />
                </filter>
            </defs>

            <!-- Backdrop -->
            <circle cx="140" cy="140" r="116" fill="#e8edfb" />
            <circle cx="140" cy="140" r="104" fill="#faf7f3" stroke="#dcd6ce" stroke-width="3" />

            <!-- Calendar schedule sheet in background -->
            <g transform="rotate(-6 140 140)" filter="url(#subtleGlow2)">
                <rect x="65" y="55" width="130" height="155" rx="18" fill="url(#sheetGrad)" stroke="#dcd6ce" stroke-width="3" />
                <!-- Header band -->
                <path d="M66 73 C66 64, 73 56, 83 56 L177 56 C187 56, 194 64, 194 73 L194 88 L66 88 Z" fill="#cfdaf5" />
                <!-- Rings -->
                <circle cx="92" cy="56" r="5" fill="#4b4941" />
                <circle cx="130" cy="56" r="5" fill="#4b4941" />
                <circle cx="168" cy="56" r="5" fill="#4b4941" />
                <!-- Timetable rows -->
                <rect x="80" y="104" width="60" height="9" rx="4.5" fill="#2b59d1" />
                <rect x="80" y="122" width="95" height="7" rx="3.5" fill="#dcd6ce" />
                <rect x="80" y="137" width="80" height="7" rx="3.5" fill="#dcd6ce" />
                <rect x="80" y="152" width="70" height="7" rx="3.5" fill="#a5ddc0" />
                <rect x="80" y="167" width="90" height="7" rx="3.5" fill="#dcd6ce" />
            </g>

            <!-- Large 3D Clock in foreground -->
            <g transform="translate(45, 30)" filter="url(#softShadow2)">
                <!-- Clock body -->
                <circle cx="120" cy="120" r="66" fill="url(#clockGrad)" />
                <circle cx="120" cy="120" r="56" fill="#ffffff" />
                <circle cx="120" cy="120" r="50" fill="#faf7f3" stroke="#e9e3db" stroke-width="2" />
                
                <!-- Hour ticks -->
                <circle cx="120" cy="78" r="3.5" fill="#26251f" />
                <circle cx="162" cy="120" r="3.5" fill="#26251f" />
                <circle cx="120" cy="162" r="3.5" fill="#26251f" />
                <circle cx="78" cy="120" r="3.5" fill="#26251f" />

                <!-- Clock hands: 8:30 (typical college morning lecture!) -->
                <!-- Hour hand pointing to 8-9 -->
                <line x1="120" y1="120" x2="94" y2="134" stroke="#26251f" stroke-width="5" stroke-linecap="round" />
                <!-- Minute hand pointing to 6 (30 min) -->
                <line x1="120" y1="120" x2="120" y2="152" stroke="#2b59d1" stroke-width="4" stroke-linecap="round" />
                <!-- Center cap -->
                <circle cx="120" cy="120" r="6" fill="#1e3f9e" />
                <circle cx="120" cy="120" r="2.5" fill="#ffffff" />
            </g>

            <!-- Small notification badge / bell -->
            <g transform="translate(195, 68)" filter="url(#subtleGlow2)">
                <circle cx="16" cy="16" r="18" fill="#3e7a5f" />
                <path d="M16 8 C12.5 8, 10 10.5, 10 14 L10 19 L8 21 L8 22 L24 22 L24 21 L22 19 L22 14 C22 10.5, 19.5 8, 16 8 Z" fill="#ffffff" />
                <circle cx="16" cy="24" r="2" fill="#ffffff" />
            </g>
        </svg>
        '''

    elif icon_type == "library":
        # Library: isometric book stack with open book & bookmark
        return '''
        <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bookGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#3b6ee8" />
                    <stop offset="100%" stop-color="#1e3f9e" />
                </linearGradient>
                <linearGradient id="bookGradGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#d4a34b" />
                    <stop offset="100%" stop-color="#b07f28" />
                </linearGradient>
                <linearGradient id="bookGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#4f9675" />
                    <stop offset="100%" stop-color="#2e5e48" />
                </linearGradient>
                <filter id="softShadow3" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#1e3f9e" flood-opacity="0.22" />
                </filter>
                <filter id="subtleGlow3" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#26251f" flood-opacity="0.10" />
                </filter>
            </defs>

            <!-- Backdrop -->
            <circle cx="140" cy="140" r="116" fill="#e8edfb" />
            <circle cx="140" cy="140" r="104" fill="#faf7f3" stroke="#dcd6ce" stroke-width="3" />

            <!-- Stacked books in background -->
            <!-- Bottom green book -->
            <g transform="translate(60, 160)" filter="url(#subtleGlow3)">
                <rect x="0" y="0" width="160" height="28" rx="7" fill="url(#bookGradGreen)" />
                <rect x="18" y="4" width="138" height="20" fill="#faf7f3" rx="4" />
                <line x1="26" y1="9" x2="148" y2="9" stroke="#dcd6ce" stroke-width="2" />
                <line x1="26" y1="14" x2="148" y2="14" stroke="#dcd6ce" stroke-width="2" />
                <line x1="26" y1="19" x2="148" y2="19" stroke="#dcd6ce" stroke-width="2" />
            </g>

            <!-- Middle gold book -->
            <g transform="translate(70, 132)" filter="url(#subtleGlow3)">
                <rect x="0" y="0" width="144" height="26" rx="6" fill="url(#bookGradGold)" />
                <rect x="16" y="4" width="124" height="18" fill="#faf7f3" rx="4" />
                <line x1="24" y1="8" x2="134" y2="8" stroke="#dcd6ce" stroke-width="1.8" />
                <line x1="24" y1="13" x2="134" y2="13" stroke="#dcd6ce" stroke-width="1.8" />
                <line x1="24" y1="18" x2="134" y2="18" stroke="#dcd6ce" stroke-width="1.8" />
            </g>

            <!-- Top open book -->
            <g transform="translate(48, 52)" filter="url(#softShadow3)">
                <!-- Open book cover spine -->
                <path d="M12 78 C42 66, 88 68, 92 84 C96 68, 142 66, 172 78 L172 118 C142 106, 96 108, 92 124 C88 108, 42 106, 12 118 Z" 
                      fill="url(#bookGradBlue)" />

                <!-- Left page -->
                <path d="M14 74 C44 62, 88 64, 91 80 L91 120 C88 104, 44 102, 14 114 Z" 
                      fill="#ffffff" stroke="#e9e3db" stroke-width="1.5" />
                <!-- Left text lines -->
                <line x1="24" y1="78" x2="80" y2="70" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />
                <line x1="24" y1="87" x2="78" y2="79" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />
                <line x1="24" y1="96" x2="72" y2="88" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />
                <line x1="24" y1="105" x2="68" y2="97" stroke="#2b59d1" stroke-width="2.5" stroke-linecap="round" />

                <!-- Right page -->
                <path d="M93 80 C96 64, 140 62, 170 74 L170 114 C140 102, 96 104, 93 120 Z" 
                      fill="#faf7f3" stroke="#e9e3db" stroke-width="1.5" />
                <!-- Right text lines -->
                <line x1="104" y1="70" x2="160" y2="78" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />
                <line x1="106" y1="79" x2="160" y2="87" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />
                <line x1="108" y1="88" x2="154" y2="96" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />
                <line x1="110" y1="97" x2="148" y2="105" stroke="#a7a399" stroke-width="2.5" stroke-linecap="round" />

                <!-- Bookmark ribbon hanging down -->
                <path d="M90 76 L94 76 L94 136 L88 128 L82 136 L82 80 Z" fill="#ef9273" />
            </g>

            <!-- Little digital reading icon: glowing tablet corner -->
            <g transform="translate(182, 168)" filter="url(#subtleGlow3)">
                <rect x="0" y="0" width="44" height="34" rx="6" fill="#26251f" />
                <rect x="3" y="3" width="38" height="28" rx="4" fill="#e8edfb" />
                <circle cx="22" cy="17" r="5" fill="#2b59d1" />
            </g>
        </svg>
        '''

    elif icon_type == "docs":
        # Documentation: folder / clipboard with checkmarks, seal, pen
        return '''
        <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b6ee8" />
                    <stop offset="100%" stop-color="#1e3f9e" />
                </linearGradient>
                <linearGradient id="penGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f5d47a" />
                    <stop offset="100%" stop-color="#c2933a" />
                </linearGradient>
                <filter id="softShadow4" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#1e3f9e" flood-opacity="0.22" />
                </filter>
                <filter id="subtleGlow4" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#26251f" flood-opacity="0.10" />
                </filter>
            </defs>

            <!-- Backdrop -->
            <circle cx="140" cy="140" r="116" fill="#e8edfb" />
            <circle cx="140" cy="140" r="104" fill="#faf7f3" stroke="#dcd6ce" stroke-width="3" />

            <!-- Blue folder tab in back -->
            <g transform="translate(68, 54)" filter="url(#subtleGlow4)">
                <path d="M0 16 C0 7, 7 0, 16 0 L64 0 C72 0, 78 5, 82 12 L90 22 L140 22 C149 22, 156 29, 156 38 L156 160 C156 169, 149 176, 140 176 L16 176 C7 176, 0 169, 0 160 Z" 
                      fill="url(#folderGrad)" />
            </g>

            <!-- White clean document sheet in front -->
            <g transform="translate(80, 68)" filter="url(#softShadow4)">
                <rect x="0" y="0" width="134" height="162" rx="12" fill="#ffffff" stroke="#dcd6ce" stroke-width="2.5" />
                
                <!-- Folded top-right corner -->
                <path d="M106 0 L134 28 L106 28 Z" fill="#efece7" />
                <path d="M106 0 L106 28 L134 28" fill="none" stroke="#dcd6ce" stroke-width="2.5" />

                <!-- Document title bar -->
                <rect x="18" y="20" width="70" height="9" rx="4.5" fill="#2b59d1" />

                <!-- Checkbox line 1 -->
                <rect x="18" y="44" width="14" height="14" rx="3" fill="#e4efe9" stroke="#3e7a5f" stroke-width="2" />
                <path d="M21 51 L25 55 L30 47" fill="none" stroke="#3e7a5f" stroke-width="2.5" stroke-linecap="round" />
                <rect x="40" y="48" width="76" height="6" rx="3" fill="#4b4941" />

                <!-- Checkbox line 2 -->
                <rect x="18" y="68" width="14" height="14" rx="3" fill="#e4efe9" stroke="#3e7a5f" stroke-width="2" />
                <path d="M21 75 L25 79 L30 71" fill="none" stroke="#3e7a5f" stroke-width="2.5" stroke-linecap="round" />
                <rect x="40" y="72" width="68" height="6" rx="3" fill="#4b4941" />

                <!-- Checkbox line 3 -->
                <rect x="18" y="92" width="14" height="14" rx="3" fill="#e4efe9" stroke="#3e7a5f" stroke-width="2" />
                <path d="M21 99 L25 103 L30 95" fill="none" stroke="#3e7a5f" stroke-width="2.5" stroke-linecap="round" />
                <rect x="40" y="96" width="74" height="6" rx="3" fill="#4b4941" />

                <!-- Line 4 (signature area) -->
                <line x1="18" y1="126" x2="68" y2="126" stroke="#dcd6ce" stroke-width="2" stroke-dasharray="4 3" />
                <path d="M24 122 C30 114, 40 128, 52 118 C58 122, 64 116, 68 122" fill="none" stroke="#1e3f9e" stroke-width="2.5" stroke-linecap="round" />

                <!-- Official college round stamp seal -->
                <circle cx="102" cy="128" r="18" fill="none" stroke="#2b59d1" stroke-width="2.5" stroke-dasharray="5 3" />
                <circle cx="102" cy="128" r="14" fill="#e8edfb" opacity="0.6" />
                <path d="M96 128 L108 128 M102 122 L102 134" stroke="#2b59d1" stroke-width="2" />
            </g>

            <!-- Fountain Pen / Stylus positioned over sheet -->
            <g transform="translate(186, 118) rotate(35)" filter="url(#subtleGlow4)">
                <!-- Pen body -->
                <path d="M6 0 L18 0 L15 90 L9 90 Z" fill="#26251f" />
                <!-- Gold ring band -->
                <rect x="7" y="30" width="10" height="5" fill="url(#penGrad)" />
                <rect x="8" y="65" width="8" height="3" fill="url(#penGrad)" />
                <!-- Pen nib -->
                <polygon points="9,90 15,90 12,106" fill="url(#penGrad)" />
                <line x1="12" y1="90" x2="12" y2="102" stroke="#26251f" stroke-width="1.2" />
            </g>
        </svg>
        '''

    elif icon_type == "calendar_graph":
        # Academic calendar & graph: calendar page + timeline graph wave & milestones
        return '''
        <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="calHeaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b6ee8" />
                    <stop offset="100%" stop-color="#1e3f9e" />
                </linearGradient>
                <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#2b59d1" />
                    <stop offset="50%" stop-color="#3e7a5f" />
                    <stop offset="100%" stop-color="#c2933a" />
                </linearGradient>
                <filter id="softShadow5" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#1e3f9e" flood-opacity="0.22" />
                </filter>
                <filter id="subtleGlow5" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#26251f" flood-opacity="0.10" />
                </filter>
            </defs>

            <!-- Backdrop -->
            <circle cx="140" cy="140" r="116" fill="#e8edfb" />
            <circle cx="140" cy="140" r="104" fill="#faf7f3" stroke="#dcd6ce" stroke-width="3" />

            <!-- Calendar card -->
            <g transform="translate(62, 54)" filter="url(#softShadow5)">
                <!-- Sheet body -->
                <rect x="0" y="0" width="156" height="172" rx="18" fill="#ffffff" stroke="#dcd6ce" stroke-width="3" />

                <!-- Calendar header band -->
                <path d="M0 18 C0 8, 8 0, 18 0 L138 0 C148 0, 156 8, 156 18 L156 46 L0 46 Z" fill="url(#calHeaderGrad)" />

                <!-- Binder spiral / pegs -->
                <rect x="28" y="-6" width="12" height="16" rx="6" fill="#26251f" />
                <rect x="72" y="-6" width="12" height="16" rx="6" fill="#26251f" />
                <rect x="116" y="-6" width="12" height="16" rx="6" fill="#26251f" />

                <!-- Month text label in header -->
                <rect x="42" y="20" width="72" height="8" rx="4" fill="#ffffff" />

                <!-- Calendar day cells grid -->
                <g opacity="0.6">
                    <circle cx="30" cy="66" r="6" fill="#dcd6ce" />
                    <circle cx="58" cy="66" r="6" fill="#dcd6ce" />
                    <circle cx="86" cy="66" r="6" fill="#dcd6ce" />
                    <circle cx="114" cy="66" r="6" fill="#2b59d1" />
                    <circle cx="140" cy="66" r="6" fill="#dcd6ce" />

                    <circle cx="18" cy="88" r="6" fill="#dcd6ce" />
                    <circle cx="44" cy="88" r="6" fill="#dcd6ce" />
                    <circle cx="70" cy="88" r="6" fill="#3e7a5f" />
                    <circle cx="98" cy="88" r="6" fill="#dcd6ce" />
                    <circle cx="126" cy="88" r="6" fill="#dcd6ce" />
                </g>

                <!-- Academic Timeline Curve / Progress Graph -->
                <!-- Graph grid area backdrop -->
                <rect x="14" y="108" width="128" height="52" rx="8" fill="#faf7f3" stroke="#e9e3db" stroke-width="1.5" />
                
                <!-- Axis grid lines -->
                <line x1="22" y1="148" x2="134" y2="148" stroke="#dcd6ce" stroke-width="1.5" />
                <line x1="22" y1="130" x2="134" y2="130" stroke="#efece7" stroke-width="1.5" stroke-dasharray="4 3" />
                
                <!-- Smooth spline curve showing semester progression -->
                <path d="M22 144 Q 50 148, 64 128 T 100 120 T 132 114" 
                      fill="none" stroke="url(#curveGrad)" stroke-width="4.5" stroke-linecap="round" />

                <!-- Milestone dots -->
                <circle cx="64" cy="128" r="5" fill="#2b59d1" stroke="#ffffff" stroke-width="2" />
                <circle cx="100" cy="120" r="5" fill="#3e7a5f" stroke="#ffffff" stroke-width="2" />
                <circle cx="132" cy="114" r="6" fill="#c2933a" stroke="#ffffff" stroke-width="2" />
            </g>
        </svg>
        '''

def build_card_html(card):
    icon_svg = get_icon_svg(card["icon_type"])
    title_html = "<br/>".join(card["title_lines"])
    badge = card["badge"]

    html = f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<style>
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    width: 1080px;
    height: 480px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
  }}

  .banner-card {{
    width: 1080px;
    height: 480px;
    border-radius: 64px;
    background: linear-gradient(135deg, #fdfcfb 0%, #faf7f3 55%, #f6f3f1 100%);
    border: 6px solid #dcd6ce;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 48px;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8),
                inset 0 -2px 6px rgba(38, 37, 31, 0.03);
  }}

  /* Soft decorative ambient glow in top right */
  .banner-card::before {{
    content: '';
    position: absolute;
    top: -120px;
    right: -100px;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(43, 89, 209, 0.06) 0%, rgba(43, 89, 209, 0) 70%);
    pointer-events: none;
  }}

  /* Soft ambient tint in bottom left */
  .banner-card::after {{
    content: '';
    position: absolute;
    bottom: -100px;
    left: -80px;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(62, 122, 95, 0.05) 0%, rgba(62, 122, 95, 0) 70%);
    pointer-events: none;
  }}

  .icon-container {{
    flex: 0 0 320px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }}

  /* Subtle vertical divider matching the reference style */
  .divider {{
    width: 3px;
    height: 280px;
    background: linear-gradient(180deg, rgba(220, 214, 206, 0.1) 0%, #dcd6ce 30%, #dcd6ce 70%, rgba(220, 214, 206, 0.1) 100%);
    margin: 0 44px 0 24px;
    border-radius: 2px;
    flex-shrink: 0;
    z-index: 2;
  }}

  .content-container {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-right: 20px;
    z-index: 2;
  }}

  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    background: #e8edfb;
    color: #2b59d1;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 22px;
    border: 1.5px solid rgba(43, 89, 209, 0.2);
  }}

  .badge-dot {{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2b59d1;
  }}

  .card-title {{
    font-size: 52px;
    line-height: 1.14;
    font-weight: 800;
    color: #26251f; /* --ink */
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin: 0;
    word-break: break-word;
  }}

  /* Visual accent touch on card corner */
  .corner-accent {{
    position: absolute;
    bottom: 24px;
    right: 36px;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.45;
  }}
  .corner-accent span {{
    font-size: 16px;
    font-weight: 700;
    color: #7b786e;
    letter-spacing: 0.12em;
  }}
  .corner-accent svg {{
    width: 20px;
    height: 20px;
    fill: #2b59d1;
  }}
</style>
</head>
<body>
  <div class="banner-card">
    <div class="icon-container">
      {icon_svg}
    </div>
    <div class="divider"></div>
    <div class="content-container">
      <div class="badge">
        <span class="badge-dot"></span>
        <span>{badge}</span>
      </div>
      <h1 class="card-title">{title_html}</h1>
    </div>
    <div class="corner-accent">
      <span>АКВТ</span>
      <svg viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
    </div>
  </div>
</body>
</html>
'''
    return html

async def main():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1080, "height": 480})

        for card in CARDS:
            html = build_card_html(card)
            # Write temp HTML for inspection
            temp_html_path = os.path.join(ARTIFACTS_DIR, f"card_{card['id']}.html")
            with open(temp_html_path, "w", encoding="utf-8") as f:
                f.write(html)

            await page.goto(f"file:///{temp_html_path.replace(os.sep, '/')}")
            await page.wait_for_load_state("domcontentloaded")
            await asyncio.sleep(0.3)

            # Screenshot to PNG first
            png_path = os.path.join(ARTIFACTS_DIR, f"card_{card['id']}.png")
            await page.screenshot(path=png_path, omit_background=True)
            print(f"Captured {card['id']} -> {png_path}")

            # Open with Pillow, convert to WebP at high quality (quality=95)
            im = Image.open(png_path)

            # Target in AKVT repo
            target_webp_repo = os.path.join(OUTPUT_DIR, card["rel_path"])
            os.makedirs(os.path.dirname(target_webp_repo), exist_ok=True)
            im.save(target_webp_repo, format="WEBP", quality=95, method=6)
            print(f"Saved: {target_webp_repo}")

            # If legacy extension exists, save duplicate for compatibility
            if "alt_legacy" in card:
                target_legacy_repo = os.path.join(OUTPUT_DIR, card["alt_legacy"])
                # Save as same format or convert
                if target_legacy_repo.endswith(".png"):
                    im.save(target_legacy_repo, format="PNG")
                elif target_legacy_repo.endswith(".jpg"):
                    # RGB for JPG
                    im.convert("RGB").save(target_legacy_repo, format="JPEG", quality=95)
                print(f"Saved legacy compat: {target_legacy_repo}")

            # Target in alternate working dir (E:\аквт\site)
            target_webp_alt = os.path.join(ALT_OUTPUT_DIR, card["rel_path"])
            os.makedirs(os.path.dirname(target_webp_alt), exist_ok=True)
            im.save(target_webp_alt, format="WEBP", quality=95, method=6)
            if "alt_legacy" in card:
                target_legacy_alt = os.path.join(ALT_OUTPUT_DIR, card["alt_legacy"])
                if target_legacy_alt.endswith(".png"):
                    im.save(target_legacy_alt, format="PNG")
                elif target_legacy_alt.endswith(".jpg"):
                    im.convert("RGB").save(target_legacy_alt, format="JPEG", quality=95)

            # Also save directly in artifacts dir for visual inspection
            art_webp = os.path.join(ARTIFACTS_DIR, f"{os.path.basename(card['rel_path'])}")
            im.save(art_webp, format="WEBP", quality=95)

        await browser.close()
    print("ALL CARDS SUCCESSFULLY GENERATED AND SAVED!")

if __name__ == "__main__":
    asyncio.run(main())
