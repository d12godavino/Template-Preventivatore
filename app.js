document.getElementById("app").style.display = "none";
document.getElementById("loginError").style.display = "none";

document.getElementById("azienda").innerText = CONFIG.azienda;
document.documentElement.style.setProperty("--primary", CONFIG.colorePrimario);

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === CONFIG.login.user && pass === CONFIG.login.pass) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}
