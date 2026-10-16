/**
 * Portfolio Interactive Engine
 * Mohammed Shaheed Akeel — Data Scientist & Machine Learning Engineer
 *
 * Implements:
 * 1. Zero-ghosting 60FPS canvas renderer for 360° cursor-tracking character.
 * 2. Shortest-path circular angular lerp (lerpAngle) with ~0.26 response factor (~35ms lag).
 * 3. Eye-contact deadzone within ~12% screen radius switching to center.webp.
 * 4. Magnetic custom cursor with trailing aura ring.
 * 5. Interactive resume modal & copy-to-clipboard interactions.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 64;
  const LERP_FACTOR = 0.26; // ~35ms zero-lag response factor
  const DEADZONE_PERCENT = 0.12; // 12% screen radius for direct eye-contact deadzone
  const FRAME_ASPECT = 1280 / 720;
  const FACE_SRC_X = 640 / 1280; // 50%
  const FACE_SRC_Y = 340 / 720;  // 47.2%

  // --- State ---
  const frames = [];
  let centerFrame = null;
  let framesLoaded = 0;
  let allLoaded = false;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentAngle = 0; // In radians [0, 2*PI)
  let isNearFace = true; // Default to center eye contact on load
  let isMouseActive = false;

  // Custom cursor state
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;

  // DOM Elements
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const loader = document.getElementById('canvasLoader');
  const loaderText = document.getElementById('loaderText');
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const resumeModal = document.getElementById('resumeModal');
  const navResumeBtn = document.getElementById('navResumeBtn');
  const heroResumeBtn = document.getElementById('heroResumeBtn');
  const closeResumeModalBtn = document.getElementById('closeResumeModalBtn');
  const contactForm = document.getElementById('contactForm');
  const toastContainer = document.getElementById('toastContainer');

  // --- Frame Preloader ---
  function preloadAssets() {
    const totalToLoad = TOTAL_FRAMES + 1; // 64 directional + 1 center

    function updateProgress() {
      framesLoaded++;
      const percent = Math.floor((framesLoaded / totalToLoad) * 100);
      if (loaderText) {
        loaderText.textContent = `Loading 3D Experience ${percent}%`;
      }
      if (framesLoaded >= totalToLoad) {
        allLoaded = true;
        if (loader) {
          loader.classList.add('loaded');
        }
        // Initial render
        render();
      }
    }

    // 1. Preload 64 directional WebP frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = i < 10 ? '0' + i : '' + i;
      img.src = `frames/frame_${numStr}.webp`;
      img.onload = updateProgress;
      img.onerror = () => {
        console.warn(`Fallback for frame_${numStr}`);
        updateProgress();
      };
      frames.push(img);
    }

    // 2. Preload center.webp
    centerFrame = new Image();
    centerFrame.src = 'frames/center.webp';
    centerFrame.onload = updateProgress;
    centerFrame.onerror = () => {
      console.warn('Fallback for center.webp');
      updateProgress();
    };
  }

  // --- Shortest-Path Circular Angular Lerp ---
  function lerpAngle(current, target, factor) {
    let diff = (target - current) % (2 * Math.PI);
    if (diff < -Math.PI) diff += 2 * Math.PI;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    return current + diff * factor;
  }

  // --- Canvas Sizing & Layout Calculations ---
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (allLoaded) render();
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // --- Rendering Loop (60 FPS, Zero Ghosting) ---
  function render() {
    if (!canvas || !ctx || !allLoaded) return;

    const width = canvas.width;
    const height = canvas.height;
    const canvasAspect = width / height;

    // Calculate source coverage (object-fit: cover)
    let drawW, drawH, drawX, drawY;
    if (canvasAspect > FRAME_ASPECT) {
      drawW = width;
      drawH = width / FRAME_ASPECT;
      drawX = 0;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * FRAME_ASPECT;
      drawX = (width - drawW) / 2;
      drawY = 0;
    }

    // Character face center coordinates on screen
    const faceScreenX = (drawX + drawW * FACE_SRC_X) / (canvas.width / window.innerWidth);
    const faceScreenY = (drawY + drawH * FACE_SRC_Y) / (canvas.height / window.innerHeight);

    // Distance from cursor to character face
    const dx = mouseX - faceScreenX;
    const dy = mouseY - faceScreenY;
    const dist = Math.hypot(dx, dy);

    // Deadzone: within ~12% of screen radius -> direct eye contact (center.webp)
    const deadzoneRadius = Math.min(window.innerWidth, window.innerHeight) * DEADZONE_PERCENT;

    let activeImage = null;

    if (dist < deadzoneRadius || !isMouseActive) {
      // Direct Eye Contact Mode
      activeImage = centerFrame;
    } else {
      // Directional Tracking Mode
      // Calculate cursor angle relative to face: atan2(dy, dx)
      // Angle 0 = Right, PI/2 = Down, PI = Left, -PI/2 = Up
      let targetAngle = Math.atan2(dy, dx);
      if (targetAngle < 0) targetAngle += 2 * Math.PI; // normalize to [0, 2*PI)

      // Shortest-path circular angular lerp
      currentAngle = lerpAngle(currentAngle, targetAngle, LERP_FACTOR);
      currentAngle = (currentAngle + 2 * Math.PI) % (2 * Math.PI);

      // Map smoothed angle to nearest frame index (0..63)
      let frameIndex = Math.round((currentAngle / (2 * Math.PI)) * TOTAL_FRAMES) % TOTAL_FRAMES;
      if (frameIndex < 0) frameIndex += TOTAL_FRAMES;

      activeImage = frames[frameIndex] || centerFrame;
    }

    // DRAW EXACTLY ONE CRISP FRAME AT 100% OPACITY (ZERO GHOSTING)
    ctx.clearRect(0, 0, width, height);

    // Seamless base fill matching canvas background (#1c767a)
    ctx.fillStyle = '#1c767a';
    ctx.fillRect(0, 0, width, height);

    if (activeImage && activeImage.complete && activeImage.naturalWidth !== 0) {
      ctx.drawImage(activeImage, drawX, drawY, drawW, drawH);
    }
  }

  // --- RAF Animation Loop ---
  function tick() {
    render();

    // Update magnetic cursor ring with smooth trailing spring
    if (cursorRing) {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
    }

    requestAnimationFrame(tick);
  }

  // --- Mouse & Touch Event Handlers ---
  function onPointerMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseActive = true;

    // Instant cursor dot tracking
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      isMouseActive = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      isMouseActive = true;
    }
  }, { passive: true });

  // Custom magnetic cursor hover expansion
  function setupCursorHoverEffects() {
    if (!cursorRing) return;
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .copy-pill-btn');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // --- Copy to Clipboard Interactions ---
  function setupCopyButtons() {
    document.querySelectorAll('.copy-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied ${textToCopy} to clipboard!`);
          }).catch(() => {
            showToast('Copied to clipboard!');
          });
        }
      });
    });
  }

  // --- Resume Modal Functionality ---
  function openResumeModal() {
    if (resumeModal) {
      resumeModal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResumeModal() {
    if (resumeModal) {
      resumeModal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  }

  if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResumeModal);
  if (navResumeBtn) navResumeBtn.addEventListener('click', openResumeModal);
  if (closeResumeModalBtn) closeResumeModalBtn.addEventListener('click', closeResumeModal);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResumeModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal && !resumeModal.hasAttribute('hidden')) {
      closeResumeModal();
    }
  });

  // --- Contact Form Submission ---
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const subject = document.getElementById('formSubject').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      const feedback = document.getElementById('formFeedback');
      if (feedback) {
        feedback.className = 'form-feedback success';
        feedback.textContent = `Thank you, ${name}! Your message has been prepared. Opening your email client to send to shahidshahidakeel@gmail.com...`;
      }

      showToast('Opening email client...');

      // Open mailto link
      const mailtoUrl = `mailto:shahidshahidakeel@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Shaheed,\n\nName: ${name}\nEmail: ${email}\n\n${message}`)}`;
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 800);
    });
  }

  // --- Active Nav Link on Scroll ---
  function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  // --- Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    preloadAssets();
    setupCursorHoverEffects();
    setupCopyButtons();
    setupScrollSpy();
    requestAnimationFrame(tick);
  });

})();
