document.addEventListener('DOMContentLoaded', () => {
  fetchWorks();
});

let worksData;
let categoriesData; 

function fetchWorks() {
  console.log("Envoi de la requête à l'API");
  Promise.all([
    fetch('http://localhost:5678/api/works'),
    fetch('http://localhost:5678/api/categories'),
  ])
    .then((responses) => Promise.all(responses.map((response) => response.json())))
    .then(([works, categories]) => {
      console.log('Données des travaux :', works);
      console.log('Données des catégories :', categories);

      worksData = works;
      categoriesData = categories; 

      if (categoriesData && categoriesData.length > 0) {
        const gallery = document.querySelector('#portfolio .gallery');
        gallery.innerHTML = '';
        const worksGallery = displayWorks(worksData);
        gallery.append(...worksGallery);
        generateCategoryButtons(categoriesData);
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

function generateCategoryButtons(categoriesData) {
  const buttonsContainer = document.querySelector('#portfolio .category-buttons');
  buttonsContainer.innerHTML = ''; 

  const allBtn = document.createElement('button');
  allBtn.classList.add('cat-button');
  allBtn.textContent = 'Tous';
  buttonsContainer.appendChild(allBtn);

  categoriesData.forEach((category) => {
    const categoryBtn = document.createElement('button');
    categoryBtn.classList.add('cat-button');
    categoryBtn.textContent = category.name;
    buttonsContainer.appendChild(categoryBtn);
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
  const allBtn = document.querySelector('.cat-button'); 
  if (allBtn) {
    allBtn.addEventListener('click', () => filterWorksByCategory('Tous'));
  }
}

function openGalleryModal() {
  const modalElement = document.getElementById('galleryModal');
  const modalContent = document.getElementById('modalContent');

 
  modalContent.innerHTML = '';

 
  const titleDiv = document.createElement('div');
  titleDiv.setAttribute('id', 'modalTitle');
  titleDiv.textContent = 'Galerie photo';
  modalContent.appendChild(titleDiv);

 
  worksData.forEach((work) => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const image = document.createElement('img');
    image.src = work.imageUrl;
    image.alt = work.title;

    
    const trashIcon = document.createElement('img');
    trashIcon.src = './assets/icons/trash-can-solid.png';
    trashIcon.alt = 'Delete';
    trashIcon.classList.add('delete-icon');

   
    trashIcon.addEventListener('click', () => {
      deleteImage(work.id);
      fetchWorks(); n
    });

   
    imageContainer.appendChild(image);
    imageContainer.appendChild(trashIcon);

   
    modalContent.appendChild(imageContainer);
  });


  modalElement.style.display = 'block';

  const addPhotoButton = document.createElement('button');
  addPhotoButton.textContent = 'Ajouter une photo';
  addPhotoButton.classList.add('add-photo-button');
  addPhotoButton.addEventListener('click', () => openAddPhotoModal());
  modalContent.appendChild(addPhotoButton);
}


function openAddPhotoModal() {
 
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = '';


  const titleDiv = document.createElement('div');
  titleDiv.setAttribute('id', 'modalTitle');
  titleDiv.textContent = 'Ajouter une photo';
  modalContent.appendChild(titleDiv);

  
  const form = document.createElement('form');
  form.id = 'addPhotoForm';

  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Titre :';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = 'title';
  titleInput.required = true;
  titleLabel.appendChild(titleInput);

  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Catégorie :';
  const categorySelect = document.createElement('select');
  categorySelect.name = 'category';
  categorySelect.required = true;

  categoriesData.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });

  categoryLabel.appendChild(categorySelect);

  const imageLabel = document.createElement('label');
  imageLabel.textContent = 'Image :';
  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.name = 'image';
  imageInput.accept = 'image/*';
  imageInput.required = true;
  imageLabel.appendChild(imageInput);

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Valider';
  submitButton.disabled = true; 

  form.appendChild(titleLabel);
  form.appendChild(categoryLabel);
  form.appendChild(imageLabel);
  form.appendChild(submitButton);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    
    if (validateAndSubmitForm(form)) {
      closeGalleryModal();
    }
  });

  modalContent.appendChild(form);

  
  form.addEventListener('input', () => {
    submitButton.disabled = !form.checkValidity();
  });
}

function validateAndSubmitForm(form) {
  const title = form.querySelector('input[name="title"]').value;
  const categorySelect = form.querySelector('select[name="category"]');
  const selectedCategoryId = categoriesData.find(category => category.name === categorySelect.value)?.id;

  const imageInput = form.querySelector('input[name="image"]');
  console.log('Fichier image :', imageInput.files[0]);

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', selectedCategoryId); 
  formData.append('image', imageInput.files[0]);

  console.log('Contenu de FormData :', formData); 


  addImage(formData);

  return true; 
}

function deleteImage(imageId) {
  fetch(`http://localhost:5678/api/works/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(response => {
      if (response.status === 204) {
        console.log('Image supprimée avec succès.');

       
        removeImageFromModal(imageId);

    
      } else if (response.status === 401) {
        console.error('Erreur : Unauthorized. L\'utilisateur n\'est pas autorisé.');
      } else if (response.status === 500) {
        console.error('Erreur : Comportement inattendu du serveur.');
      } else {
        console.error(`Erreur inattendue : ${response.status}`);
      }
    })
    .catch(error => {
      console.error('Erreur lors de la suppression de l\'image :', error);
    });
}

function removeImageFromModal(imageId) {
  const modalContent = document.getElementById('modalContent');
  const imageContainer = modalContent.querySelector(`.image-container[data-image-id="${imageId}"]`);

  if (imageContainer) {
    modalContent.removeChild(imageContainer);
  }
}
function addImage(formData) {
  fetch('http://localhost:5678/api/works', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  })
    .then(response => {
      if (response.ok) {
        console.log('Image ajoutée avec succès.');
        fetchWorks();
      } else {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
    })
    .catch(error => {
      console.error('Erreur lors de l\'ajout de l\'image :', error.message);
    });
    console.log('Données FormData :', formData);
}


function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  modal.style.display = 'none';
}
function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  modal.style.display = 'none';
}


window.addEventListener('click', (event) => {
  const modal = document.getElementById('galleryModal');
  if (event.target === modal) {
    closeGalleryModal();
  }
});


const closeModalButton = document.querySelector('.close-modal');
closeModalButton.addEventListener('click', closeGalleryModal);


const modeEditionBanner = document.getElementById('modeEditionBanner');
modeEditionBanner.addEventListener('click', openGalleryModal);


const editModeInfo = document.getElementById('editModeInfo');
editModeInfo.addEventListener('click', openGalleryModal);
