import { renderPhotoCard } from './js/reder-photo-card';
import './css/style.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  inputEl: document.querySelector('input'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtnEl: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.galleryEl.addEventListener('click', onImageClick);
refs.loadMoreBtnEl.addEventListener('click', onLoadMore);
refs.inputEl.addEventListener('input', onInput);

let photosPerPage = 40;
let pageNum = 1;

function fetchUrl() {
  return `https://pixabay.com/api/?key=32397953-af46d34d58be89ead8094befd&q=${refs.inputEl.value.trim()}&image-type=photo&orientation=horizontal&safesearch=true&per_page=${photosPerPage}&page=${pageNum}`;
}

async function onFormSubmit(event) {
  event.preventDefault();
  try {
    if (refs.inputEl.value === '' || refs.inputEl.value === ' ') {
      clearGallery();
      refs.loadMoreBtnEl.classList.add('visually-hidden');
      Notiflix.Notify.info(
        'The input of search are empty. Please, type your request!'
      );
    } else {
      const response = await axios.get(fetchUrl());

      if (response.data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.loadMoreBtnEl.classList.add('visually-hidden');
        clearGallery();
      } else {
        refs.galleryEl.insertAdjacentHTML(
          'beforeend',
          renderPhotoCard(response.data.hits)
        );

        new SimpleLightbox('.gallery a', {
          captionType: 'attr',
          captionsData: 'alt',
          captionPosition: 'bottom',
          captionDelay: 250,
          enableKeyboard: true,
          docClose: true,
          scaleImageToRatio: true,
        });

        if (response.data.totalHits > photosPerPage) {
          refs.loadMoreBtnEl.classList.remove('visually-hidden');
        }

        if (pageNum === 1) {
          Notiflix.Notify.success(
            `Hooray! We found the ${response.data.totalHits} images of ${refs.inputEl.value}`
          );
        }

        noMorePhotos(response);
      }
    }
  } catch (error) {
    Notiflix.Notify.failure(error);
  }
}

function onLoadMore(event) {
  pageNum += 1;
  onFormSubmit(event);
}

function noMorePhotos(response) {
  if (response.data.totalHits / (pageNum * photosPerPage) < 1 && pageNum > 1) {
    refs.loadMoreBtnEl.classList.add('visually-hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function onImageClick(event) {
  event.preventDefault();
}

function clearGallery() {
  refs.galleryEl.innerHTML = '';
}

function onInput() {
  clearGallery();
  refs.loadMoreBtnEl.classList.add('visually-hidden');
  pageNum = 1;
}
