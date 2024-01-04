const form = document.getElementById('login-form');
const errorModal = document.getElementById('errorModal');
const errorMessageModalElement = document.getElementById('errorMessageModal');

form.addEventListener('submit', e => submitForm(e));

function submitForm(e) {
    e.preventDefault();
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
            // Affiche le message d'erreur dans la modal
            errorMessageModalElement.textContent = error.message;
            openErrorModal();
        });
}

// Fonction pour ouvrir la modal d'erreur
function openErrorModal() {
    errorModal.style.display = 'block';
}

// Fermer la modal d'erreur si l'utilisateur clique sur la croix
const closeErrorModalButton = document.querySelector('.close');
closeErrorModalButton.addEventListener('click', closeErrorModal);

// Fonction pour fermer la modal d'erreur
function closeErrorModal() {
    errorModal.style.display = 'none';
}
