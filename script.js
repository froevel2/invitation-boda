/* ==========================================================================
   INTERACTIVE WEDDING INVITATION LOGIC (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. WELCOME MODAL & AUDIO CONTROL ---
    const welcomeModal = document.getElementById('welcome-modal');
    const btnOpenInvitation = document.getElementById('btn-open-envelope');
    const bgMusic = document.getElementById('bg-music');
    const btnMusicToggle = document.getElementById('btn-music-toggle');
    let isMusicPlaying = false;

    // Open Invitation and start music
    btnOpenInvitation.addEventListener('click', () => {
        // Hide modal
        welcomeModal.classList.add('fade-out');
        
        // Show floating music control
        btnMusicToggle.classList.remove('hidden');
        btnMusicToggle.classList.add('playing');
        
        // Play music with soft volume fade-in
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            fadeAudio(bgMusic, 0.25, 1500, 'in');
        }).catch(err => {
            console.log("La reproducción automática fue bloqueada por el navegador: ", err);
            // In case it's blocked, set toggle button state to paused
            btnMusicToggle.classList.remove('playing');
            btnMusicToggle.classList.add('paused');
            isMusicPlaying = false;
        });

        // Trigger Hero entry animations
        setTimeout(() => {
            if (typeof startHeroAnimations === 'function') {
                startHeroAnimations();
            }
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh(); // Recalculate ScrollTrigger positions
            }
        }, 800);
    });

    // Music float button click toggle
    btnMusicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            // Fade out and pause
            fadeAudio(bgMusic, 0, 800, 'out', () => {
                bgMusic.pause();
                btnMusicToggle.classList.remove('playing');
                btnMusicToggle.classList.add('paused');
            });
            isMusicPlaying = false;
        } else {
            // Play and fade in
            bgMusic.play().then(() => {
                btnMusicToggle.classList.remove('paused');
                btnMusicToggle.classList.add('playing');
                fadeAudio(bgMusic, 0.25, 800, 'in');
            });
            isMusicPlaying = true;
        }
    });

    // Helper function to fade audio volume in or out smoothly
    function fadeAudio(audio, targetVolume, duration, direction, callback) {
        const startVolume = audio.volume;
        const volumeDiff = targetVolume - startVolume;
        const intervalTime = 50; // ms
        const steps = duration / intervalTime;
        const volumeStep = volumeDiff / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            let nextVolume = startVolume + (volumeStep * currentStep);
            
            // Boundary checks
            if (direction === 'in' && nextVolume >= targetVolume) {
                audio.volume = targetVolume;
                clearInterval(interval);
                if (callback) callback();
            } else if (direction === 'out' && nextVolume <= targetVolume) {
                audio.volume = targetVolume;
                clearInterval(interval);
                if (callback) callback();
            } else {
                audio.volume = Math.max(0, Math.min(1, nextVolume));
            }
        }, intervalTime);
    }


    // --- 2. HEADER STYLING ON SCROLL ---
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // --- 3. GSAP SCROLL STORYTELLING & PARALLAX ---
    let gsapActive = false;
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsapActive = true;
        gsap.registerPlugin(ScrollTrigger);

        // Remove CSS animation classes to prevent conflict with GSAP's from() animations
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.remove('animate-on-scroll', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right', 'fade-in');
        });

    // Dynamic Sparkles Generator
    createSparkles();

    // Hero background Parallax and Zoom
    const heroBg = document.querySelector('.hero-parallax-bg');
    if (heroBg) {
        gsap.fromTo(heroBg, 
            { scale: 1.2, y: '0%' },
            { 
                scale: 1.05, 
                y: '20%',
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    }

    // Parallax Leaves based on data-speed
    document.querySelectorAll('.parallax-leaf').forEach(leaf => {
        const speed = parseFloat(leaf.getAttribute('data-speed')) || 0.1;
        gsap.to(leaf, {
            y: () => window.innerHeight * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: leaf.closest('section') || leaf.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });


    // --- 4. COUNTDOWN TIMER ---
    // Target date: Sábado 12 de Diciembre de 2026, 5:00 PM (17:00:00) - Hora de Perú (UTC-5)
    const weddingDate = new Date('2026-12-12T17:00:00-05:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference <= 0) {
            // Event has started / completed
            document.querySelector('.countdown-container').innerHTML = `
                <div class="card-luxury text-center" style="width: 100%; max-width: 500px; padding: 30px;">
                    <h3 style="font-family: var(--font-title); font-size: 2rem; color: var(--color-gold-dark);">¡LLEGÓ EL GRAN DÍA!</h3>
                    <p style="font-size: 0.9rem; color: var(--color-secondary); margin-top: 10px;">Hoy unimos nuestras vidas para siempre. ¡Gracias por celebrar con nosotros!</p>
                </div>
            `;
            clearInterval(countdownInterval);
            return;
        }

        // Time calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format to pad leading zeros
        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    // Run immediately and set interval
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);


    // --- 5. GSAP SCROLL TRIGGERS ---

    // Split text into spans for letter by letter animation
    function splitTextIntoSpans(element) {
        const text = element.innerText;
        element.innerHTML = '';
        for (let char of text) {
            const span = document.createElement('span');
            span.classList.add('char');
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.innerText = char;
            }
            element.appendChild(span);
        }
    }

    // Hero Entry Animation (called when welcome modal closes)
    function startHeroAnimations() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            splitTextIntoSpans(heroTitle);
            gsap.fromTo(heroTitle.querySelectorAll('.char'), 
                { opacity: 0, y: 50, rotateX: -60 },
                { opacity: 1, y: 0, rotateX: 0, stagger: 0.04, duration: 1, ease: "back.out(1.7)" }
            );
        }
        gsap.fromTo('.hero-subtitle', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
        gsap.fromTo('.hero-date', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.6 });
        gsap.fromTo('.hero-btn', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.8 });
    }

    // Floating Sparkles Generator
    function createSparkles() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sparkleContainer = document.createElement('div');
            sparkleContainer.classList.add('sparkle-particles');
            section.appendChild(sparkleContainer);
            
            // 8 particles per section
            for (let i = 0; i < 8; i++) {
                const sparkle = document.createElement('div');
                sparkle.classList.add('sparkle');
                sparkle.style.left = `${Math.random() * 100}%`;
                sparkle.style.top = `${Math.random() * 100}%`;
                sparkle.style.animationDelay = `${Math.random() * 8}s`;
                sparkle.style.animationDuration = `${6 + Math.random() * 8}s`;
                sparkleContainer.appendChild(sparkle);
            }
        });
    }

    // Odometer/Count-Up Effect on Countdown trigger
    ScrollTrigger.create({
        trigger: '#countdown',
        start: 'top 85%',
        onEnter: () => {
            const nums = document.querySelectorAll('.countdown-num');
            nums.forEach(num => {
                const targetVal = parseInt(num.innerText) || 0;
                if (targetVal > 0) {
                    let currentVal = 0;
                    const duration = 1200; // 1.2s
                    const stepTime = Math.max(Math.floor(duration / targetVal), 15);
                    const interval = setInterval(() => {
                         currentVal++;
                         if (currentVal >= targetVal) {
                             num.innerText = String(targetVal).padStart(2, '0');
                             clearInterval(interval);
                         } else {
                             num.innerText = String(currentVal).padStart(2, '0');
                         }
                    }, stepTime);
                 }
            });
        },
        once: true
    });

    // Timeline Alternating Slide-Ins
    gsap.utils.toArray('.timeline-item').forEach(item => {
        const isLeft = item.classList.contains('fade-in-left');
        gsap.from(item, {
            opacity: 0,
            x: isLeft ? -100 : 100,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Gallery Album Staggered Reveal
    gsap.from('.gallery-item', {
        opacity: 0,
        scale: 0.8,
        y: 50,
        stagger: 0.08,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    // Details Cards Entrance
    gsap.from('.event-card', {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 1,
        ease: 'back.out(1.2)',
        scrollTrigger: {
            trigger: '.event-cards-container',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    // Map Curtain Reveal
    ScrollTrigger.create({
        trigger: '.map-reveal-wrapper',
        start: 'top 80%',
        onEnter: () => {
            const wrap = document.querySelector('.map-reveal-wrapper');
            if (wrap) wrap.classList.add('revealed');
        },
        once: true
    });

    // Dress Code Cards Entrance
    gsap.from('.dress-card', {
        opacity: 0,
        scale: 0.9,
        y: 40,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.dress-code-options',
            start: 'top 85%',
            toggleActions: 'play none none none'
        }
    });

    // Cronograma Items Staggered Reveal
    gsap.from('.cronograma-item', {
        opacity: 0,
        x: -45,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.cronograma-list',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    // Section Headers Entrance
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            opacity: 0,
            y: 35,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Countdown Container Entrance
    gsap.from('.countdown-container', {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#countdown',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    // Gift Card Entrance
    gsap.from('.gift-card', {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#lluvia-sobres',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    // Confirm Action Box Entrance
    gsap.from('.confirm-action-box', {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#confirmacion',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    } else {
        // Fallback in case GSAP fails to load (offline or CDN blocked)
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('animated');
        });
    }


    // --- 6. GALLERY LIGHTBOX & TOUCH NAVIGATION ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentImageIndex = 0;
    const galleryImages = [];

    // Map all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        galleryImages.push(img.src);
        
        item.addEventListener('click', () => {
            currentImageIndex = index;
            openLightbox(img.src);
        });
    });

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scrolling
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex];
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex];
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNextImage);
    lightboxPrev.addEventListener('click', showPrevImage);

    // Close lightbox on clicking dark background (outside image)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // Touch support (Swipe gestures) for Mobile Lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });

    function handleSwipeGesture() {
        const threshold = 50; // swipe minimum distance in pixels
        if (touchEndX < touchStartX - threshold) {
            // Swiped Left -> Show next image
            showNextImage();
        }
        if (touchEndX > touchStartX + threshold) {
            // Swiped Right -> Show previous image
            showPrevImage();
        }
    }


    // --- 7. COPY BANK DETAILS TO CLIPBOARD ---
    const btnCopyAccounts = document.querySelectorAll('.btn-copy-account');
    const copyToast = document.getElementById('copy-toast');

    btnCopyAccounts.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const textToCopy = btn.getAttribute('data-clipboard');
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show success toast
                copyToast.classList.add('active');
                
                // Change copy icon to success check icon temporarily
                const originalIconClass = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
                
                setTimeout(() => {
                    copyToast.classList.remove('active');
                    btn.innerHTML = originalIconClass;
                }, 2000);
            }).catch(err => {
                console.error("Fallo al copiar texto al portapapeles: ", err);
            });
        });
    });

});
