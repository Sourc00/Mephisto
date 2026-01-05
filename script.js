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

function createAmbientParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
        life: 400 + Math.random() * 200,
        type: 'ambient'
    });
}

function createBurst(x, y, intensity = 15) {
    for (let i = 0; i < intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 10 + 5,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            color: Math.random() > 0.3 ? '#ff4500' : '#ff2200',
            life: 120 + Math.random() * 80, // Longer decay ~3-5 seconds
            type: 'burst',
            curlAngle: Math.random() * Math.PI * 2,
            curlSpeed: Math.random() * 0.08 + 0.03 // Curl wind strength
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

document.querySelectorAll('.social-btn, .book-section h2').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        const rect = el.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    });
    el.addEventListener('touchstart', (e) => {
        const rect = el.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
        e.preventDefault();
    });
});

setInterval(createAmbientParticle, 500);

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Strong fade — no ghosts
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        if (p.type === 'ambient') {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 200) {
                p.speedX += dx / dist * 0.3;
                p.speedY += dy / dist * 0.3;
            }
        }

        if (p.type === 'burst') {
            // Curl wind force — swirling motion
            p.curlAngle += p.curlSpeed;
            p.speedX += Math.cos(p.curlAngle) * 0.3;
            p.speedY += Math.sin(p.curlAngle) * 0.3;
        }

        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        p.size *= 0.96; // Slow shrink for longer trails

        // Wrap
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const maxLife = p.type === 'ambient' ? 600 : 200;
        const alpha = p.life / maxLife;

        if (p.life <= 0 || alpha < 0.05 || p.size <= 0.5) {
            particles.splice(i, 1);
            return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
    });

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (particles.length > 1000) particles.splice(0, 200);

    requestAnimationFrame(animate);
}

animate();
