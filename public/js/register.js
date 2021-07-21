function active(e){
    if(e.id === 'loginC'){
        document.querySelector('#registerC').classList.remove('active');
        document.querySelector('#loginC').classList.add('active');
        document.querySelector('.loginData').style.display="block";
        document.querySelector('.registerData').style.display="none";
    }else{
        document.querySelector('#loginC').classList.remove('active');
        document.querySelector('#registerC').classList.add('active');
        document.querySelector('.registerData').style.display="block";
        document.querySelector('.loginData').style.display="none";
    }

}