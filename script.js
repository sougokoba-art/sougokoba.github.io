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
        const originalCards = Array.from(track.querySelectorAll('.work-card'));
        const originalTotal = originalCards.length;

        // クローンを作成して無限ループを実現
        // [0,1,2,3] -> [0,1,2,3, 0,1,2,3]
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        const allCards = track.querySelectorAll('.work-card');

        // カード幅 + gap を計算
        function getCardStep() {
            if (allCards.length === 0) return 0;
            const style = getComputedStyle(track);
            const gap = parseFloat(style.gap) || 32;
            return allCards[0].offsetWidth + gap;
        }

        let isAnimating = false;

        function goTo(index, animate = true) {
            if (isAnimating && animate) return;
            if (animate) isAnimating = true;

            currentIndex = index;
            const step = getCardStep();
            const offset = step * currentIndex;

            track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
            track.style.transform = `translateX(-${offset}px)`;

            // ドットの更新 (originalTotal で割った余り)
            const dotIndex = ((currentIndex % originalTotal) + originalTotal) % originalTotal;
            dots.forEach((d, i) => d.classList.toggle('active', i === dotIndex));
        }

        // 遷移終了時の処理 (シームレスなループの核)
        track.addEventListener('transitionend', () => {
            isAnimating = false;

            // originalTotal枚目(index 4)以降のスライド(クローン)に到達したら、瞬時にオリジナルの位置へ戻す
            if (currentIndex >= originalTotal) {
                goTo(currentIndex - originalTotal, false);
            }
            // 0枚目より前に戻ろうとしていた場合も同様にクローン末尾へ飛ばす
            else if (currentIndex < 0) {
                goTo(currentIndex + originalTotal, false);
            }
        });

        prevBtn && prevBtn.addEventListener('click', () => {
            if (currentIndex <= 0) {
                // 瞬時にクローン側の末尾へ移動してから1枚前に戻るアニメーション
                goTo(originalTotal, false);
                setTimeout(() => goTo(originalTotal - 1), 10);
            } else {
                goTo(currentIndex - 1);
            }
        });

        nextBtn && nextBtn.addEventListener('click', () => {
            goTo(currentIndex + 1);
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetIndex = parseInt(dot.dataset.index);
                // 現在位置がクローン側ならクローン側の該当位置へ、そうでなければオリジナル側へ
                if (currentIndex >= originalTotal) {
                    goTo(targetIndex + originalTotal);
                } else {
                    goTo(targetIndex);
                }
            });
        });

        // タッチ / マウスドラッグ スワイプ
        let startX = 0;
        let isDragging = false;

        function onDragStart(clientX) {
            if (isAnimating) return;
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
                if (diff > 0) {
                    goTo(currentIndex + 1);
                } else {
                    if (currentIndex <= 0) {
                        goTo(originalTotal, false);
                        setTimeout(() => goTo(originalTotal - 1), 10);
                    } else {
                        goTo(currentIndex - 1);
                    }
                }
            }
        }

        // Mouse
        track.addEventListener('mousedown', e => onDragStart(e.clientX));
        window.addEventListener('mouseup', e => onDragEnd(e.clientX));

        // Touch
        track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
        track.addEventListener('touchend', e => onDragEnd(e.changedTouches[0].clientX), { passive: true });

        // リサイズ時に再計算
        window.addEventListener('resize', () => goTo(currentIndex, false));
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
