function showResult() {
  const normalizedAngle = angle % (2 * Math.PI);
  const segmentAngle = (2 * Math.PI) / segments.length;
  const index = Math.floor(((2 *  - normalizedAngle + segmentAngle / 2) % (2 * Math.PI)) / segmentAngle);

  if (segments[index]) {
    document.getElementById("result").innerText = "You won: " + segments[index];
  } else {
    document.getElementById("result").innerText = "Error: Invalid segment";
  }
}
