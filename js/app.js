function iniciarApp() {

    const selectCatergorias = document.querySelector('#categorias');
    const resultado = document.querySelector('#resultado');

    if(selectCatergorias) {
        selectCatergorias.addEventListener('change', seleccionarCAtegoria);
        obtenerCategoria();
    }
    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv) {
        obtenerFavoritos();
    }

    const modal = new bootstrap.Modal('#modal', {})


    function obtenerCategoria() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias(categorias = []) {
        categorias.forEach( categoria => {
            const { strCategory } = categoria;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCatergorias.appendChild(option);
        })
    }

    function seleccionarCAtegoria(e) {
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostarrRecetas(resultado.meals))
    }

    function mostarrRecetas(recetas = []) {

        limpiarHTML(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados': 'No hay Resultados';
        resultado.appendChild(heading);
 
        // Iterear en los resultados
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
            recetaImagen.src = strMealThumb ?? receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver receta';
            // recetaButton.dataset.bsTarget = "#modal";
            // recetaButton.dataset.bsToggle = "modal";
            recetaButton.onclick = function() {
                seleccionarReceta(idMeal ?? receta.id);
            }


            // Inyectar el código en el HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);
        })
    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostarrRecetaModal(resultado.meals[0]))
    }

    function mostarrRecetaModal(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb} = receta;

        // Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="${strMeal}" /> 
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-gruop');
        // Mostrar cantidades e ingredientes
        for (let i = 1; i <= 20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;
                
                listGroup.appendChild(ingredienteLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        // Botones favorito y cerrar
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Elminar Favorito' : 'Guardar Favorito';

        // LocalStorage
        btnFavorito.onclick = function() {

            if(existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guargar Favorito';
                mostrarToast('ELminado Correctamente');
                return
            }
            
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Elminar Favorito';
            mostrarToast('Agregado Correctamente');
        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function() {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        // Mostrar el modal
        modal.show();
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevoFavorito = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevoFavorito));
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length) {
            mostarrRecetas(favoritos)
            return
        }

        const noFavorito = document.createElement('P');
        noFavorito.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        noFavorito.textContent = 'No hay favoritos aún';
        favoritosDiv.appendChild(noFavorito);
    }

    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);