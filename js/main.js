(() => {
  "use strict";

  const IMAGE_PATHS = [
    "assets/images/01_party.png",
    "assets/images/02_party.png",
    "assets/images/03_party.png",
    "assets/images/04_party.png"
  ];
  const SHOTS = [
    { start: 500, end: 1700, flash: 1200, enterX: -2, enterY: 1 },
    { start: 1700, end: 3000, flash: 2500, enterX: 9, enterY: 0 },
    { start: 3000, end: 4300, flash: 3800, enterX: 0, enterY: 8 },
    { start: 4300, end: 5800, flash: 5200, enterX: -1, enterY: 2, strong: true }
  ];

  const scene = document.querySelector(".scene");
  const wall = document.querySelector(".wall");
  const photos = [...document.querySelectorAll(".photo")];
  const flash = document.querySelector(".flash");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timers = new Set();
  const animations = new Set();
  let replayLocked = false;

  function schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, { fill: "forwards", ...options });
    animations.add(animation);
    animation.addEventListener("finish", () => animations.delete(animation), { once: true });
    animation.addEventListener("cancel", () => animations.delete(animation), { once: true });
    return animation;
  }

  function clearPlayback() {
    timers.forEach(window.clearTimeout);
    timers.clear();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    flash.style.opacity = "0";
    wall.style.transform = "none";
    photos.forEach((photo) => {
      photo.style.opacity = "0";
      photo.style.transform = "rotate(var(--rotation))";
      photo.style.filter = "none";
    });
  }

  function fullScreenTransform(photo, shot, progress = 0) {
    const sceneBox = scene.getBoundingClientRect();
    const photoBox = photo.getBoundingClientRect();
    const scale = Math.max(sceneBox.width / photoBox.width, sceneBox.height / photoBox.height);
    const sceneX = sceneBox.left + sceneBox.width / 2;
    const sceneY = sceneBox.top + sceneBox.height / 2;
    const photoX = photoBox.left + photoBox.width / 2;
    const photoY = photoBox.top + photoBox.height / 2;
    const driftX = shot.enterX * (1 - progress);
    const driftY = shot.enterY * (1 - progress);
    return `translate(${sceneX - photoX + driftX}px, ${sceneY - photoY + driftY}px) scale(${scale * (1.01 + progress * 0.015)}) rotate(${progress % 2 ? 0.35 : -0.35}deg)`;
  }

  function playShot(photo, shot) {
    const full0 = fullScreenTransform(photo, shot, 0);
    const full1 = fullScreenTransform(photo, shot, 1);
    const captureLength = shot.flash - shot.start + 110;
    const flyLength = shot.end - (shot.flash + 110);

    photo.style.opacity = "1";
    animate(photo, [
      { transform: full0, backgroundColor: "transparent", padding: "0", borderRadius: "0", boxShadow: "none" },
      { transform: full1, backgroundColor: "transparent", padding: "0", borderRadius: "0", boxShadow: "none" }
    ], { duration: captureLength, easing: "ease-out" });

    schedule(() => {
      animate(flash, [
        { opacity: 0 },
        { opacity: shot.strong ? 1 : 0.9, offset: 0.2 },
        { opacity: 0.3, offset: 0.55 },
        { opacity: 0 }
      ], { duration: 200, easing: "ease-out" });
    }, shot.flash - shot.start);

    schedule(() => {
      animate(photo, [
        { transform: full1, backgroundColor: "transparent", padding: "0", borderRadius: "0", boxShadow: "none" },
        { transform: "translateY(3px) rotate(var(--rotation))", offset: 0.88 },
        { transform: "rotate(var(--rotation))", backgroundColor: "#f1ecdf" }
      ], { duration: flyLength, easing: "cubic-bezier(.2,.72,.25,1)" });
    }, shot.flash + 110 - shot.start);
  }

  function showFinalWall() {
    scene.style.opacity = "1";
    photos.forEach((photo) => {
      photo.style.opacity = "1";
      photo.style.transform = "rotate(var(--rotation))";
    });
  }

  function play() {
    if (replayLocked) return;
    replayLocked = true;
    clearPlayback();

    if (reducedMotion.matches) {
      showFinalWall();
      schedule(() => { replayLocked = false; }, 250);
      return;
    }

    scene.style.opacity = "0";
    animate(scene, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: "ease-out" });
    SHOTS.forEach((shot, index) => schedule(() => playShot(photos[index], shot), shot.start));
    schedule(() => { replayLocked = false; }, 250);

    schedule(() => {
      animate(wall, [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(8px) scale(.995)", offset: 0.42 },
        { transform: "translateY(-3px) scale(1.002)", offset: 0.72 },
        { transform: "translateY(0) scale(1)" }
      ], { duration: 1200, easing: "ease-out" });
    }, 5800);

    schedule(() => {
      animate(wall, [
        { transform: "scale(1) translate(0, 0)" },
        { transform: "scale(1.003) translate(1px, -1px)" },
        { transform: "scale(1) translate(0, 0)" }
      ], { duration: 2000, easing: "ease-in-out" });
    }, 7000);
  }

  function preloadImages() {
    return Promise.all(IMAGE_PATHS.map((path) => new Promise((resolve) => {
      const image = new Image();
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      image.src = path;
    })));
  }

  document.addEventListener("pointerup", play);
  reducedMotion.addEventListener("change", play);
  preloadImages().then(play);
})();
