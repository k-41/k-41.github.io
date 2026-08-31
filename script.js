document.addEventListener('DOMContentLoaded', function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var sequence = [
        { cmdEl: 'cmdWhoami', cursorEl: 'cursorWhoami', blockEl: 'blockWhoami', text: 'whoami' },
        { cmdEl: 'cmdLs',     cursorEl: 'cursorLs',     blockEl: 'blockLs',     text: 'ls -la ./writeups' },
        { cmdEl: 'cmdCat',    cursorEl: 'cursorCat',    blockEl: 'blockCat',    text: 'cat welcome.txt' }
    ];

    function showInstantly() {
        sequence.forEach(function (step) {
            document.getElementById(step.cmdEl).textContent = step.text;
            document.getElementById(step.cursorEl).style.display = 'none';
            document.getElementById(step.blockEl).classList.add('revealed');
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
        if (index >= sequence.length) return;
        var step = sequence[index];
        var cmdEl = document.getElementById(step.cmdEl);
        var cursorEl = document.getElementById(step.cursorEl);
        var blockEl = document.getElementById(step.blockEl);

        typeInto(cmdEl, step.text, function () {
            setTimeout(function () {
                cursorEl.style.display = 'none';
                blockEl.classList.add('revealed');
                setTimeout(function () { runStep(index + 1); }, PAUSE_BETWEEN_BLOCKS);
            }, PAUSE_AFTER_TYPE);
        });
    }

    runStep(0);
});
