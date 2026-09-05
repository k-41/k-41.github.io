document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('termBody');
    if (!container) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var blocks = Array.prototype.slice.call(container.querySelectorAll('.block'));

    function showInstantly() {
        blocks.forEach(function (block) {
            var cmdEl = block.querySelector('.cmd');
            var cursorEl = block.querySelector('.type-cursor');
            if (cmdEl) cmdEl.textContent = cmdEl.getAttribute('data-text') || '';
            if (cursorEl) cursorEl.style.display = 'none';
            block.classList.add('revealed');
        });
    }

    if (reduceMotion) {
        showInstantly();
        return;
    }

    var TYPE_SPEED = 34;
    var PAUSE_AFTER_TYPE = 220;
    var PAUSE_BETWEEN_BLOCKS = 260;

    function typeInto(el, text, cb) {
        var i = 0;
        (function tick() {
            if (i <= text.length) {
                el.textContent = text.slice(0, i);
                i++;
                setTimeout(tick, TYPE_SPEED);
            } else {
                cb();
            }
        })();
    }

    function runStep(index) {
        if (index >= blocks.length) return;
        var block = blocks[index];
        var cmdEl = block.querySelector('.cmd');
        var cursorEl = block.querySelector('.type-cursor');

        if (!cmdEl) {
            block.classList.add('revealed');
            setTimeout(function () { runStep(index + 1); }, PAUSE_BETWEEN_BLOCKS);
            return;
        }

        var text = cmdEl.getAttribute('data-text') || '';
        typeInto(cmdEl, text, function () {
            setTimeout(function () {
                if (cursorEl) cursorEl.style.display = 'none';
                block.classList.add('revealed');
                setTimeout(function () { runStep(index + 1); }, PAUSE_BETWEEN_BLOCKS);
            }, PAUSE_AFTER_TYPE);
        });
    }

    runStep(0);
});
