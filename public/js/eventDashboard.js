function active(e){
    if(e.id === 'addEvent'){
        document.querySelector('#myEvent').classList.remove('active');
        document.querySelector('#addEvent').classList.add('active');
        document.querySelector('.addEvent').style.display="block";
        document.querySelector('.myEvent').style.display="none";
    }else{
        document.querySelector('#addEvent').classList.remove('active');
        document.querySelector('#myEvent').classList.add('active');
        document.querySelector('.myEvent').style.display="block";
        document.querySelector('.addEvent').style.display="none";
    }

}

function setValue(e) {
    document.getElementById('editForm').action = `/edit/${e.value}`;
}
function setValueDelete(e) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/delete/${e.value}`, true);
    xhttp.send();
    window.location.reload();
}