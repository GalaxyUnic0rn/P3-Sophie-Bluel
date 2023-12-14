function submitForm() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur dans l\'identifiant ou le mot de passe');
        }
        return response.json();
    })
    .then(data => {
        console.log('Connecté:', data);
        localStorage.setItem('token', data.token);
        window.location.href = './index.html';
    })
    .catch(error => {
        console.error('Erreur de connexion:', error.message);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const modeEditionBanner = document.getElementById('modeEditionBanner');
    const loginLogoutButton = document.getElementById('loginLogout');

    const token = localStorage.getItem('token');

    if (token) {
        modeEditionBanner.style.display = 'block';
        modeEditionBanner.textContent = 'Mode Édition';

        loginLogoutButton.textContent = 'Logout';

        loginLogoutButton.addEventListener('click', () => {
            localStorage.removeItem('token'); 
            modeEditionBanner.style.display = 'none';
            window.location.href = './index.html'; 
        });
    } else {
      
        modeEditionBanner.style.display = 'none';

      
        loginLogoutButton.textContent = 'Login';
        loginLogoutButton.addEventListener('click', () => {
            window.location.href = './login.html'; 
        });
    }
});
