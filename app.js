document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     MOBILE NAVIGATION MENU
     ========================================================================== */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      const isOpen = hamburger.classList.contains('active');
      mobileMenu.style.display = isOpen ? 'flex' : 'none';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.style.display = 'none';
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================================
     CUSTOM CURSOR PHYSICS
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  const cursorText = document.getElementById('cursor-text');

  let mouseX = 0, mouseY = 0; // Actual mouse position
  let outlineX = 0, outlineY = 0; // Lagging outline position

  // Hide cursor element on touch devices or if mouse hasn't moved yet
  let hasMoved = false;

  window.addEventListener('mousemove', (e) => {
    if (!hasMoved) {
      if (cursorDot && cursorOutline) {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
      }
      hasMoved = true;
    }

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  // Smooth lagging outline using requestAnimationFrame
  function updateOutline() {
    // Linear interpolation: current position + (target position - current position) * damping factor
    const ease = 0.15;
    outlineX += (mouseX - outlineX) * ease;
    outlineY += (mouseY - outlineY) * ease;

    if (cursorOutline) {
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
    }

    requestAnimationFrame(updateOutline);
  }
  requestAnimationFrame(updateOutline);

  // Hover States for Custom Cursor
  const hoverLinks = document.querySelectorAll('a, button, select, input, textarea, .card-arrow, .hover-theme-trigger');

  hoverLinks.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hover-link');
      if (cursorText) {
        // Set dynamic text for special elements
        if (el.classList.contains('submit-btn')) {
          cursorText.textContent = 'SEND';
        } else if (el.classList.contains('register-challenge-btn')) {
          cursorText.textContent = 'JOIN';
        } else if (el.classList.contains('card-arrow') || el.classList.contains('hover-theme-trigger')) {
          cursorText.textContent = 'VIEW';
        } else {
          cursorText.textContent = 'GO';
        }
      }
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hover-link');
      if (cursorText) cursorText.textContent = '';
    });
  });

  /* ==========================================================================
     SCROLL REVEAL & STATS COUNTER ENGINE
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const statsSection = document.getElementById('about');
  let statsAnimated = false;

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);

        // Check if stats are in view and animate them
        if (entry.target.id === 'about' && !statsAnimated) {
          animateStats();
          statsAnimated = true;
        }
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
  if (statsSection) revealObserver.observe(statsSection);

  // Helper function for count animations
  function animateStats() {
    const counters = [
      { id: 'counter-zones', target: 12, suffix: '+' },
      { id: 'counter-athletes', target: 5000, suffix: '+' },
      { id: 'counter-success', target: 99, suffix: '%' }
    ];

    counters.forEach(counter => {
      const el = document.getElementById(counter.id);
      if (!el) return;

      let start = 0;
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out quad formula
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * counter.target);

        // Add formatting (commas for thousands)
        if (counter.target >= 1000) {
          el.textContent = currentValue.toLocaleString() + counter.suffix;
        } else {
          el.textContent = currentValue + counter.suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (counter.target >= 1000) {
            el.textContent = counter.target.toLocaleString() + counter.suffix;
          } else {
            el.textContent = counter.target + counter.suffix;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  /* ==========================================================================
     INTERACTIVE THEME SHIFTER (TRAINING ZONES)
     ========================================================================== */
  const themeTriggers = document.querySelectorAll('.hover-theme-trigger');
  const programsSection = document.getElementById('programs');

  if (programsSection) {
    themeTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', () => {
        const theme = trigger.getAttribute('data-theme');
        programsSection.setAttribute('data-active-theme', theme);
      });
    });
  }

  /* ==========================================================================
     DRAGGABLE BEFORE/AFTER SLIDER
     ========================================================================== */
  const slider = document.getElementById('ba-slider');
  const beforeImgWrap = document.getElementById('before-img-wrap');
  const sliderHandle = document.getElementById('slider-handle');

  if (slider && beforeImgWrap && sliderHandle) {
    let isDragging = false;

    // Helper to calculate slider position
    function setSliderPosition(x) {
      const rect = slider.getBoundingClientRect();
      const relativeX = x - rect.left;
      let percentage = (relativeX / rect.width) * 100;

      // Bound between 0 and 100
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;

      slider.style.setProperty('--slider-pos', `${percentage}%`);
    }

    // Drag start
    function startDrag(e) {
      isDragging = true;
      document.body.classList.add('hover-drag');
      if (cursorText) cursorText.textContent = 'DRAG';

      const pageX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      setSliderPosition(pageX);
    }

    // Drag move
    function drag(e) {
      if (!isDragging) return;
      // Prevent default scrolling on mobile when dragging
      e.preventDefault();

      const pageX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      setSliderPosition(pageX);
    }

    // Drag end
    function stopDrag() {
      isDragging = false;
      document.body.classList.remove('hover-drag');
      if (cursorText) cursorText.textContent = '';
    }

    // Event listeners for mouse
    slider.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDrag);

    // Event listeners for touch
    slider.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', stopDrag);

    // Trigger cursor tag indicator
    slider.addEventListener('mouseenter', () => {
      document.body.classList.add('hover-drag');
      if (cursorText) cursorText.textContent = 'DRAG';
    });
    slider.addEventListener('mouseleave', () => {
      if (!isDragging) {
        document.body.classList.remove('hover-drag');
        if (cursorText) cursorText.textContent = '';
      }
    });
  }

  /* ==========================================================================
     TRAINER SHOWCASE CAROUSEL
     ========================================================================== */
  const trainersTrack = document.getElementById('trainers-track');
  const trainerPrev = document.getElementById('trainer-prev');
  const trainerNext = document.getElementById('trainer-next');

  if (trainersTrack && trainerPrev && trainerNext) {
    let currentIndex = 0;

    function getTrainersPerView() {
      if (window.innerWidth <= 680) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      const cards = trainersTrack.children.length;
      return Math.max(0, cards - getTrainersPerView());
    }

    function updateCarousel() {
      const cardWidth = trainersTrack.children[0].getBoundingClientRect().width;
      const gap = 30; // matches gap in CSS track
      const translation = currentIndex * (cardWidth + gap);

      trainersTrack.style.transform = `translateX(-${translation}px)`;

      // Update disabled button states
      trainerPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
      trainerPrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

      trainerNext.style.opacity = currentIndex >= getMaxIndex() ? '0.3' : '1';
      trainerNext.style.pointerEvents = currentIndex >= getMaxIndex() ? 'none' : 'auto';
    }

    trainerNext.addEventListener('click', () => {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateCarousel();
      }
    });

    trainerPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    // Handle viewport resize to update alignment
    window.addEventListener('resize', () => {
      const maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) {
        currentIndex = maxIdx;
      }
      updateCarousel();
    });

    // Initialize button states
    updateCarousel();
  }

  /* ==========================================================================
     TESTIMONIALS SLIDER
     ========================================================================== */
  const testimonialsTrack = document.getElementById('testimonials-track');
  const testPrev = document.getElementById('test-prev');
  const testNext = document.getElementById('test-next');

  if (testimonialsTrack && testPrev && testNext) {
    let testIndex = 0;
    const slidesCount = testimonialsTrack.children.length;

    function updateTestimonials() {
      testimonialsTrack.style.transform = `translateX(-${testIndex * 100}%)`;

      // Update disabled states
      testPrev.style.opacity = testIndex === 0 ? '0.3' : '1';
      testPrev.style.pointerEvents = testIndex === 0 ? 'none' : 'auto';

      testNext.style.opacity = testIndex === slidesCount - 1 ? '0.3' : '1';
      testNext.style.pointerEvents = testIndex === slidesCount - 1 ? 'none' : 'auto';
    }

    testNext.addEventListener('click', () => {
      if (testIndex < slidesCount - 1) {
        testIndex++;
        updateTestimonials();
      }
    });

    testPrev.addEventListener('click', () => {
      if (testIndex > 0) {
        testIndex--;
        updateTestimonials();
      }
    });

    // Initialize
    updateTestimonials();
  }

  /* ==========================================================================
     CONTACT FORM & SUCCESS SPLASH ACTION
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formWrapper = document.getElementById('contact-form-wrapper');

  if (contactForm && formWrapper) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const name = document.getElementById('user-name').value;
      const email = document.getElementById('user-email').value;
      const objective = document.getElementById('user-objective').options[document.getElementById('user-objective').selectedIndex].text;

      // Animate transition to success splash page
      formWrapper.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      formWrapper.style.opacity = '0';
      formWrapper.style.transform = 'scale(0.95)';

      setTimeout(() => {
        // Build raw street Success graphic layout
        formWrapper.innerHTML = `
          <div class="success-card">
            <span class="success-icon">🎯</span>
            <h3 class="success-title">TARGET LOCKED!</h3>
            <p class="success-body" style="margin-bottom: 20px;">
              Yo, <strong>${name.toUpperCase()}</strong>! Your entry credentials have been signed into the databases.
            </p>
            <p class="success-body" style="margin-bottom: 30px; font-family: var(--font-syne); font-size: 13px; color: var(--lime);">
              OBJECTIVE SELECTED: [${objective}]
            </p>
            <p class="success-body" style="margin-bottom: 30px;">
              We sent a verification telemetry code to <strong>${email}</strong>. Scan it at the yard gates to unlock your priority passes.
            </p>
            <button class="brutalist-btn bg-lime text-black border-lime" onclick="window.location.reload();" style="font-size: 12px; padding: 10px 20px;">
              RESET INTERFACE
            </button>
          </div>
        `;

        formWrapper.style.borderColor = 'var(--lime)';
        formWrapper.style.boxShadow = '10px 10px 0px 0px rgba(198, 255, 0, 0.2)';
        formWrapper.style.opacity = '1';
        formWrapper.style.transform = 'scale(1.0)';
      }, 300);
    });
  }

  /* ==========================================================================
     GRAFFITI SPLATTERS & DUST ACCENTS PARALLAX
     ========================================================================== */
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Parallax background items
    const parallaxSplashes = document.querySelectorAll('.splash-element, .drip-element');
    parallaxSplashes.forEach((splash, index) => {
      // Alternate movement direction and speeds
      const speed = (index + 1) * 0.15;
      const offset = scrollY * speed;

      // Keep structural transform values
      if (index === 0) {
        splash.style.transform = `translateY(${offset}px)`;
      } else if (index === 1) {
        splash.style.transform = `translateY(${-offset}px) rotate(120deg)`;
      } else {
        splash.style.transform = `translateY(${offset * 0.5}px)`;
      }
    });

    // Parallax hero text background marquee speed shift
    const heroMarquee = document.querySelector('.hero-marquee .marquee-slide');
    if (heroMarquee) {
      const scrollFactor = scrollY * 0.2;
      heroMarquee.style.transform = `translateX(-${scrollFactor}px)`;
    }
  });

});
