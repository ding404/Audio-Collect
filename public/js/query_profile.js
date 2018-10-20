window.addEventListener("load", query_profile);
function query_profile() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var profile = JSON.parse(this.responseText);
            document.getElementById("username").value = profile.username;
            document.getElementById("email").value = profile.email;
        }
    };
    xhttp.open("GET", "/account/profile", true);
    xhttp.send();
}
