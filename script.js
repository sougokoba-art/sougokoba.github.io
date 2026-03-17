document.addEventListener('DOMContentLoaded', () => {
    // Hide loader after page load
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500); // 0.5s pause for aesthetics
        }
    });

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

                // Parallax & Fleeing for Roe Particles
                roeParticles.forEach(p => {
                    const depth = parseFloat(p.dataset.depth);
                    
                    // Base parallax position
                    const parallaxX = (mouseX - window.innerWidth / 2) * depth * 0.5;
                    const parallaxY = (mouseY - window.innerHeight / 2) * depth * 0.5 + (scrollY * depth);
                    
                    // Fleeing logic (Physical Interaction)
                    const pRect = p.getBoundingClientRect();
                    const pCenterX = pRect.left + pRect.width / 2;
                    const pCenterY = pRect.top + pRect.height / 2;
                    
                    const dx = mouseX - pCenterX;
                    const dy = mouseY - pCenterY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const forceRadius = 180; // React radius
                    
                    let fleeX = 0;
                    let fleeY = 0;
                    
                    if (dist < forceRadius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (forceRadius - dist) / forceRadius;
                        fleeX = -Math.cos(angle) * force * 50; // Max 50px flee
                        fleeY = -Math.sin(angle) * force * 50;
                    }
                    
                    p.style.transform = `translate(${parallaxX + fleeX}px, ${parallaxY + fleeY}px)`;
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
    const spawnIkuraSplash = (centerX, centerY, isMassive = false) => {
        const baseCount = isMassive ? 16 : 8;
        const numParticles = baseCount + Math.floor(Math.random() * 8);
        
        const blobShapes = [
            '40% 60% 70% 30% / 40% 50% 60% 50%',
            '60% 40% 30% 70% / 50% 40% 60% 50%',
            '50% 50% 50% 50% / 30% 30% 70% 70%',
            '70% 30% 50% 50% / 30% 70% 50% 50%',
            '30% 70% 70% 30% / 70% 30% 30% 70%',
            '80% 20% 80% 20% / 20% 80% 20% 80%'
        ];

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('ikura-particle');
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            // Random angle
            const angle = isMassive
                ? Math.random() * Math.PI * 2
                : (Math.random() > 0.5 ? (Math.random() - 0.5) * 2.2 : Math.PI + (Math.random() - 0.5) * 2.2);

            // Nonlinear distance
            const distFactor = Math.pow(Math.random(), 1.5); 
            const maxDist = isMassive ? 180 : 80;
            const minDist = isMassive ? 20 : 15;
            const distance = minDist + distFactor * (maxDist - minDist);

            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            // Size variance
            const sizeRandom = Math.random();
            let w;
            if (sizeRandom < 0.5) {
                w = 2 + Math.random() * 3;
            } else if (sizeRandom < 0.85) {
                w = 5 + Math.random() * 6;
            } else {
                w = 12 + Math.random() * 12;
            }
            
            const h = w * (0.8 + Math.random() * 0.6); // Non-uniform h/w
            const angleDeg = Math.random() * 360; // Random initial rotation
            const shape = blobShapes[Math.floor(Math.random() * blobShapes.length)];

            particle.style.width = `${w}px`;
            particle.style.height = `${h}px`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.setProperty('--angle', `${angleDeg}deg`);
            particle.style.setProperty('--blob-shape', shape);
            
            const delay = Math.random() * 0.1;
            const duration = 0.5 + Math.random() * 0.4;
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.animationDelay = `${delay}s`;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), (delay + duration) * 1000 + 100);
        }
    };

    // Social link icons: splash on click, DELAY navigation for external links
    const socialLinksElements = document.querySelectorAll('.social-links a');
    socialLinksElements.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const isExternal = href && !href.startsWith('#');

            // Always spawn massive splash for direct link clicks
            const rect = this.getBoundingClientRect();
            spawnIkuraSplash(rect.left + rect.width / 2, rect.top + rect.height / 2, true);

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

            // Burst organic ink splats from card center
            const numParticles = 30 + Math.floor(Math.random() * 20);
            const blobShapes = [
                '40% 60% 70% 30% / 40% 50% 60% 50%',
                '60% 40% 30% 70% / 50% 40% 60% 50%',
                '50% 50% 50% 50% / 30% 30% 70% 70%',
                '70% 30% 50% 50% / 30% 70% 50% 50%',
                '30% 70% 70% 30% / 70% 30% 30% 70%',
                '80% 20% 80% 20% / 20% 80% 20% 80%'
            ];

            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.classList.add('ikura-particle');
                particle.style.position = 'fixed';
                particle.style.left = `${centerX}px`;
                particle.style.top = `${centerY}px`;

                const angle = Math.random() * Math.PI * 2;
                const distFactor = Math.pow(Math.random(), 1.8);
                const distance = 30 + distFactor * 250; 
                
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const angleDeg = Math.random() * 360;

                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);
                particle.style.setProperty('--angle', `${angleDeg}deg`);
                const shape = blobShapes[Math.floor(Math.random() * blobShapes.length)];
                particle.style.setProperty('--blob-shape', shape);

                const sizeRandom = Math.random();
                let w;
                if (sizeRandom < 0.4) w = 2 + Math.random() * 3;
                else if (sizeRandom < 0.8) w = 6 + Math.random() * 8;
                else w = 15 + Math.random() * 20;

                const h = w * (0.7 + Math.random() * 0.8);
                particle.style.width = `${w}px`;
                particle.style.height = `${h}px`;
                
                const delay = Math.random() * 0.15;
                const duration = 0.6 + Math.random() * 0.5;
                particle.style.setProperty('--duration', `${duration}s`);
                particle.style.animationDelay = `${delay}s`;

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), (delay + duration) * 1000 + 100);
            }

            // Navigate after effect
            setTimeout(() => {
                window.open(href, this.getAttribute('target') || '_self');
            }, 600);
        });
    });
});
