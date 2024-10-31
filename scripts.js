import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

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

    // Method to render a book preview element
    renderPreview() {
        const element = document.createElement('button');
        element.classList.add('preview');  // Add class for styling
        element.setAttribute('data-preview', this.id);  // Set data attribute for event handling
        element.innerHTML = `
            <img class="preview__image" src="${this.image}" />
            <div class="preview__info">
                <h3 class="preview__title">${this.title}</h3>
                <div class="preview__author">${authors[this.author]}</div>
            </div>
        `;
        return element; 
    }
}

// Function to render a list of books
function renderBooks(booksToRender) {
    const container = document.querySelector('[data-list-items]');
    container.innerHTML = ''; // Clear existing items to avoid duplicates
    const fragment = document.createDocumentFragment();  // Created a document fragment for efficient rendering

    for (const bookData of booksToRender) {
        const book = new Book(bookData);  // Created a Book object for each entry
        fragment.appendChild(book.renderPreview());  // Appended the rendered preview to the fragment
    }
    
    container.appendChild(fragment);  // Appended the fragment to the container
}

// Function to filter books based on search criteria
function filterBooks(filters) {
    return books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        return genreMatch && titleMatch && authorMatch;  // Returned true if all conditions are met
    });
}

// Function to handle the search form submission
function handleSearch(event) {
    event.preventDefault();  // Prevent the default form submission behavior
    const formData = new FormData(event.target);  // Create a FormData object from the form
    const filters = Object.fromEntries(formData);  // Convert FormData to a plain object
    
    const results = filterBooks(filters);  // Filter books based on the criteria
    renderBooks(results.slice(0, BOOKS_PER_PAGE));  // Render the first page of results
    
    // Update UI based on results
    updateShowMoreButton(results.length);  // Update the button based on the number of results
    window.scrollTo({ top: 0, behavior: 'smooth' });  // Scroll to the top smoothly
    document.querySelector('[data-search-overlay]').open = false;  // Close the search overlay
}

// Function to update the "Show more" button
function updateShowMoreButton(totalBooks) {
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `<span>Show more</span><span class="list__remaining"> (${totalBooks > BOOKS_PER_PAGE ? totalBooks - BOOKS_PER_PAGE : 0})</span>`;
    button.disabled = totalBooks <= BOOKS_PER_PAGE;  // Disable button if there are no more books to show
}

// Function to display book details
function showBookDetails(book) {
    const active = book;  // Assign book to active
    if (active) {
        document.querySelector('[data-list-active]').open = true;  // Open the book details overlay
        document.querySelector('[data-list-blur]').src = active.image;  // Set background blur image
        document.querySelector('[data-list-image]').src = active.image;  // Set main image
        document.querySelector('[data-list-title]').innerText = active.title;  // Set book title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;  // Set subtitle
        document.querySelector('[data-list-description]').innerText = active.description;  // Set book description
    }
}

// Function to handle book preview click
function handleBookClick(event) {
    const target = event.target.closest('[data-preview]');  // Find the closest button with data-preview attribute
    if (target) {
        const bookId = target.dataset.preview;  // Get the book ID
        const book = books.find(b => b.id === bookId);  // Find the book in the array
        if (book) {
            showBookDetails(book);  
        }
    }
}

// Function to close the book details overlay
function closeBookDetails() {
    document.querySelector('[data-list-active]').open = false;  // Close the overlay
}

// Function to handle theme change settings
function handleSettings(event) {
    event.preventDefault();  // Prevent default form submission
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }

    document.querySelector('[data-settings-overlay]').open = false;  // Close settings overlay
}

// Function to close search overlay
function closeSearchOverlay() {
    document.querySelector('[data-search-overlay]').open = false;  // Close the search overlay
}

// Function to close settings overlay
function closeSettingsOverlay() {
    document.querySelector('[data-settings-overlay]').open = false;  // Close the settings overlay
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
        document.querySelector('[data-search-overlay]').open = true;  // Open search overlay
        document.querySelector('[data-search-title]').focus();  // Focus on search input
    });
    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;  // Open settings overlay
    });
}

// Initialize the application
function init() {
    renderBooks(books.slice(0, BOOKS_PER_PAGE)); // Initial render of the first page of books
    setupEventListeners();  // Set up all event listeners

    // Populate authors and genres in the search form
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

    document.querySelector('[data-search-authors]').appendChild(authorsHtml);  // Add authors to dropdown

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

    document.querySelector('[data-search-genres]').appendChild(genreHtml);  // Add genres to dropdown
}

// Run the initialization function
init();  // Start the application
