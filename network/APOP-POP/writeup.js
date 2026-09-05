document.addEventListener('DOMContentLoaded', function () {
    initProgressBar();
    initCopyButtons();
    initLightbox();
    initBackToTop();
});

function initProgressBar() {
    var fill = document.getElementById('progressFill');
    if (!fill) return;

    function update() {
        var doc = document.documentElement;
        var scrollTop = doc.scrollTop || document.body.scrollTop;
        var height = doc.scrollHeight - doc.clientHeight;
        var pct = height > 0 ? (scrollTop / height) * 100 : 0;
        fill.style.width = pct + '%';
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
}

function initCopyButtons() {
    var blocks = document.querySelectorAll('.term-article pre');
    blocks.forEach(function (pre) {
        if (pre.parentElement.classList.contains('pre-wrap')) return;

        var wrap = document.createElement('div');
        wrap.className = 'pre-wrap';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.textContent = 'copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        wrap.appendChild(btn);

        btn.addEventListener('click', function () {
            var text = pre.textContent;
            var done = function () {
                btn.textContent = 'copied';
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = 'copy';
                    btn.classList.remove('copied');
                }, 1600);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(function () {
                    fallbackCopy(text, done);
                });
            } else {
                fallbackCopy(text, done);
            }
        });
    });
}

function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
    cb();
}

function initLightbox() {
    var images = document.querySelectorAll('.shot img');
    if (!images.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Close image">&times;</button>' +
        '<img src="" alt="">';
    document.body.appendChild(overlay);

    var overlayImg = overlay.querySelector('img');
    var closeBtn = overlay.querySelector('.lightbox-close');
    var lastFocused = null;

    function open(src, alt) {
        lastFocused = document.activeElement;
        overlayImg.src = src;
        overlayImg.alt = alt || '';
        overlay.classList.add('open');
        closeBtn.focus();
        document.addEventListener('keydown', onKeydown);
    }

    function close() {
        overlay.classList.remove('open');
        document.removeEventListener('keydown', onKeydown);
        if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
        if (e.key === 'Escape') close();
    }

    images.forEach(function (img) {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'Enlarge image: ' + (img.alt || 'screenshot'));
        img.addEventListener('click', function () { open(img.src, img.alt); });
        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(img.src, img.alt);
            }
        });
    });

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
    });
    closeBtn.addEventListener('click', close);
}

function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '&#8593;';
    document.body.appendChild(btn);

    function toggle() {
        if (window.scrollY > 480) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
}
