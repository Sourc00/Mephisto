const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let particles = [];
let mouse = { x: 0, y: 0 };

// New: Spawn ambient embers randomly across the FULL screen
function createAmbientParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5, // Gentle drift
        speedY: Math.random() * 1 - 0.5,
        color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
        life: 150 + Math.random() * 100, // Longer life for constant presence
        type: 'ambient'
    });
}

// Burst on cursor/touch (unchanged—still explodes fire where you interact)
function createBurst(x, y, intensity = 15) {
    for (let i = 0; i < intensity; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 8 + 4,
            speedX: Math.random() * 12 - 6,
            speedY: Math.random() * 12 - 6,
            color: Math.random() > 0.3 ? '#ff4500' : '#ff2200',
            life: 50 + Math.random() * 40,
            type: 'burst'
        });
    }
}

function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX || (e.touches ? e.touches[0].clientX - rect.left : 0);
    mouse.y = e.clientY || (e.touches ? e.touches[0].clientY - rect.top : 0);
    createBurst(mouse.x, mouse.y, 20);
}

window.addEventListener('mousemove', handleInteraction);
window.addEventListener('touchmove', handleInteraction, { passive: true });
window.addEventListener('touchstart', handleInteraction, { passive: true });

// Button bursts (unchanged)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
        const rect = btn.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    });
    btn.addEventListener('touchstart', (e) => {
        const rect = btn.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
        e.preventDefault();
    });
});

// Spawn ambient particles more frequently for full-screen coverage
setInterval(createAmbientParticle, 100); // Was 200—now denser

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        // Ambient particles get gently pushed by cursor/touch
        if (p.type === 'ambient') {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 200) { // Wider influence
                p.speedX += dx / dist * 0.3;
                p.speedY += dy / dist * 0.3;
            }
        }

        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        p.size *= 0.98;

        // Wrap around edges for eternal feel (optional—feels infinite)
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        if (p.life <= 0 || p.size <= 0.3) {
            particles.splice(i, 1);
            return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = p.life / 200;
        ctx.fill();
    });

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

animate();
