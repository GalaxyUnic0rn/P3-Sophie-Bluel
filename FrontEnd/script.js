document.addEventListener('DOMContentLoaded', () => {
  fetchWorks();
});

let worksData;

function fetchWorks() {
  console.log("Envoi de la requête à l'API");
  Promise.all([
    fetch('http://localhost:5678/api/works'),
    fetch('http://localhost:5678/api/categories'),
  ])
    .then((responses) => Promise.all(responses.map((response) => response.json())))
    .then(([works, categoriesData]) => {
      console.log('Données des travaux :', works);
      console.log('Données des catégories :', categoriesData);

      worksData = works;

      if (categoriesData && categoriesData.length > 0) {
        const gallery = document.querySelector('#portfolio .gallery');
        gallery.innerHTML = '';
        const worksGallery = displayWorks(worksData);
        gallery.append(...worksGallery);
        addEventListeners();
      } else {
        console.error('Aucune catégorie trouvée.');
      }
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des données :', error);
      addEventListeners();
    });
}

function displayWorks(works) {
  const gallery = document.querySelector('#portfolio .gallery');
  const buttonsContainer = document.querySelector('#portfolio .category-buttons');

  gallery.innerHTML = '';

  const worksGallery = works.map((work) => {
    const figure = document.createElement('figure');
    figure.setAttribute('data-category', work.category);

    const image = document.createElement('img');
    image.src = work.imageUrl;
    image.alt = work.title;
    image.crossOrigin = 'anonymous';

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = work.title;

    figure.appendChild(image);
    figure.appendChild(figcaption);

    gallery.appendChild(figure);

    return figure;
  });

  buttonsContainer.addEventListener('click', (event) => {
    const targetButton = event.target;
    if (targetButton.tagName === 'BUTTON') {
      const category = targetButton.textContent;
      console.log('Filtre par catégorie :', category);
      filterWorksByCategory(category, worksGallery);
    }
  });

  return worksGallery;
}

function filterWorksByCategory(category, worksGallery) {
  const gallery = document.querySelector('#portfolio .gallery');
  gallery.innerHTML = '';

  if (worksGallery) {
    console.log('Catégorie sélectionnée :', category);

    if (category.toLowerCase() === 'tous') {
      worksGallery.forEach((figure) => {
        gallery.appendChild(figure.cloneNode(true));
      });
    } else {
      worksGallery.forEach((figure) => {
        const workData = worksData.find((work) => work.title === figure.querySelector('figcaption').textContent);
        console.log('Catégorie du travail :', workData ? workData.category.name : 'Non trouvée');

        const trimmedCategoryNameAPI = workData ? workData.category.name.trim().toLowerCase() : 'Non trouvée';
        const trimmedCategoryNameFilter = category.trim().toLowerCase();
        console.log('Nom de la catégorie API :', trimmedCategoryNameAPI);
        console.log('Nom de la catégorie filtre :', trimmedCategoryNameFilter);

        if (workData && trimmedCategoryNameAPI.localeCompare(trimmedCategoryNameFilter, 'fr', { sensitivity: 'base' }) === 0) {
          const clonedWork = figure.cloneNode(true);
          gallery.appendChild(clonedWork);
        }
      });
    }
  }
}

function addEventListeners() {
  const allBtn = document.querySelector('#all-btn');
  if (allBtn) {
    allBtn.addEventListener('click', () => filterWorksByCategory('Tous'));
  } else {
    console.error("L'élément avec l'ID 'all-btn' n'a pas été trouvé.");
  }
}
