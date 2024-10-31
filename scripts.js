import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Define the BookPreview Web Component
class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'author', 'image', 'book-id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        const title = this.getAttribute('title') || '';
        const author = this.getAttribute('author') || '';
        const image = this.getAttribute('image') || '';
        const bookId = this.getAttribute('book-id') || '';

        this.shadowRoot.innerHTML = `
            <style>
                .preview {
                    border: none;
                    background: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                }
                .preview__image {
                    width: 50px;
                    height: auto;
                    margin-right: 10px;
                }
                .preview__info {
                    text-align: left;
                }
                .preview__title {
                    font-size: 1.1em;
                    margin: 0;
                }
                .preview__author {
                    font-size: 0.9em;
                    color: gray;
                }
            </style>
            <button class="preview" data-preview="${bookId}">
                <img class="preview__image" src="${image}" alt="${title}" />
                <div class="preview__info">
                    <h3 class="preview__title">${title}</h3>
                    <div class="preview__author">${author}</div>
                </div>
            </button>
        `;
    }

    addEventListeners() {
        this.shadowRoot.querySelector('.preview').addEventListener('click', () => {
            const event = new CustomEvent('book-selected', {
                detail: { id: this.getAttribute('book-id') },
                bubbles: true,
                composed: true,
            });
            this.dispatchEvent(event);
        });
    }
}

// Register the custom element
customElements.define('book-preview', BookPreview);

// Book Class to encapsulate book-related properties
class Book {
    constructor({ id, title, author, image, published, description, genres }) {
        this.id = id;  
        this.title = title;  
        this.author = author;  
        this.image = image;  
        this.published = published; 
        this.description = description; 
        this.genres = genres; 
    }
}

// Function to render a list of books
function renderBooks(booksToRender) {
    const container = document.querySelector('[data-list-items]');
    container.innerHTML = ''; // Clear existing items

    const fragment = document.createDocumentFragment();

    for (const bookData of booksToRender) {
        const bookPreview = document.createElement('book-preview');
        bookPreview.setAttribute('title', bookData.title);
        bookPreview.setAttribute('author', authors[bookData.author]);
        bookPreview.setAttribute('image', bookData.image);
        bookPreview.setAttribute('book-id', bookData.id);
        
        // Listen for the custom event from the book preview
        bookPreview.addEventListener('book-selected', (event) => {
            const bookId = event.detail.id;
            const book = books.find(b => b.id === bookId);
            if (book) {
                showBookDetails(book);
            }
        });

        fragment.appendChild(bookPreview);
    }

    container.appendChild(fragment);
}

// Function to filter books based on search criteria
function filterBooks(filters) {
    return books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        return genreMatch && titleMatch && authorMatch; 
    });
}

// Function to handle the search form submission
function handleSearch(event) {
    event.preventDefault(); 
    const formData = new FormData(event.target);  
    const filters = Object.fromEntries(formData);  
    
    const results = filterBooks(filters);  
    renderBooks(results.slice(0, BOOKS_PER_PAGE));  
    
    updateShowMoreButton(results.length);  
    window.scrollTo({ top: 0, behavior: 'smooth' });  
    document.querySelector('[data-search-overlay]').open = false;  
}

// Function to update the "Show more" button
function updateShowMoreButton(totalBooks) {
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `<span>Show more</span><span class="list__remaining"> (${totalBooks > BOOKS_PER_PAGE ? totalBooks - BOOKS_PER_PAGE : 0})</span>`;
    button.disabled = totalBooks <= BOOKS_PER_PAGE;  
}

// Function to display book details
function showBookDetails(book) {
    const active = book;  
    if (active) {
        document.querySelector('[data-list-active]').open = true;  
        document.querySelector('[data-list-blur]').src = active.image;  
        document.querySelector('[data-list-image]').src = active.image;  
        document.querySelector('[data-list-title]').innerText = active.title;  
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;  
        document.querySelector('[data-list-description]').innerText = active.description;  
    }
}

// Function to handle book preview click
function handleBookClick(event) {
    const target = event.target.closest('[data-preview]');  
    if (target) {
        const bookId = target.dataset.preview;  
        const book = books.find(b => b.id === bookId);  
        if (book) {
            showBookDetails(book);  
        }
    }
}

// Function to close the book details overlay
function closeBookDetails() {
    document.querySelector('[data-list-active]').open = false;  
}

// Function to handle theme change settings
function handleSettings(event) {
    event.preventDefault();  
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }

    document.querySelector('[data-settings-overlay]').open = false;  
}

// Function to close search overlay
function closeSearchOverlay() {
    document.querySelector('[data-search-overlay]').open = false;  
}

// Function to close settings overlay
function closeSettingsOverlay() {
    document.querySelector('[data-settings-overlay]').open = false;  
}

// Function to set up event listeners
function setupEventListeners() {
    document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);  
    document.querySelector('[data-list-items]').addEventListener('click', handleBookClick);  
    document.querySelector('[data-list-close]').addEventListener('click', closeBookDetails);  
    document.querySelector('[data-settings-form]').addEventListener('submit', handleSettings);  
    document.querySelector('[data-search-cancel]').addEventListener('click', closeSearchOverlay); 
    document.querySelector('[data-settings-cancel]').addEventListener('click', closeSettingsOverlay);
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;  
        document.querySelector('[data-search-title]').focus();  
    });
    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;  
    });
}

// Initialize the application
function init() {
    renderBooks(books.slice(0, BOOKS_PER_PAGE)); 
    setupEventListeners();  

    const authorsHtml = document.createDocumentFragment();
    const firstAuthorElement = document.createElement('option');
    firstAuthorElement.value = 'any';
    firstAuthorElement.innerText = 'All Authors';
    authorsHtml.appendChild(firstAuthorElement);

    for (const [id, name] of Object.entries(authors)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        authorsHtml.appendChild(element);
    }

    document.querySelector('[data-search-authors]').appendChild(authorsHtml);  

    const genreHtml = document.createDocumentFragment();
    const firstGenreElement = document.createElement('option');
    firstGenreElement.value = 'any';
    firstGenreElement.innerText = 'All Genres';
    genreHtml.appendChild(firstGenreElement);

    for (const [id, name] of Object.entries(genres)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        genreHtml.appendChild(element);
    }

    document.querySelector('[data-search-genres]').appendChild(genreHtml);  
}

// Run the initialization function
init(); 
