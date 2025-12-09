// GSAP Animations pour FestiDex
gsap.registerPlugin(ScrollTrigger);

// Animation de la navbar au chargement
gsap.from('.navbar', {
    y: -100,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
});

// Animation du logo
gsap.from('.logo', {
    scale: 0,
    rotation: -180,
    duration: 1,
    ease: 'elastic.out(1, 0.5)',
    delay: 10
});

// Animation de la barre de recherche
gsap.from('.search', {
    x: 100,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.5
});

// Animation des liens de navigation
gsap.from('.nav-links li', {
    y: -50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.6
});

// Animation de la section hero
if (document.querySelector('.hero-section')) {
    gsap.from('.hero-text', {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.8
    });

    gsap.from('.hero-image', {
        x: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.8
    });
}

// Animation du titre de la galerie avec ScrollTrigger
if (document.querySelector('.gallery-title')) {
    gsap.from('.gallery-title', {
        scrollTrigger: {
            trigger: '.gallery-title',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
    });
}

// Animation pour la page de détails d'un artiste
if (document.querySelector('.artist-hero')) {
    gsap.from('.artist-hero-image', {
        scale: 0,
        rotation: 180,
        duration: 1,
        ease: 'back.out(1.7)'
    });

    gsap.from('.artist-hero-info', {
        x: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3
    });

    gsap.from('.artist-name', {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.5
    });

    gsap.from('.artist-meta p', {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.7
    });
}

// Animation des membres
if (document.querySelector('.members-section')) {
    gsap.from('.members-section h2', {
        scrollTrigger: {
            trigger: '.members-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    gsap.from('.member-item', {
        scrollTrigger: {
            trigger: '.members-list',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
    });
}

// Animation de la section concerts
if (document.querySelector('.concerts-section')) {
    gsap.from('.concerts-section h2', {
        scrollTrigger: {
            trigger: '.concerts-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
    });

    gsap.from('.concert-map', {
        scrollTrigger: {
            trigger: '.concert-map',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.concert-item', {
        scrollTrigger: {
            trigger: '.concerts-list',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Animation des filtres
if (document.querySelector('.filters-container')) {
    gsap.from('.filter-group', {
        y: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5
    });
}

// Animation du footer
gsap.from('.footer', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
});

// Animation de la page d'erreur
if (document.querySelector('.error-container')) {
    gsap.from('.error-title', {
        scale: 0,
        rotation: 360,
        duration: 1,
        ease: 'elastic.out(1, 0.5)'
    });

    gsap.from('.error-message', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out'
    });

    gsap.from('.btn-home', {
        scale: 0,
        duration: 0.6,
        delay: 1,
        ease: 'back.out(1.7)'
    });
}
