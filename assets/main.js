(function () {
    'use strict';

    /* ---------- Мобильное меню ---------- */
    var header = document.querySelector('.site_header');
    var burger = document.querySelector('.burger');
    var nav = document.getElementById('site_nav');

    function closeMenu() {
        header.classList.remove('is_menu_open');
        if (burger) burger.setAttribute('aria-expanded', 'false');
    }

    if (header && burger && nav) {
        burger.addEventListener('click', function () {
            var willOpen = !header.classList.contains('is_menu_open');
            header.classList.toggle('is_menu_open', willOpen);
            burger.setAttribute('aria-expanded', String(willOpen));
        });

        // Закрыть по клику на пункт меню
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeMenu();
        });

        // Закрыть при скролле страницы
        window.addEventListener('scroll', function () {
            if (header.classList.contains('is_menu_open')) closeMenu();
        }, { passive: true });

        // Закрыть при переходе на десктоп
        window.addEventListener('resize', function () {
            if (window.innerWidth > 850) closeMenu();
        });
    }

    /* ---------- Появление блоков при скролле ---------- */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var selector = '.section_head, .feature_card, .step_card, .cat_card, ' +
        '.about_media, .about_body, .lead_content';
    var targets = Array.prototype.slice.call(document.querySelectorAll(selector));

    if (reduce || !('IntersectionObserver' in window)) {
        return; // без анимации — контент виден по умолчанию
    }

    targets.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is_visible');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
})();

/* ---------- Печатающийся заголовок hero ---------- */
(function () {
    'use strict';
    var title = document.querySelector('.hero_title');
    if (!title) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var full = title.textContent;
    title.setAttribute('aria-label', full);      // для скринридеров — полный текст
    title.textContent = '';

    // Невидимая копия резервирует точные габариты блока
    var ghost = document.createElement('span');
    ghost.className = 'type_ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = full;

    // Слой печати поверх «призрака»
    var live = document.createElement('span');
    live.className = 'type_live';
    live.setAttribute('aria-hidden', 'true');
    var textNode = document.createElement('span');
    var caret = document.createElement('span');
    caret.className = 'type_caret';
    caret.textContent = '|';
    live.appendChild(textNode);
    live.appendChild(caret);

    title.appendChild(ghost);
    title.appendChild(live);

    var i = 0;
    function tick() {
        i++;
        textNode.textContent = full.slice(0, i);
        if (i < full.length) {
            setTimeout(tick, 55 + Math.random() * 45);
        } else {
            setTimeout(function () { caret.classList.add('type_caret_done'); }, 1400);
        }
    }
    setTimeout(tick, 400);
})();

/* ---------- Слайдер «Примеры работ» (нативный scroll-snap) ---------- */
(function () {
    'use strict';
    var viewport = document.querySelector('.works_viewport');
    if (!viewport) return;

    var track = viewport.querySelector('.works_track');
    var slides = Array.prototype.slice.call(track.querySelectorAll('.work_slide'));
    var arrows = Array.prototype.slice.call(document.querySelectorAll('.works_arrow'));
    if (!slides.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var active = 0;
    var ticking = false;

    function slideCenter(el) { return el.offsetLeft + el.offsetWidth / 2; }
    function targetLeft(i) { return slideCenter(slides[i]) - track.clientWidth / 2; }

    function goTo(i, instant) {
        i = Math.max(0, Math.min(i, slides.length - 1));
        track.scrollTo({ left: targetLeft(i), behavior: (instant || reduce) ? 'auto' : 'smooth' });
    }

    // Активным считаем слайд, чей центр ближе всего к центру области
    function sync() {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var nearest = 0, best = Infinity;
        slides.forEach(function (s, i) {
            var d = Math.abs(slideCenter(s) - mid);
            if (d < best) { best = d; nearest = i; }
        });
        active = nearest;
        slides.forEach(function (s, i) { s.classList.toggle('is_active', i === active); });
    }

    track.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () { sync(); ticking = false; });
    }, { passive: true });

    arrows.forEach(function (a) {
        a.addEventListener('click', function () {
            goTo(active + parseInt(a.getAttribute('data-dir'), 10), false);
        });
    });
    slides.forEach(function (s, i) {
        s.addEventListener('click', function () { if (i !== active) goTo(i, false); });
    });

    // Пересчёт только при реальной смене ширины (адресная строка меняет лишь высоту)
    var lastWidth = viewport.clientWidth;
    window.addEventListener('resize', function () {
        var w = viewport.clientWidth;
        if (w === lastWidth) return;
        lastWidth = w;
        goTo(active, true);
    });

    window.addEventListener('load', function () { goTo(active, true); sync(); });
    goTo(0, true);
    sync();
})();
