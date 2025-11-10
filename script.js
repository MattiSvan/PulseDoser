const s = { maxRate: 2000, speed: 50, pulseOn: 1, feedRate: 15 };

function setFunnel(maxRate) {
    s.maxRate = maxRate;
    render();
    selectFunnelInfo(maxRate);
}

function step(field, delta, min, max) {
    let v = s[field] || 0;
    v += delta;
    if (v < min) v = min;
    if (v > max) v = max;
    s[field] = parseFloat(v.toFixed(2));
    render();
}

function calc() {
    const { maxRate, speed, pulseOn, feedRate } = s;

    const cal = maxRate * speed / 100;

    const maxFeedRate =
        pulseOn > 0
            ? (cal / 1000) * (60 / (1 + (0.5 / pulseOn)))
            : 0;

    let pulseOff = 0;
    if (cal > 0 && feedRate > 0) {
        const feedGs = feedRate * 1000;
        const ratio = feedGs / cal;
        if (ratio > 0) {
            pulseOff = pulseOn * ((60 - ratio) / ratio);
        }
    }

    return {
        cal: Math.max(0, cal),
        maxFeedRate: Math.max(0, maxFeedRate),
        pulseOff: Math.max(0, pulseOff)
    };
}

function fmt(x, d) {
    return (Math.round(x * 10 ** d) / 10 ** d)
        .toFixed(d)
        .replace('.', ',');
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function render() {
    const r = calc();

    setText("maxRate", s.maxRate);
    setText("speed", s.speed);
    setText("pulseOn", fmt(s.pulseOn, 1));
    setText("feedRate", s.feedRate);

    setText("cal", fmt(r.cal, 0));
    setText("maxFeedRate", fmt(r.maxFeedRate, 0));
    setText("pulseOnDose", fmt(s.pulseOn, 1));
    setText("pulseOff", fmt(r.pulseOff, 1));

    const box = document.getElementById("pulseOffBox");
    const cont = document.getElementById("pulseOffContainer");

    if (!box || !cont) return;

    if (r.pulseOff < 0.5) {
        box.classList.add("alert");
        cont.classList.add("show-alert");
    } else {
        box.classList.remove("alert");
        cont.classList.remove("show-alert");
    }
}

function loadInfo(url) {
    const info = document.getElementById("infoContent");
    if (!info) return;

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("HTTP " + res.status + " for " + url);
            }
            return res.text();
        })
        .then(html => {
            info.innerHTML = html;
        })
        .catch(err => {
            console.log(err);
            info.innerHTML = "<p>Could not load info (" + url + ").</p>";
        });
}


function selectFunnelInfo(funnel) {
    const btn2000 = document.getElementById("btn2000");
    const btn1000 = document.getElementById("btn1000");

    if (funnel === 2000) {
        if (btn2000) btn2000.classList.add("active");
        if (btn1000) btn1000.classList.remove("active");
        loadInfo("text/info_standard_2000.html");
    } else {
        if (btn1000) btn1000.classList.add("active");
        if (btn2000) btn2000.classList.remove("active");
        loadInfo("text/info_raw_1000.html");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    selectFunnelInfo(2000);
    render();
});

// Hleður texta inn í top og bottom panel
function loadPanelContent(url, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("File not found");
            return response.text();
        })
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
        })
        .catch(error => {
            document.getElementById(elementId).innerHTML =
                `<p style="color:#C00000;">Error loading ${url}: ${error.message}</p>`;
        });
}

// Hleður bæði textaskrárnar
document.addEventListener("DOMContentLoaded", () => {
    loadPanelContent("text/intro.html", "introPanel");
    loadPanelContent("text/outro.html", "outroPanel");
});