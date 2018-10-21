window.addEventListener("load", query_profile);
function query_profile() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var profile = JSON.parse(this.responseText);
            document.getElementById("username").innerHTML = profile.username;
            document.getElementById("email").innerHTML = profile.email;
            if (profile.redirectTo) {
                setTimeout(function() {
                    window.location.href = profile.redirectTo;
                }, 2000);
            }
        }
    };
    xhttp.open("GET", "/account/profile", true);
    xhttp.send();
}
