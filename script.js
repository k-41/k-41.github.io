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
        initInteractiveShell();
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

    function runStep(index, onDone) {
        if (index >= sequence.length) {
            if (onDone) onDone();
            return;
        }
        var step = sequence[index];
        var cmdEl = document.getElementById(step.cmdEl);
        var cursorEl = document.getElementById(step.cursorEl);
        var blockEl = document.getElementById(step.blockEl);

        typeInto(cmdEl, step.text, function () {
            setTimeout(function () {
                cursorEl.style.display = 'none';
                blockEl.classList.add('revealed');
                setTimeout(function () { runStep(index + 1, onDone); }, PAUSE_BETWEEN_BLOCKS);
            }, PAUSE_AFTER_TYPE);
        });
    }

    runStep(0, function () {
        initInteractiveShell();
    });
});

function initInteractiveShell() {
    var input = document.getElementById('termInput');
    var log = document.getElementById('interactiveLog');
    var promptFinal = document.getElementById('promptFinal');
    if (!input || !log) return;

    var denials = [
        "bash: {cmd}: command not found",
        "permission denied",
        "operation not permitted",
        "access denied \u2014 nice try though",
        "not sure that's a real *nix command...",
        "k-41: command not found. this is a website, not a shell"
    ];
    var lastDenialIndex = -1;

    function randomDenial(cmd) {
        var i;
        do { i = Math.floor(Math.random() * denials.length); }
        while (denials.length > 1 && i === lastDenialIndex);
        lastDenialIndex = i;
        return denials[i].replace('{cmd}', cmd.split(' ')[0]);
    }

    function respond(cmd) {
        var lower = cmd.toLowerCase();
        var first = lower.split(' ')[0];

        if (first === 'sudo') {
            return 'k-41 is not in the sudoers file. this incident will be reported';
        }
        if (first === 'whoami') {
            return "nice try \u2014 you're not k-41";
        }
        if (first === 'ls' || first === 'dir') {
            return 'already did that \u2014 scroll up';
        }
        if (first === 'rm' || first === 'sudo rm') {
            return 'operation not permitted';
        }
        if (first === 'exit' || first === 'logout') {
            return "there's no escaping a static site";
        }
        if (first === 'help' || first === 'man') {
            return 'no manual entry for \'' + cmd.split(' ')[0] + '\'. this page is not a real shell';
        }
        if (first === 'sl') {
            return 'command not found. (you meant ls, and yes that was a train joke)';
        }
        return randomDenial(cmd);
    }

    function appendLine(cmd, response) {
        var echoLine = document.createElement('p');
        echoLine.className = 'prompt-line';
        echoLine.innerHTML =
            '<span class="prompt-user">k-41@ctf</span>' +
            '<span class="prompt-colon">:</span>' +
            '<span class="prompt-path">~</span>' +
            '<span class="prompt-sign">$</span>' +
            '<span class="cmd"></span>';
        echoLine.querySelector('.cmd').textContent = cmd;
        log.appendChild(echoLine);

        if (response) {
            var respLine = document.createElement('p');
            respLine.className = 'resp-line';
            respLine.textContent = response;
            log.appendChild(respLine);
        }

        log.scrollTop = log.scrollHeight;
    }

    input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        var raw = input.value;
        var cmd = raw.trim();
        input.value = '';
        if (!cmd.length) return;

        if (cmd.toLowerCase() === 'clear') {
            log.innerHTML = '';
            return;
        }
        appendLine(cmd, respond(cmd));
    });

    input.addEventListener('focus', function () {
        promptFinal.classList.add('focused');
    });
    input.addEventListener('blur', function () {
        promptFinal.classList.remove('focused');
    });

    document.querySelector('.window').addEventListener('click', function (e) {
        if (e.target.closest('a, input')) return;
        input.focus();
    });

    input.focus();
}
