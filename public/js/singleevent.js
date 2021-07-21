function like(e){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/events/${e.value}`, true);
    xhttp.send();
    document.getElementById('like').innerText=parseInt(document.getElementById('like').innerText)+1;
}