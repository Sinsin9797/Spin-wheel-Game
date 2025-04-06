function showResult() {
  const normalizedAngle = angle % (2 * Math.PI);
  const segmentAngle = (2 * Math.PI) / segments.length;
  const index = Math.floor(((2 * Math.PI - normalizedAngle + segmentAngle / 2) % (2 * Math.PI)) / segmentAngle);

  if (segments[index]) {
    alert("You won: " + segments[index]);
  } else {
    alert("Error: Invalid segment index");
  }
}
