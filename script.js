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

    // Create Background Roe Particles
    const createRoeParticles = () => {
        const count = 12;
        const container = document.body;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('roe-float');
            const size = 6 + Math.random() * 8;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.opacity = 0.1 + Math.random() * 0.3;
            // Variable speed for parallax
            particle.dataset.depth = 0.05 + Math.random() * 0.15;
            container.appendChild(particle);
        }
    };
    createRoeParticles();

    const roeParticles = document.querySelectorAll('.roe-float');
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Parallax for Background Decorative Text
                decorativeTexts.forEach(text => {
                    const speed = parseFloat(text.getAttribute('data-speed')) || 0.1;
                    const yPos = -(scrollY * speed);
                    text.style.transform = `translateY(${yPos}px)`;
                });

                // Parallax for Roe Particles
                roeParticles.forEach(p => {
                    const depth = parseFloat(p.dataset.depth);
                    const moveX = (mouseX - window.innerWidth / 2) * depth * 0.5;
                    const moveY = (mouseY - window.innerHeight / 2) * depth * 0.5 + (scrollY * depth);
                    p.style.transform = `translate(${moveX}px, ${moveY}px)`;
                });

                if (bgContainer) {
                    bgContainer.style.backgroundPositionY = `calc(50% + ${scrollY * 0.05}px)`;
                }

                const dynamicSaturate = 180 + Math.min(scrollY / 10, 50);
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
        let isAnimating = false;
        const gap = 24; // 1.5rem = 24px default assumed

        // Assign original index for dots
        const cards = track.querySelectorAll('.work-card');
        cards.forEach((card, idx) => {
            card.dataset.index = idx;
        });

        const carouselLabel = document.getElementById('carouselLabel');

        const updateDots = () => {
            const currentFirst = parseInt(track.firstElementChild.dataset.index);
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentFirst);
            });
            // Update label with current card's title
            if (carouselLabel) {
                const titleEl = track.firstElementChild.querySelector('h4');
                carouselLabel.textContent = titleEl ? titleEl.textContent : '';
            }
        };
        updateDots();

        const moveNext = () => {
            if (isAnimating) return;
            isAnimating = true;
            const cardWidth = track.firstElementChild.offsetWidth;

            track.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            track.style.transform = `translateX(-${cardWidth + gap}px)`;

            setTimeout(() => {
                track.style.transition = 'none';
                track.appendChild(track.firstElementChild);
                track.style.transform = 'translateX(0)';
                updateDots();
                isAnimating = false;
            }, 400);
        };

        const movePrev = () => {
            if (isAnimating) return;
            isAnimating = true;
            const cardWidth = track.firstElementChild.offsetWidth;

            track.insertBefore(track.lastElementChild, track.firstElementChild);
            track.style.transition = 'none';
            track.style.transform = `translateX(-${cardWidth + gap}px)`;

            // Force layout
            track.offsetHeight;

            track.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            track.style.transform = 'translateX(0)';

            setTimeout(() => {
                updateDots();
                isAnimating = false;
            }, 400);
        };

        prevBtn.addEventListener('click', movePrev);
        nextBtn.addEventListener('click', moveNext);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (isAnimating) return;
                const currentFirst = parseInt(track.firstElementChild.dataset.index);
                if (currentFirst === index) return;

                let diff = index - currentFirst;
                if (diff < 0) diff += cards.length;

                // Shift multiple instantly for dot click
                for (let i = 0; i < diff; i++) track.appendChild(track.firstElementChild);
                updateDots();
            });
        });

        // Touch swipe logic
        let dragStartX = 0;
        let swipeDiff = 0;

        track.addEventListener('touchstart', (e) => {
            dragStartX = e.touches[0].clientX;
            swipeDiff = 0;
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            swipeDiff = currentX - dragStartX;
        }, { passive: true });

        track.addEventListener('touchend', () => {
            if (swipeDiff < -50) moveNext();
            else if (swipeDiff > 50) movePrev();
        });
    }

    // ----------------------------------------------------------------
    // 5. Dynamic Navigation Active Status
    // ----------------------------------------------------------------
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const viewportCenter = window.innerHeight / 2;

        document.querySelectorAll('section[id]').forEach(section => {
            const rect = section.getBoundingClientRect();
            // If the top of the section is above the center of the viewport
            if (rect.top <= viewportCenter) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }, { passive: true });

    // ----------------------------------------------------------------
    // 4. Scroll Reveal Intersection Observer
    // ----------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Trigger a subtle 'pop' splash when a section enters
                const rect = entry.target.getBoundingClientRect();
                const splashX = rect.left + Math.random() * rect.width;
                const splashY = rect.top + 20; // Near the top edge

                if (typeof spawnIkuraSplash === 'function') {
                    spawnIkuraSplash(splashX, splashY);
                }

                // Once revealed, no need to observe anymore
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ----------------------------------------------------------------
    // 6. Ikura Splash Effect on Social Links (with delayed navigation)
    // ----------------------------------------------------------------
    const spawnIkuraSplash = (centerX, centerY) => {
        const numParticles = 16 + Math.floor(Math.random() * 8);
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('ikura-particle');
            particle.style.position = 'fixed';
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            let angle;
            if (Math.random() > 0.5) {
                angle = (Math.random() - 0.5) * 2.5;
            } else {
                angle = Math.PI + (Math.random() - 0.5) * 2.5;
            }
            const distance = 40 + Math.random() * 80;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const size = 3 + Math.random() * 10;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animationDelay = `${Math.random() * 0.05}s`;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    };

    // Social link icons: splash on click, DELAY navigation for external links
    const socialLinksElements = document.querySelectorAll('.social-links a');
    socialLinksElements.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const isExternal = href && !href.startsWith('#');

            // Always spawn splash
            const rect = this.getBoundingClientRect();
            spawnIkuraSplash(rect.left + rect.width / 2, rect.top + rect.height / 2);

            // Delay external link navigation so effect plays out
            if (isExternal) {
                e.preventDefault();
                setTimeout(() => {
                    window.open(href, this.getAttribute('target') || '_self');
                }, 500);
            }
        });
    });

    // Work cards: spawn a quick burst then navigate after short delay
    const workCards = document.querySelectorAll('.work-card[href]');
    workCards.forEach(card => {
        card.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            e.preventDefault();

            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Burst more particles from card center
            const numParticles = 20 + Math.floor(Math.random() * 8);
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.classList.add('ikura-particle');
                particle.style.position = 'fixed';
                particle.style.left = `${centerX}px`;
                particle.style.top = `${centerY}px`;

                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 120;
                particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
                particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

                const size = 4 + Math.random() * 12;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.animationDelay = `${Math.random() * 0.08}s`;

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 1100);
            }

            // Navigate after effect
            setTimeout(() => {
                window.open(href, this.getAttribute('target') || '_self');
            }, 600);
        });
    });
});
