import './css/style.css';
import { PixabayAPI } from './js/pixabay_api';
import Notiflix from 'notiflix';
import createGallery from '../src/templates/cardGallery.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const btnLoadMoreEl = document.querySelector('.load-more');

const pixabayAPI = new PixabayAPI();

let gallery = new SimpleLightbox('.gallery a');

formEl.addEventListener('submit', handleFormSubmit);
btnLoadMoreEl.addEventListener('click', handleLoadMoreBtnClick);

function handleFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';
  btnLoadMoreEl.classList.add('is-hidden');
  const form = event.currentTarget;
  const searchQuery = form.elements['searchQuery'].value.trim();
  pixabayAPI.q = searchQuery;

  if (!searchQuery) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  searchGallery();
}

async function searchGallery() {
  try {
    const { data } = await pixabayAPI.fetchImgs();

    if (data.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    galleryEl.innerHTML = createGallery(data.hits);

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

    gallery.refresh();

    if (data.totalHits > pixabayAPI.per_page) {
      btnLoadMoreEl.classList.remove('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

function handleLoadMoreBtnClick() {
  pixabayAPI.page += 1;
  searchLoadMoreImg();
}

async function searchLoadMoreImg() {
  try {
    const { data } = await pixabayAPI.fetchImgs();

    galleryEl.insertAdjacentHTML('beforeend', createGallery(data.hits));
    gallery.refresh();

    // const { height: cardHeight } =
    //   galleryEl.firstElementChild.getBoundingClientRect();

    // window.scrollBy({
    //   top: cardHeight * 2,
    //   behavior: 'smooth',
    // });

    if (data.hits.length < pixabayAPI.per_page) {
      btnLoadMoreEl.classList.add('is-hidden');
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
}
