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

// Increased spawn rate for more ambient particles (every 200ms now)
function createAmbientParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
        life: 1200 + Math.random() * 600, // 3x longer life → avg ~1500 frames
        type: 'ambient'
    });
}

function createBurst(x, y, intensity = 10) { // Reduced intensity for fewer cursor particles
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
            life: 360 + Math.random() * 240, // 3x longer decay ~9-15 seconds avg
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
    createBurst(mouse.x, mouse.y, 10); // Fewer for cursor trail
}

window.addEventListener('mousemove', handleInteraction);
window.addEventListener('touchmove', handleInteraction, { passive: true });
window.addEventListener('touchstart', handleInteraction, { passive: true });

document.querySelectorAll('.social-btn, .book-section h2').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        const rect = el.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15); // Slightly reduced for buttons too
    });
    el.addEventListener('touchstart', (e) => {
        const rect = el.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
        e.preventDefault();
    });
});

// Increased ambient spawn rate → more background particles
setInterval(createAmbientParticle, 200); // Was 500 → now more frequent

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Balanced fade for clean vanishing
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

            // Fractal branching: Occasionally spawn children for geometric fractal effect
            if (p.life % 80 === 0 && p.life > 150 && Math.random() > 0.5) {
                // Spawn 2 children at +/- 45 degrees
                const childAngle1 = Math.atan2(p.speedY, p.speedX) + Math.PI / 4;
                const childAngle2 = Math.atan2(p.speedY, p.speedX) - Math.PI / 4;
                const childSpeed = Math.sqrt(p.speedX**2 + p.speedY**2) * 0.7;
                particles.push({
                    x: p.x,
                    y: p.y,
                    size: p.size * 0.7,
                    speedX: Math.cos(childAngle1) * childSpeed,
                    speedY: Math.sin(childAngle1) * childSpeed,
                    color: p.color,
                    life: p.life * 0.8,
                    type: 'burst',
                    curlAngle: p.curlAngle,
                    curlSpeed: p.curlSpeed * 0.8
                });
                particles.push({
                    x: p.x,
                    y: p.y,
                    size: p.size * 0.7,
                    speedX: Math.cos(childAngle2) * childSpeed,
                    speedY: Math.sin(childAngle2) * childSpeed,
                    color: p.color,
                    life: p.life * 0.8,
                    type: 'burst',
                    curlAngle: p.curlAngle,
                    curlSpeed: p.curlSpeed * 0.8
                });
            }
        }

        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        p.size *= 0.95; // Slow shrink for longer visibility

        // Wrap
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const maxLife = p.type === 'ambient' ? 1800 : 600; // 3x longer alpha decay
        const alpha = p.life / maxLife;

        if (p.life <= 0 || alpha < 0.02 || p.size <= 0.3) {
            particles.splice(i, 1);
            return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
    });

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (particles.length > 1200) particles.splice(0, 300);

    requestAnimationFrame(animate);
}

animate();

