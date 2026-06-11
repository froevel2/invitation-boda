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

        // Trigger animations for the Hero elements after opening
        setTimeout(() => {
            triggerScrollAnimations();
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


    // --- 3. HERO PARALLAX EFFECT ---
    const heroBg = document.querySelector('.hero-parallax-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroBg) {
            // Translate the background slowly relative to scroll
            heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.35}px)`;
        }
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


    // --- 5. ANIMATE ON SCROLL (INTERSECTION OBSERVER) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Fallback to trigger visible elements immediately (like when starting below header)
    function triggerScrollAnimations() {
        const triggerBottom = window.innerHeight * 0.9;
        animatedElements.forEach(element => {
            const boxTop = element.getBoundingClientRect().top;
            if (boxTop < triggerBottom) {
                element.classList.add('animated');
            }
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
