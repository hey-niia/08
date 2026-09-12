document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("cat-video") as HTMLVideoElement | null;
  const emptyState = document.getElementById("empty-state");
  if (!video || !emptyState) return;

  const params = new URLSearchParams(window.location.search);
  const src = params.get("video");

  if (src) {
    video.src = src;
  } else {
    video.hidden = true;
    emptyState.hidden = false;
  }
});
