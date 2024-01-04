document.addEventListener('DOMContentLoaded', () => {
  fetchWorks();
});

let worksData;
let categoriesData;

function fetchWorks() {
  console.log("Envoi de la requête à l'API");
  return Promise.all([
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
        initializeGallery();
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
  allBtn.classList.add('cat-button', 'all-category');
  allBtn.textContent = 'Tous';
  buttonsContainer.appendChild(allBtn);

  categoriesData.forEach((category) => {
    const categoryBtn = document.createElement('button');
    categoryBtn.classList.add('cat-button');
    categoryBtn.textContent = category.name;
    buttonsContainer.appendChild(categoryBtn);

    categoryBtn.addEventListener('click', () => {
      document.querySelectorAll('.cat-button').forEach(btn => btn.classList.remove('selected-category'));
      categoryBtn.classList.add('selected-category');
      filterWorksByCategory(category.name);
    });
  });

  allBtn.addEventListener('click', () => {
    document.querySelectorAll('.cat-button').forEach(btn => btn.classList.remove('selected-category'));
    allBtn.classList.add('selected-category');
    filterWorksByCategory('Tous');
  });
}
function initializeGallery() {
  const allBtn = document.querySelector('.all-category');
  if (allBtn) {
    allBtn.classList.add('selected-category'); 
  }
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


  const galleryContainer = document.createElement('div');
  galleryContainer.classList.add('gallery-container');


  worksData.forEach((work) => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const image = document.createElement('img');
    image.src = work.imageUrl;
    image.alt = work.title;

    const trashIcon = document.createElement('img');
    trashIcon.src = './assets/icons/trash-can-solid.png';
    trashIcon.alt = 'Supprimer';
    trashIcon.classList.add('delete-icon');

    trashIcon.addEventListener('click', () => {
      deleteImage(work.id);
      fetchWorks();
    });

    imageContainer.appendChild(image);
    imageContainer.appendChild(trashIcon);

    galleryContainer.appendChild(imageContainer);

    const transparentBackground = document.querySelector('.transparent-background');
    transparentBackground.style.display = 'block'; 
  
  });

  modalContent.appendChild(galleryContainer);


  const separatorLine = document.createElement('hr');
  separatorLine.classList.add('horizontal-line');


  const addButtonContainer = document.createElement('div');
  addButtonContainer.classList.add('add-button-container');

  const addPhotoButton = document.createElement('button');
  addPhotoButton.textContent = 'Ajouter une photo';
  addPhotoButton.classList.add('add-photo-button');
  addPhotoButton.addEventListener('click', () => openAddPhotoModal());
  addButtonContainer.appendChild(addPhotoButton);

  modalContent.appendChild(separatorLine);
  modalContent.appendChild(addButtonContainer);

  modalElement.style.display = 'block';
}


function toggleImagePreviewVisibility(visible) {
  const imagePreviewContainer = document.querySelector('.image-preview-container');
  if (imagePreviewContainer) {
    imagePreviewContainer.style.display = visible ? 'block' : 'none';
  }
}


function validateImage(file) {
  const allowedFormats = ['image/jpeg', 'image/png'];
  const maxFileSize = 4 * 1024 * 1024;

  if (!allowedFormats.includes(file.type)) {
    alert('Le format de l\'image n\'est pas valide. Veuillez utiliser JPG ou PNG.');
    return false;
  }

  if (file.size > maxFileSize) {
    alert('La taille de l\'image dépasse la limite de 4 Mo.');
    return false;
  }

  return true;
}


function openAddPhotoModal() {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = '';

  const titleDiv = document.createElement('div');
  titleDiv.setAttribute('id', 'modalTitle');
  titleDiv.textContent = 'Ajout photo';
  modalContent.appendChild(titleDiv);

  const fileInputContainer = document.createElement('div');
  fileInputContainer.classList.add('file-input-container');
  
  
  const logo = document.createElement('img');
  logo.src = './assets/icons/logo-img.png'; 
  logo.alt = 'Logo';
  logo.classList.add('logo');
  
  fileInputContainer.appendChild(logo);


  const fileInputButton = document.createElement('button');
  fileInputButton.textContent = '+ Ajouter photo';
  fileInputButton.classList.add('file-input-button');

  fileInputButton.addEventListener('click', () => {
    const realFileInput = document.getElementById('realFileInput');
    realFileInput.click();
  });

  fileInputContainer.appendChild(fileInputButton);

  const realFileInput = document.createElement('input');
  realFileInput.type = 'file';
  realFileInput.name = 'image';
  realFileInput.id = 'realFileInput';
  realFileInput.accept = 'image/*';
  realFileInput.required = true;
  realFileInput.style.display = 'none';

  fileInputContainer.appendChild(realFileInput);

  const fileInputLabel = document.createElement('p');
  fileInputLabel.textContent = 'jpg, png : 4mo max';
  fileInputLabel.classList.add('file-input-label');
  fileInputContainer.appendChild(fileInputLabel);

  modalContent.appendChild(fileInputContainer);

  const imagePreviewContainer = document.createElement('div');
  imagePreviewContainer.classList.add('image-preview-container');

  const imagePreview = document.createElement('img');
  imagePreview.classList.add('image-preview');
  imagePreview.alt = 'Image Preview';

  imagePreviewContainer.appendChild(imagePreview);
  modalContent.appendChild(imagePreviewContainer);

  const form = document.createElement('form');
  form.id = 'addPhotoForm';

  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Titre';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = 'title';
  titleInput.required = true;
  titleLabel.appendChild(titleInput);

  form.appendChild(titleLabel);

  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Catégorie';
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

  form.appendChild(categoryLabel);

  const separatorLine = document.createElement('hr');
  separatorLine.classList.add('horizontal-line');

  form.appendChild(separatorLine);

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Valider';
  submitButton.disabled = true;
  submitButton.classList.add('validate-btn')
 
  form.appendChild(submitButton);



  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (validateAndSubmitForm(form)) {
      closeGalleryModal();
    }
  });

  form.addEventListener('input', () => {
    submitButton.disabled = !form.checkValidity();
    submitButton.style.backgroundColor = form.checkValidity() ? '#1D6154' : '#A7A7A7';
  });

  modalContent.appendChild(form);

  realFileInput.addEventListener('change', () => {
    const selectedFile = realFileInput.files[0];
  
    if (selectedFile) {
      if (validateImage(selectedFile)) {
        const reader = new FileReader();
  
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
  
          
          toggleImagePreviewVisibility(true);
  
          fileInputContainer.style.display = 'none';
          fileInputLabel.style.display = 'none';
        };

        reader.readAsDataURL(selectedFile);
      } else {
        realFileInput.value = '';
      }
    } else {
      toggleImagePreviewVisibility(false);
  
      imagePreview.src = '';
      fileInputContainer.style.display = 'block';
      fileInputLabel.style.display = 'block';
    }
  });
  
const backButtonContainer = document.createElement('div');
backButtonContainer.classList.add('back-button-container');

const arrowLeftIcon = document.createElement('img');
arrowLeftIcon.classList.add('back-button');
arrowLeftIcon.src = './assets/icons/arrow-left.png'; 
arrowLeftIcon.alt = 'Retour';

arrowLeftIcon.addEventListener('click', () => openGalleryModal()); 

backButtonContainer.appendChild(arrowLeftIcon);
modalContent.appendChild(backButtonContainer);


  toggleImagePreviewVisibility(false);
}




function validateAndSubmitForm(form) {
  console.log('Validation du formulaire en cours...');
  const title = form.querySelector('input[name="title"]').value;
  const categorySelect = form.querySelector('select[name="category"]');
  const selectedCategoryId = categoriesData.find(category => category.name === categorySelect.value)?.id;

  const imageInput = document.querySelector('input[name="image"]');
  console.log('Fichier image :', imageInput.files[0]);

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', selectedCategoryId);
  formData.append('image', imageInput.files[0]);

  console.log('Contenu de FormData :', formData);

  const fileInputContainer = document.querySelector('.file-input-container');
  const imagePreview = document.createElement('img');
  imagePreview.classList.add('image-preview');

  if (imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };
    reader.readAsDataURL(imageInput.files[0]);
  }

  fileInputContainer.innerHTML = '';
  fileInputContainer.appendChild(imagePreview);

  
  return addImage(formData);
}





function deleteImage(imageId) {
  return fetch(`http://localhost:5678/api/works/${imageId}`, {
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
        return fetchWorks().then(() => openGalleryModal())

      } else if (response.status === 401) {
        console.error('Erreur : Unauthorized. L\'utilisateur n\'est pas autorisé.');
        throw 'Erreur : Unauthorized. L\'utilisateur n\'est pas autorisé.'
      } else if (response.status === 500) {
        console.error('Erreur : Comportement inattendu du serveur.');
        throw 'Erreur : Comportement inattendu du serveur.'
      } else {
        console.error(`Erreur inattendue : ${response.status}`);
        throw `Erreur inattendue : ${response.status}`
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
  console.log('La fonction addImage est appelée avec les données :', formData);
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
  console.error('Erreur lors de l\'envoi de l\'image :', error);
    });
  console.log('Données FormData :', formData);
}


function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  modal.style.display = 'none';

  const transparentBackground = document.querySelector('.transparent-background');
  transparentBackground.style.display = 'none'; 
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


const loginLogoutButton = document.getElementById('loginLogout');
const categoryButtons = document.querySelector('#portfolio .category-buttons');

const token = localStorage.getItem('token');

if (token) {
  modeEditionBanner.style.display = 'block';
  editModeInfo.style.display = 'block';
  categoryButtons.style.display = 'none';

  loginLogoutButton.textContent = 'Logout';

  loginLogoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    modeEditionBanner.style.display = 'none';
    editModeInfo.style.display = 'none';
    categoryButtons.style.display = 'flex';
    window.location.href = './index.html';
  });
} else {
  modeEditionBanner.style.display = 'none';
  editModeInfo.style.display = 'none';
  categoryButtons.style.display = 'flex';

  loginLogoutButton.textContent = 'Login';
  loginLogoutButton.addEventListener('click', () => {
    window.location.href = './login.html';
  });
}