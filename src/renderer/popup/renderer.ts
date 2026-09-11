const POSES = ["sleeping", "stretching", "playing"];

function playRandomPose(): void {
  const all = document.querySelectorAll<HTMLElement>(".pose");
  all.forEach((el) => el.classList.remove("visible"));

  const pose = POSES[Math.floor(Math.random() * POSES.length)];
  const target = document.querySelector<HTMLElement>(".pose-" + pose);
  if (!target) return;

  // Force reflow so a repeated same-pose trigger restarts its CSS animations cleanly.
  void target.offsetWidth;
  target.classList.add("visible");
}

(window as unknown as { __playRandomPose: () => void }).__playRandomPose = playRandomPose;
