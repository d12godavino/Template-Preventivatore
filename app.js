// Credenziali demo
window.LOGIN_USER = "demo";
window.LOGIN_PASS = "demo123";

document.addEventListener("DOMContentLoaded", function () {
  const err = document.getElementById("loginError");
  if (err) err.style.display = "none";
});

function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const err = document.getElementById("loginError");

  if (u === window.LOGIN_USER && p === window.LOGIN_PASS) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
    if (err) err.style.display = "none";
  } else {
    if (err) err.style.display = "block";
  }
}
