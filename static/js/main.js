function CopyDiscord() {
    navigator.clipboard.writeText('klof44');

    var popup = document.getElementById("copied-text");
    popup.classList.remove("fade-out");
    popup.classList.add("fade-in");
    setTimeout(function(){ 
        popup.classList.remove("fade-in"); 
        popup.classList.add("fade-out")
    }, 2000);
}