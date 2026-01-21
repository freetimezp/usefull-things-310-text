/* --------------------
   SPLIT TEXT
-------------------- */
const text = document.getElementById("text");
text.innerHTML = [...text.textContent].map((l) => `<span>${l}</span>`).join("");
const letters = document.querySelectorAll(".shock-text span");

/* --------------------
PARTICLES
-------------------- */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let w, h;
let particles = [];

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.6 + 0.2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
            this.reset();
        }
    }
    draw() {
        ctx.fillStyle = `rgba(120,160,255,${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 450; i++) {
    particles.push(new Particle());
}

/* --------------------
SHOCK EFFECT
-------------------- */
function shockPulse() {
    gsap.fromTo(".flash", { opacity: 0 }, { opacity: 1, duration: 0.06, yoyo: true, repeat: 1 });

    particles.forEach((p) => {
        p.vx += (Math.random() - 0.5) * 3.5;
        p.vy += (Math.random() - 0.5) * 3.5;
    });

    electricShock();
    triggerShockwave();
}

/* --------------------
TEXT ANIMATION
-------------------- */
const tl = gsap.timeline({ delay: 0.5 });

tl.to(letters, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: "back.out(3)",
    stagger: 0.08,
    onStart: shockPulse,
})

    .to(letters, {
        y: () => gsap.utils.random(-20, 20),
        x: () => gsap.utils.random(-10, 10),
        duration: 0.06,
        repeat: 4,
        yoyo: true,
        ease: "power4.inOut",
        stagger: {
            each: 0.02,
            from: "random",
        },
        onRepeat: shockPulse,
    })

    .to(letters, {
        textShadow: "0 0 40px rgba(160,200,255,1)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
    });

/* --------------------
RANDOM FLICKER
-------------------- */
gsap.to(letters, {
    opacity: () => gsap.utils.random(0.6, 1),
    duration: 0.05,
    repeat: -1,
    yoyo: true,
    stagger: {
        each: 0.03,
        from: "random",
    },
});

const arcCanvas = document.getElementById("arcs");
const arcCtx = arcCanvas.getContext("2d");

function resizeArcs() {
    arcCanvas.width = window.innerWidth;
    arcCanvas.height = window.innerHeight;
}
resizeArcs();
window.addEventListener("resize", resizeArcs);

function getLetterCenters() {
    return [...letters].map((l) => {
        const r = l.getBoundingClientRect();
        return {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
        };
    });
}

function drawLightning(a, b) {
    const segments = 12;
    arcCtx.beginPath();
    arcCtx.moveTo(a.x, a.y);

    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = gsap.utils.interpolate(a.x, b.x, t) + gsap.utils.random(-15, 15);
        const y = gsap.utils.interpolate(a.y, b.y, t) + gsap.utils.random(-15, 15);
        arcCtx.lineTo(x, y);
    }

    arcCtx.lineTo(b.x, b.y);
    arcCtx.strokeStyle = "rgba(180,220,255,0.9)";
    arcCtx.lineWidth = 4;
    arcCtx.shadowBlur = 20;
    arcCtx.shadowColor = "#9fb8ff";
    arcCtx.stroke();
}

function electricShock() {
    arcCtx.clearRect(0, 0, arcCanvas.width, arcCanvas.height);

    const centers = getLetterCenters();

    for (let i = 0; i < 10; i++) {
        if (Math.random() > 0.3) continue;
        drawLightning(centers[i], centers[i + 1]);
    }

    gsap.to(arcCanvas, {
        opacity: 0,
        duration: 0.12,
        onComplete: () => {
            arcCtx.clearRect(0, 0, arcCanvas.width, arcCanvas.height);
            arcCanvas.style.opacity = 1;
        },
    });
}

let shockRadius = 0;
let shockActive = false;

function triggerShockwave() {
    shockRadius = 0;
    shockActive = true;
}

function drawShockwave() {
    if (!shockActive) return;

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, shockRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(160,200,255,${1 - shockRadius / 600})`;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 40;
    ctx.shadowColor = "#aaccff";
    ctx.stroke();

    shockRadius += 22;

    if (shockRadius > 600) shockActive = false;
}

function animateParticles() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
        p.update();
        p.draw();
    });

    drawShockwave();
    requestAnimationFrame(animateParticles);
}

animateParticles();
