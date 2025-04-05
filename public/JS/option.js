function toggleSelect(element) {
  element.classList.toggle("selected");
}

function toggleDropdown() {
  let dropdown = document.getElementById("sportDropdown");
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

function selectSport(sport) {
  alert("You selected: " + sport);
}