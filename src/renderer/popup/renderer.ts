const CORNER_POSES = ["sitting", "sleeping", "stretching", "playing"];

const params = new URLSearchParams(window.location.search);
const catId = params.get("cat") || "08";
const walkFrameCount = Number(params.get("walkFrames")) || 4;

document.addEventListener("DOMContentLoaded", () => {
  for (const pose of CORNER_POSES) {
    const img = document.getElementById(`pose-${pose}`) as HTMLImageElement | null;
    if (img) img.src = `sprites/${catId}/${pose}.png`;
  }
  const walkImg = document.getElementById("walk-frame") as HTMLImageElement | null;
  if (walkImg) walkImg.src = `sprites/${catId}/walk/frame_0.png`;
});

function showPose(pose: string): void {
  document.querySelectorAll<HTMLElement>(".pose").forEach((el) => el.classList.remove("visible"));
  const target = document.getElementById(`pose-${pose}`);
  if (!target) return;
  // Force reflow so a repeated same-pose trigger restarts its CSS animation cleanly.
  void (target as HTMLElement).offsetWidth;
  target.classList.add("visible");
}
(window as unknown as { __showPose: (pose: string) => void }).__showPose = showPose;

function showWalk(show: boolean): void {
  document.querySelectorAll<HTMLElement>(".pose").forEach((el) => el.classList.remove("visible"));
  const walkImg = document.getElementById("walk-frame");
  if (walkImg && show) walkImg.classList.add("visible");
}
(window as unknown as { __showWalk: (show: boolean) => void }).__showWalk = showWalk;

function setWalkFrame(index: number, mirrored: boolean): void {
  const walkImg = document.getElementById("walk-frame") as HTMLImageElement | null;
  if (!walkImg) return;
  const frame = ((index % walkFrameCount) + walkFrameCount) % walkFrameCount;
  walkImg.src = `sprites/${catId}/walk/frame_${frame}.png`;
  walkImg.style.transform = mirrored ? "scaleX(-1)" : "scaleX(1)";
}
(window as unknown as { __setWalkFrame: (index: number, mirrored: boolean) => void }).__setWalkFrame =
  setWalkFrame;
