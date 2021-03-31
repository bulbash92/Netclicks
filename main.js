'use strict'
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

const leftMenu = document.querySelector('.left-menu'),
    burger = document.querySelector('.hamburger'),
    tvShowList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    preloader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    modalContent = document.querySelector('.modal__content'),
    pagination = document.querySelector('.pagination');

tvShowsHead.style.display = 'none';

const loading = document.createElement('div');
loading.classList.add('loading');

const DBService = class {

    constructor() {
        this.SERVER = 'https://api.themoviedb.org/3';
        this.API_KEY = 'be5f29228c0ad5046a7147e90787386e';
    }

    getData = async (url) => {

        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`не удалось получить данные по адресу ${url}`)
        }
    }

    getTestData = () => {
        return this.getData('test.json')
    }

    getTestCard = () => {
        return this.getData('card.json')
    }

    getSearchResult = (query) => {
        this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&Language=ru-RU`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page' + page);
    }

    getTvShow = (id) => {
        return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&Language=ru-RU`);
    }

    getTopRated = () => {
        return this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&Language=ru-Ru`);
    }

    getPopular = () => {
        return this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&Language=ru-Ru`);
    }

    getNewToday = () => {
        return this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&Language=ru-Ru`);
    }

    getWeek = () => {
        return this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&Language=ru-Ru`)
    }
}

const dbService = new DBService();

const renderCard = (response, target) => {
    tvShowList.textContent = '';

    if (response.total_results === 0) {
        loading.remove();
        tvShowsHead.textContent = 'По вашему запросу ничего не найдено... :('
        tvShowsHead.style.cssText = 'color: red; text-transform: uppercase'
        return;
    }
    tvShowsHead.textContent = target ? target.textContent : 'Результаты запроса:'
    tvShowsHead.style.cssText = 'color: green;'
    response.results.forEach(item => {
        console.log(item)
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const posterImg = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropImg = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                src="${posterImg}"
                data-backdrop="${backdropImg}"
                alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
        </a>`;

        loading.remove();
        tvShowList.append(card);
    });

    pagination.textContent = '';

    if (!target && response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) { 
            pagination.innerHTML += `<li><a class="pages" href="#">${i}</a></li>`;
        }
    }
};
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if (value) {

        tvShowsHead.style.display = 'block'
        dbService.getSearchResult(value).then(renderCard);
    }
    tvShows.append(loading)
    searchFormInput.value = '';
});

//open/close menu 
const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active')
    })
}

burger.addEventListener('click', (event) => {
    leftMenu.classList.toggle('openMenu');
    burger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', event => {
    const target = event.target;
    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        burger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', evt => {
    evt.preventDefault();
    const target = evt.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        burger.classList.add('open');
    }

    if (target.closest('#top-rated')) {
        dbService.getTopRated().then((response) => renderCard(response, target));
    }

    if (target.closest('#popular')) {
        dbService.getPopular().then((response) => renderCard(response, target));
    }

    if (target.closest('#today')) {
        dbService.getNewToday().then((response) => renderCard(response, target));
    }

    if (target.closest('#week')) {
        dbService.getWeek().then((response) => renderCard(response, target));
    }

    if (target.closest('#search')) {
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
        searchFormInput.focus();
    }
});

tvShowList.addEventListener('click', evt => {
    evt.preventDefault();
    const target = evt.target;
    const card = target.closest('.tv-card');

    if (card) {
        preloader.style.display = 'block'
        dbService.getTvShow(card.id)

            .then(({ poster_path: posterPath,
                name: title,
                genres,
                vote_average: voteAverage,
                overview,
                homepage }) => {
                if (posterPath) {
                    tvCardImg.src = IMG_URL + posterPath;
                    tvCardImg.alt = title;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = ''
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '25px'
                }


                modalTitle.textContent = title;
                genresList.textContent = '';
                for (const item of genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = voteAverage;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden'
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = ''
            })

    }
});

modal.addEventListener('click', evt => {
    if (evt.target.closest('.cross') ||
        evt.target.classList.contains('modal')) {
        modal.classList.add('hide');
        document.body.style.overflow = '';
        modalTitle.innerText = '';
    }
});

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item')
    if (card) {
        const img = card.querySelector('.tv-card__img');
        console.log(img)
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
};

tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains('pages')) { 
        tvShows.append(loading);
        dbService.getNextPage(target.textContent).then(renderCard);
        
    }
})

