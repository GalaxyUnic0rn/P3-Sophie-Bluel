// Fonction pour se connecter et recup les infos de l'api
function fetchWorks() {
    console.log('envoie de la requete a l"API ')
    fetch('http://localhost:5678/api/works')
      .then(response => response.json())
      .then(data => {
        console.log('données bien récup',data);
        displayWorks(data);
      })
      .catch(error => console.error('Erreur lors de la récup:', error));
  }

  // Fonction pour afficher les travaux dans la galerie
  function displayWorks(works) {
    const gallery = document.querySelector('#portfolio .gallery');
    gallery.innerHTML = '';
  
    works.forEach(work => {
      const figure = document.createElement('figure');
  
      const image = document.createElement('img');
      image.src = work.imageUrl;
      image.alt = work.title;
      image.crossOrigin = 'anonymous';
  
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = work.title;
  
      figure.appendChild(image);
      figure.appendChild(figcaption);
  
      gallery.appendChild(figure);
    });
  }
  
  
  document.addEventListener('DOMContentLoaded', fetchWorks);
  