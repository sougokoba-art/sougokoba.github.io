document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------
    // 1. 3D Tilt Effect for Glass Elements (Physicality)
    // ----------------------------------------------------------------
    const tiltElements = document.querySelectorAll('.tilt-element');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate mouse position relative to the element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation degrees (up to roughly 8 degrees)
            const tiltX = ((y - centerY) / centerY) * -8; // Invert Y
            const tiltY = ((x - centerX) / centerX) * 8;

            // Calculate glare rotation based on mouse position
            // Center is 180deg, moving mouse shifts it
            const glareAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) - 90;

            // Apply CSS variables
            el.style.setProperty('--tilt-x', `${tiltX}deg`);
            el.style.setProperty('--tilt-y', `${tiltY}deg`);
            el.style.setProperty('--glare-angle', `${glareAngle}deg`);
        });

        el.addEventListener('mouseleave', () => {
            // Reset on mouse leave with a smooth transition (handled in CSS)
            el.style.setProperty('--tilt-x', '0deg');
            el.style.setProperty('--tilt-y', '0deg');
        });
    });

    // ----------------------------------------------------------------
    // 2. Parallax, Magazine Typography, & Dynamic Refraction
    // ----------------------------------------------------------------
    const decorativeTexts = document.querySelectorAll('.bg-deco-text');
    const bgContainer = document.querySelector('.background-image-container');
    const root = document.documentElement;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Parallax for Background Decorative Text (Magazine-style)
                decorativeTexts.forEach(text => {
                    const speed = parseFloat(text.getAttribute('data-speed')) || 0.1;
                    const yPos = -(scrollY * speed);
                    text.style.transform = `translateY(${yPos}px)`;
                });

                // Subtle background image parallax for depth
                // Move bg down slightly as we scroll down
                if (bgContainer) {
                    bgContainer.style.backgroundPositionY = `calc(50% + ${scrollY * 0.05}px)`;
                }

                // Dynamic Refraction (レンズ効果の変化)
                // As we scroll faster/further, increase contrast/saturate to simulate passing through thick glass
                // Just a subtle hint of dynamic change is usually enough
                const dynamicSaturate = 180 + Math.min(scrollY / 10, 50); // Base 180, up to 230
                root.style.setProperty('--dynamic-saturate', `${dynamicSaturate}%`);

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // ----------------------------------------------------------------
    // 3. Carousel Drag Logic (from previous implementations)
    // ----------------------------------------------------------------
    const track = document.getElementById('worksCarouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dots = document.querySelectorAll('.carousel-dot');

    if (track && prevBtn && nextBtn && dots.length > 0) {
        let currentIndex = 0;
        let startX = 0;
        let isDragging = false;
        let currentTranslate = 0;
        let prevTranslate = 0;

        // Calculate max index based on items and flex-basis
        const cards = track.querySelectorAll('.work-card');
        const gap = 24; // 1.5rem = 24px default assumed
        let cardWidth = cards[0].offsetWidth;
        const itemsPerView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        const maxIndex = Math.max(0, cards.length - itemsPerView);

        // Initialize dots
        const updateDots = () => {
            // ... simplified dot logic ...
        };

        const updateCarousel = () => {
            // ... simple slide logic ...
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;
            cardWidth = cards[0].offsetWidth; // recalculate on resize

            const translate = -(currentIndex * (cardWidth + gap));
            track.style.transform = `translateX(${translate}px)`;

            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        };

        prevBtn.addEventListener('click', () => {
            currentIndex = Math.max(0, currentIndex - 1);
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = Math.min(maxIndex, currentIndex + 1);
            updateCarousel();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });

        // Basic Resize listener
        window.addEventListener('resize', () => {
            updateCarousel();
        });
    }
});
