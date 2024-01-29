function sendLoginAndPass() {
    let formData = new FormData(document.getElementById('authorization'));
    let login = formData.get('login');
    let password = formData.get('pass');

    let data = {
        'login': login,
        'pass': password
    }

    fetch('http://localhost:3000/admin', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(res => {
            if (res.authorization) {
                window.location.href = '/admin';
            } else {
                alert('Неверный логин или пароль.')
            }
        })
        .catch(err => {
            console.error('Authorization request error: ', err);
        })
}
