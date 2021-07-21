function active(e){
    if(e.id === 'sports'){
        document.querySelector('#culture').classList.remove('active');
        document.querySelector('#others').classList.remove('active');
        document.querySelector('#sports').classList.add('active');
        document.querySelector('.sports').style.display="block";
        document.querySelector('.culture').style.display="none";
        document.querySelector('.others').style.display="none";
    }else if(e.id === 'culture'){
        document.querySelector('#sports').classList.remove('active');
        document.querySelector('#others').classList.remove('active');
        document.querySelector('#culture').classList.add('active');
        document.querySelector('.culture').style.display="block";
        document.querySelector('.sports').style.display="none";
        document.querySelector('.others').style.display="none";
    }else{
        document.querySelector('#culture').classList.remove('active');
        document.querySelector('#sports').classList.remove('active');
        document.querySelector('#others').classList.add('active');
        document.querySelector('.others').style.display="block";
        document.querySelector('.culture').style.display="none";
        document.querySelector('.sports').style.display="none";
    }
}

function onLoading(){
    let string = window.location.href.split("#");
    if(string.length > 1){
        let obj = {id:string[1]}
        active(obj);
    }
}
