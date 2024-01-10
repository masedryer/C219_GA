// Function to create a book card
function createBookCard(book) {
  const isReserved = book.reserved || false; // Check if the book is initially reserved

  return `
      <div class="col-md-4 mb-4">
        <div class="card" data-book-id="${
          book.id
        }" data-bs-toggle="modal" data-bs-target="#bookModal">
          <img src="${book.image}" class="card-img-top" alt="${book.title}">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text">Author: ${book.author}</p>
            <button class="btn btn-peach btn-block reserve-btn" type="button" ${
              isReserved ? "disabled" : ""
            }>
              ${isReserved ? "Reserved" : "Reserve"}
            </button>
          </div>
        </div>
      </div>
    `;
}

// app.js

function initTooltips() {
  tippy(".card", {
    content: "Loading...", // You can customize the loading content
    onShow(instance) {
      const bookId = $(instance.reference).data("book-id");
      const book = booksData.find((book) => book.id === bookId);

      if (book) {
        const title = $("<strong>").text(book.title);
        const author = $("<p>").text("Author: " + book.author);
        const genre = $("<p>").text("Genre: " + book.genre);
        const year = $("<p>").text("Year: " + book.year);
        const type = $("<p>").text("Type: " + book.type);

        const content = $("<div>").append(title, author, genre, year, type)[0]; // Use [0] to get the DOM element
        instance.setContent(content);

        // Add click event to open modal
        $(instance.reference).on("click", () => {
          $("#modalBody").html(content);
        });
      } else {
        instance.setContent("Book information not available");
      }
    },
  });
}

// Function to render book cards on the page
function renderBookCards() {
  const bookCardsContainer = $("#bookCardsContainer");

  booksData.forEach((book) => {
    const bookCardHTML = createBookCard(book);
    bookCardsContainer.append(bookCardHTML);
  });

  // Initialize Tippy.js tooltips
  initTooltips();

  // Add event listener for Reserve buttons
  $(".reserve-btn").on("click", function () {
    const card = $(this).closest(".card");
    const bookId = card.data("book-id");
    const book = booksData.find((book) => book.id === bookId);

    if (book && !book.reserved) {
      // Update the button and book data
      $(this).text("Reserved").prop("disabled", true);
      book.reserved = true;
      console.log(`Book ${book.title} reserved.`);
    }
  });
}
function filterBookCards(searchInput) {
  const filteredBooks = booksData.filter((book) => {
    const searchValue = searchInput.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchValue) ||
      book.author.toLowerCase().includes(searchValue) ||
      book.genre.toLowerCase().includes(searchValue) ||
      book.year.toLowerCase().includes(searchValue) ||
      book.type.toLowerCase().includes(searchValue)
    );
  });

  return filteredBooks;
}

// Call the function to render book cards when the page loads

function generateReservationChartData() {
  const genres = [...new Set(booksData.map((book) => book.genre))]; // Get unique genres

  // Function to generate a random color
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const data = {
    labels: genres,
    datasets: [
      {
        label: "Books Yet to Be Reserved",
        data: genres.map((genre) => {
          const booksInGenre = booksData.filter(
            (book) => book.genre === genre && !book.reserved
          );
          return booksInGenre.length;
        }),
        backgroundColor: genres.map(() => getRandomColor()), // Generate random colors for each genre
        borderColor: "rgba(75, 192, 192, 1)", // You can set a border color if needed
        borderWidth: 1,
      },
    ],
  };

  return data;
}

function initReservationChart() {
  const ctx = document.getElementById("reservationChart").getContext("2d");
  const data = generateReservationChartData();

  new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      scales: {
        x: { title: { display: true, text: "Genre" } },
        y: { title: { display: true, text: "Number of Books" } },
      },
    },
  });
}

function initInventoryTable(data) {
  $("#inventoryTable").DataTable({
    data: data,
    columns: [
      { data: "title" },
      { data: "author" },
      { data: "genre" },
      { data: "year" },
      { data: "type" },
    ],
    pageLength: 10,
    lengthMenu: [10, 20, 50],
    dom: '<"top"lf>rt<"bottom"ip>',
    lengthChange: false,
    language: {
      emptyTable: "No data available in table",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "Showing 0 to 0 of 0 entries",
      infoFiltered: "(filtered from _MAX_ total entries)",
      zeroRecords: "No matching records found",
      search: "Search:",
      paginate: {
        previous: "Previous",
        next: "Next",
      },
    },
    drawCallback: function () {
      // Apply background color to odd rows after table is drawn
      $("#inventoryTable tbody tr:odd").css("background-color", "peachpuff");

      // Add a class to the title row for custom styling
      $("#inventoryTable thead tr").addClass("table-peachpuff");
    },
  });
}
// Function to fetch and format data from booksData.js
function fetchAndFormatInventoryData() {
  // Assuming booksData.js is included before app.js
  if (typeof booksData !== "undefined" && Array.isArray(booksData)) {
    // Format the data to match the DataTable structure
    const inventoryData = booksData.map((book) => ({
      title: book.title,
      author: book.author,
      genre: book.genre,
      year: book.year,
      type: book.type,
    }));

    // Call the function to initialize the DataTable with inventoryData
    initInventoryTable(inventoryData);
  } else {
    console.error("booksData is not defined or not an array.");
  }
}
$(document).ready(function () {
  fetchAndFormatInventoryData();
});
$(document).ready(() => {
  const bookCardsContainer = $("#bookCardsContainer");
  const maxCards = 6;

  function renderFilteredBooks(filteredBooks) {
    // Show only the first 6 filtered books
    const filteredSlice = filteredBooks.slice(0, maxCards);

    // Render book cards
    filteredSlice.forEach((book) => {
      const bookCardHTML = createBookCard(book);
      bookCardsContainer.append(bookCardHTML);
    });

    // Show/Hide "Load More" button based on the number of filtered books
    if (filteredBooks.length > maxCards) {
      $("#loadMoreBtn").show();
    } else {
      $("#loadMoreBtn").hide();
    }

    // Initialize Tippy.js tooltips after rendering filtered cards
    initTooltips();

    // Add event listener for Reserve buttons in filtered cards
    $(".reserve-btn").on("click", function () {
      const card = $(this).closest(".card");
      const bookId = card.data("book-id");
      const book = filteredBooks.find((book) => book.id === bookId);

      if (book && !book.reserved) {
        // Update the button and book data
        $(this).text("Reserved").prop("disabled", true);
        book.reserved = true;
        console.log(`Book ${book.title} reserved.`);
      }
    });
  }

  renderFilteredBooks(booksData);

  // Event listener for search input changes
  $("#searchInput").on("input", function () {
    const searchInput = $(this).val();
    const filteredBooks = filterBookCards(searchInput);

    // Clear the existing cards
    bookCardsContainer.empty();

    // Render the filtered books
    renderFilteredBooks(filteredBooks);
  });

  // Event listener for "Load More" button
  $("#loadMoreBtn").on("click", function () {
    const searchInput = $("#searchInput").val();
    const filteredBooks = filterBookCards(searchInput);

    const currentCount = bookCardsContainer.children().length;
    const nextBooks = filteredBooks.slice(
      currentCount,
      currentCount + maxCards
    );

    // Render the next set of books
    nextBooks.forEach((book) => {
      const bookCardHTML = createBookCard(book);
      bookCardsContainer.append(bookCardHTML);
    });

    // Show/Hide "Load More" button based on the number of filtered books
    if (filteredBooks.length > currentCount + maxCards) {
      $("#loadMoreBtn").show();
    } else {
      $("#loadMoreBtn").hide();
    }
  });
  initReservationChart();
});
