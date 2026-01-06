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
        size: Math.random() * 4 + 2,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
        life: 3600 + Math.random() * 2400,
        type: 'ambient'
    });
}
function createBurst(x, y, intensity = 3) {
    for (let i = 0; i < intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 3;
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 12 + 6,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            color: Math.random() > 0.3 ? '#ff4500' : '#ff2200',
            life: 3600 + Math.random() * 3600,
            type: 'burst',
            curlAngle: Math.random() * Math.PI * 2,
            curlSpeed: Math.random() * 0.1 + 0.05
        });
    }
}
function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX || (e.touches ? e.touches[0].clientX - rect.left : 0);
    mouse.y = e.clientY || (e.touches ? e.touches[0].clientY - rect.top : 0);
    createBurst(mouse.x, mouse.y, 3);
}
window.addEventListener('mousemove', handleInteraction);
window.addEventListener('touchmove', handleInteraction, { passive: true });
window.addEventListener('touchstart', handleInteraction, { passive: true });
document.querySelectorAll('.social-btn, .book-section h2').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        const rect = el.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
    });
    el.addEventListener('touchstart', (e) => {
        const rect = el.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
    });
});
setInterval(createAmbientParticle, 30);
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
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
            p.curlAngle += p.curlSpeed;
            p.speedX += Math.cos(p.curlAngle) * 0.4;
            p.speedY += Math.sin(p.curlAngle) * 0.4;
            if (p.life % 60 === 0 && p.life > 200 && Math.random() > 0.4) {
                const childAngle1 = Math.atan2(p.speedY, p.speedX) + Math.PI / 6;
                const childAngle2 = Math.atan2(p.speedY, p.speedX) - Math.PI / 6;
                const childSpeed = Math.sqrt(p.speedX**2 + p.speedY**2) * 0.75;
                particles.push({
                    x: p.x,
                    y: p.y,
                    size: p.size * 0.6,
                    speedX: Math.cos(childAngle1) * childSpeed,
                    speedY: Math.sin(childAngle1) * childSpeed,
                    color: p.color,
                    life: p.life * 0.85,
                    type: 'burst',
                    curlAngle: p.curlAngle,
                    curlSpeed: p.curlSpeed * 0.9
                });
                particles.push({
                    x: p.x,
                    y: p.y,
                    size: p.size * 0.6,
                    speedX: Math.cos(childAngle2) * childSpeed,
                    speedY: Math.sin(childAngle2) * childSpeed,
                    color: p.color,
                    life: p.life * 0.85,
                    type: 'burst',
                    curlAngle: p.curlAngle,
                    curlSpeed: p.curlSpeed * 0.9
                });
            }
        }
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        p.size *= 0.94;
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
        if (p.y < -30) p.y = canvas.height + 30;
        if (p.y > canvas.height + 30) p.y = -30;
        const maxLife = p.type === 'ambient' ? 6000 : 7200;
        const alpha = p.life / maxLife;
        if (p.life <= 0 || alpha < 0.01 || p.size <= 0.5) {
            particles.splice(i, 1);
            return;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    if (particles.length > 2500) particles.splice(0, 500);
    requestAnimationFrame(animate);
}
animate();
