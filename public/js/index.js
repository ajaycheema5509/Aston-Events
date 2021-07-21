// if ( window.history.replaceState ) {
//     window.history.replaceState( null, null, window.location.href );
// }
function data(){
    if(localStorage.getItem('userId') != undefined){
        const id = localStorage.getItem('userId');
        document.getElementById('become_org').innerHTML = `<a href="/eventDashboard/${id}">My Dashboard</a>`
    }else{
        document.getElementById('become_org').innerHTML = `<a href="/register">Become an Organizer</a>`
    }
}