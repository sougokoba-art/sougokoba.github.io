document.addEventListener('DOMContentLoaded', () => {
    // 1. スクロール時のヘッダーのエフェクト（グラスモーフィズムの強化）
    const nav = document.querySelector('.glass-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(255, 255, 255, 0.08)';
            nav.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.05)';
            nav.style.boxShadow = 'var(--glass-shadow)';
        }
    });

    // 2. マウスに追従する微かなハイライト
    const panels = document.querySelectorAll('.hover-glow');

    panels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            panel.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)`;
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.background = 'var(--glass-bg)';
        });
    });

    // 3. スムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // 4. Works カルーセル
    const track = document.getElementById('worksCarouselTrack');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (track) {
        let currentIndex = 0;
        const cards = track.querySelectorAll('.work-card');
        const total = cards.length;

        // カード幅 + gap を計算
        function getCardStep() {
            if (cards.length === 0) return 0;
            const style = getComputedStyle(track);
            const gap = parseFloat(style.gap) || 32;
            return cards[0].offsetWidth + gap;
        }

        function goTo(index) {
            currentIndex = Math.max(0, Math.min(index, total - 1));
            const offset = getCardStep() * currentIndex;
            track.style.transform = `translateX(-${offset}px)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
        }

        prevBtn && prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
        nextBtn && nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
        dots.forEach(dot => {
            dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
        });

        // タッチ / マウスドラッグ スワイプ
        let startX = 0;
        let isDragging = false;

        function onDragStart(clientX) {
            startX = clientX;
            isDragging = true;
            track.classList.add('dragging');
        }
        function onDragEnd(clientX) {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('dragging');
            const diff = startX - clientX;
            if (Math.abs(diff) > 50) {
                goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
            }
        }

        // Mouse
        track.addEventListener('mousedown', e => onDragStart(e.clientX));
        window.addEventListener('mouseup', e => onDragEnd(e.clientX));

        // Touch
        track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
        track.addEventListener('touchend', e => onDragEnd(e.changedTouches[0].clientX), { passive: true });

        // リサイズ時に再計算
        window.addEventListener('resize', () => goTo(currentIndex));
    }

    // 5. スクロール連動アニメーション (Intersection Observer)
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // 一度表示されたら監視を止める場合は以下を有効にする
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15, // 15%見えたら発火
        rootMargin: "0px 0px -50px 0px" // 画面下から50pxの位置で判定
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));
});
