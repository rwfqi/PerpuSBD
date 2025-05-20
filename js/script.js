document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const bookTableBody = document.querySelector('#bookTable tbody');
    const showAddBookFormButton = document.getElementById('showAddBookForm');
    const addBookFormContainer = document.getElementById('addBookFormContainer');
    const addBookForm = document.getElementById('addBookForm');
    const cancelAddBookButton = document.getElementById('cancelAddBook');

    const editBookFormContainer = document.getElementById('editBookFormContainer');
    const editBookForm = document.getElementById('editBookForm');
    const cancelEditBookButton = document.getElementById('cancelEditBook');

    const searchBookInput = document.getElementById('searchBook');
    const filterGenreSelect = document.getElementById('filterGenre');
    const filterCategorySelect = document.getElementById('filterCategory');
    const applyFilterButton = document.getElementById('applyFilter');
    const resetFilterButton = document.getElementById('resetFilter');

    const addGenresSelect = document.getElementById('add_genres');
    const addCategoriesSelect = document.getElementById('add_categories');
    const editGenresSelect = document.getElementById('edit_genres');
    const editCategoriesSelect = document.getElementById('edit_categories');

    const borrowedBookTableBody = document.querySelector('#borrowedBookTable tbody'); // For peminjam
    const adminBorrowedBookTableBody = document.querySelector('#adminBorrowedBookTable tbody'); // For admin

    // For borrow requests (admin)
    const adminBorrowRequestsTableBody = document.querySelector('#adminBorrowRequestsTable tbody');
    // For user's own borrow requests status (peminjam)
    const userBorrowRequestsTableBody = document.querySelector('#userBorrowRequestsTable tbody');

    let currentEditBookId = null;
    let allGenres = [];
    let allCategories = [];
    const userRole = document.body.dataset.userRole; // Get user role from data attribute

    // Modal elements for admin return confirmation
    const returnConfirmModal = document.getElementById('returnConfirmModal');
    const closeButton = document.querySelector('#returnConfirmModal .close-button');
    const modalBookTitle = document.getElementById('modalBookTitle');
    const modalBorrowerName = document.getElementById('modalBorrowerName');
    const confirmReturnButton = document.getElementById('confirmReturnButton');
    const cancelReturnButton = document.getElementById('cancelReturnButton');

    // Modal elements for admin approval/rejection (return)
    const adminApprovalModal = document.getElementById('adminApprovalModal');
    const closeApprovalModal = document.querySelector('#adminApprovalModal .close-button');
    const modalApprovalBookTitle = document.getElementById('modalApprovalBookTitle');
    const modalApprovalBorrowerName = document.getElementById('modalApprovalBorrowerName');
    const confirmApproveButton = document.getElementById('confirmApproveButton');
    const confirmRejectButton = document.getElementById('confirmRejectButton');
    const cancelApprovalButton = document.getElementById('cancelApprovalButton');

    let bookToApproveReject = {}; // Stores details for the book being approved/rejected by admin (return)

    // Modal elements for admin borrow request approval/rejection
    const adminBorrowRequestApprovalModal = document.getElementById('adminBorrowRequestApprovalModal');
    const closeBorrowRequestApprovalModal = document.querySelector('#adminBorrowRequestApprovalModal .close-button');
    const modalBorrowRequestBookTitle = document.getElementById('modalBorrowRequestBookTitle');
    const modalBorrowRequestBorrowerName = document.getElementById('modalBorrowRequestBorrowerName');
    const modalBorrowRequestAdminNotes = document.getElementById('modalBorrowRequestAdminNotes'); // Input field
    const confirmApproveBorrowRequestButton = document.getElementById('confirmApproveBorrowRequestButton');
    const confirmRejectBorrowRequestButton = document.getElementById('confirmRejectBorrowRequestButton');
    const cancelBorrowRequestApprovalButton = document.getElementById('cancelBorrowRequestApprovalButton');

    let borrowRequestToHandle = {}; // Stores details for the borrow request being handled by admin

    // Chart elements
    let libraryStatsChart; // To store the chart instance

    // Tab Navigation Variables
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section');

    // --- Helper Functions ---
    function populateSelect(selectElement, data, selectedIds = []) {
        selectElement.innerHTML = '';
        if (selectElement.id === 'filterGenre' || selectElement.id === 'filterCategory') {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Pilih ${selectElement.id === 'filterGenre' ? 'Genre' : 'Kategori'}...`;
            selectElement.appendChild(defaultOption);
        }

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.genre_name || item.category_name;
            if (selectedIds.includes(parseInt(item.id))) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }

    async function fetchGenres() {
        try {
            const response = await fetch('api.php?resource=genres');
            const data = await response.json();
            if (data.status === 'success') {
                allGenres = data.data;
                populateSelect(filterGenreSelect, allGenres);
                populateSelect(addGenresSelect, allGenres);
                populateSelect(editGenresSelect, allGenres);
            }
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch('api.php?resource=categories');
            const data = await response.json();
            if (data.status === 'success') {
                allCategories = data.data;
                populateSelect(filterCategorySelect, allCategories);
                populateSelect(addCategoriesSelect, allCategories);
                populateSelect(editCategoriesSelect, allCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    async function fetchBooks() {
        let url = 'api.php?resource=books';
        const searchTerm = searchBookInput.value.trim();
        const selectedGenre = filterGenreSelect.value;
        const selectedCategory = filterCategorySelect.value;

        const params = new URLSearchParams();
        if (searchTerm) {
            params.append('search', searchTerm);
        } else {
            if (selectedGenre) {
                params.append('genre_id', selectedGenre);
            }
            if (selectedCategory) {
                params.append('category_id', selectedCategory);
            }
        }
        if (params.toString()) {
            url += '&' + params.toString();
        }

        try {
            const response = await fetch(url);
            if (response.status === 401) {
                window.location.href = 'login.php';
                return;
            }
            const data = await response.json();

            bookTableBody.innerHTML = '';
            if (data.status === 'success' && data.data.length > 0) {
                data.data.forEach(book => {
                    const row = bookTableBody.insertRow();
                    row.insertCell().textContent = book.id;
                    row.insertCell().textContent = book.title;
                    row.insertCell().textContent = book.author;
                    row.insertCell().textContent = book.isbn;
                    row.insertCell().textContent = book.publication_year;
                    row.insertCell().textContent = book.description || '-';
                    row.insertCell().textContent = book.genres || '-';
                    row.insertCell().textContent = book.categories || '-';
                    row.insertCell().textContent = book.available_copies;

                    const actionCell = row.insertCell();
                    if (userRole === 'admin') {
                        const editButton = document.createElement('button');
                        editButton.textContent = 'Edit';
                        editButton.classList.add('edit-btn');
                        editButton.dataset.id = book.id;
                        editButton.dataset.title = book.title;
                        editButton.dataset.author = book.author;
                        editButton.dataset.isbn = book.isbn;
                        editButton.dataset.publicationYear = book.publication_year;
                        editButton.dataset.description = book.description;
                        editButton.dataset.availableCopies = book.available_copies;
                        editButton.dataset.genres = book.genres ? JSON.stringify(book.genres.split(', ').map(gName => allGenres.find(ag => ag.genre_name === gName)?.id).filter(Boolean)) : '[]';
                        editButton.dataset.categories = book.categories ? JSON.stringify(book.categories.split(', ').map(cName => allCategories.find(ac => ac.category_name === cName)?.id).filter(Boolean)) : '[]';
                        actionCell.appendChild(editButton);

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Hapus';
                        deleteButton.classList.add('delete-btn');
                        deleteButton.dataset.id = book.id;
                        actionCell.appendChild(deleteButton);
                    } else if (userRole === 'peminjam') {
                        const borrowButton = document.createElement('button');
                        borrowButton.textContent = 'Ajukan Pinjam';
                        borrowButton.classList.add('request-borrow-btn');
                        borrowButton.dataset.id = book.id;
                        borrowButton.disabled = book.available_copies <= 0;
                        actionCell.appendChild(borrowButton);
                    }
                });
            } else {
                const row = bookTableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = (userRole === 'admin') ? 10 : 9;
                cell.textContent = 'Tidak ada buku ditemukan.';
                cell.style.textAlign = 'center';
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            const row = bookTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = (userRole === 'admin') ? 10 : 9;
            cell.textContent = 'Gagal memuat buku. Silakan coba lagi.';
            cell.style.textAlign = 'center';
        }
    }

    async function fetchBorrowedBooks() {
        if (userRole === 'peminjam') {
            try {
                const response = await fetch('api.php?action=borrowed_list');
                const data = await response.json();
                borrowedBookTableBody.innerHTML = '';
                if (data.status === 'success' && data.data.length > 0) {
                    data.data.forEach(borrowedBook => {
                        const row = borrowedBookTableBody.insertRow();
                        row.insertCell().textContent = borrowedBook.borrowed_id;
                        row.insertCell().textContent = borrowedBook.title;
                        row.insertCell().textContent = borrowedBook.author;
                        row.insertCell().textContent = new Date(borrowedBook.borrow_date).toLocaleDateString();
                        row.insertCell().textContent = new Date(borrowedBook.due_date).toLocaleDateString();
                        row.insertCell().textContent = borrowedBook.return_date ? new Date(borrowedBook.return_date).toLocaleDateString() : '-';
                        row.insertCell().textContent = borrowedBook.status;

                        const actionCell = row.insertCell();
                        if (borrowedBook.status === 'dipinjam') {
                            const requestReturnButton = document.createElement('button');
                            requestReturnButton.textContent = 'Ajukan Pengembalian';
                            requestReturnButton.classList.add('request-return-btn');
                            requestReturnButton.dataset.borrowedId = borrowedBook.borrowed_id;
                            actionCell.appendChild(requestReturnButton);
                        } else if (borrowedBook.status === 'menunggu_persetujuan') {
                            const pendingStatusSpan = document.createElement('span');
                            pendingStatusSpan.textContent = 'Menunggu Persetujuan';
                            pendingStatusSpan.classList.add('pending-status');
                            actionCell.appendChild(pendingStatusSpan);
                        }
                    });
                } else {
                    const row = borrowedBookTableBody.insertRow();
                    const cell = row.insertCell();
                    cell.colSpan = 8;
                    cell.textContent = 'Anda belum meminjam buku apa pun.';
                    cell.style.textAlign = 'center';
                }
            } catch (error) {
                console.error('Error fetching borrowed books for peminjam:', error);
            }

        } else if (userRole === 'admin') {
            try {
                const response = await fetch('api.php?action=admin_borrowed_list');
                const data = await response.json();
                adminBorrowedBookTableBody.innerHTML = '';
                if (data.status === 'success' && data.data.length > 0) {
                    data.data.forEach(borrowedBook => {
                        const row = adminBorrowedBookTableBody.insertRow();
                        row.insertCell().textContent = borrowedBook.borrowed_id;
                        row.insertCell().textContent = borrowedBook.title;
                        row.insertCell().textContent = borrowedBook.author;
                        row.insertCell().textContent = borrowedBook.username;
                        row.insertCell().textContent = new Date(borrowedBook.borrow_date).toLocaleDateString();
                        row.insertCell().textContent = new Date(borrowedBook.due_date).toLocaleDateString();
                        row.insertCell().textContent = borrowedBook.return_date ? new Date(borrowedBook.return_date).toLocaleDateString() : '-';
                        row.insertCell().textContent = borrowedBook.status;

                        const actionCell = row.insertCell();
                        if (borrowedBook.status === 'menunggu_persetujuan') {
                            const approveButton = document.createElement('button');
                            approveButton.textContent = 'Setujui';
                            approveButton.classList.add('approve-btn');
                            approveButton.dataset.borrowedId = borrowedBook.borrowed_id;
                            approveButton.dataset.bookId = borrowedBook.book_id;
                            approveButton.dataset.bookTitle = borrowedBook.title;
                            approveButton.dataset.borrowerName = borrowedBook.username;
                            actionCell.appendChild(approveButton);

                            const rejectButton = document.createElement('button');
                            rejectButton.textContent = 'Tolak';
                            rejectButton.classList.add('reject-btn');
                            rejectButton.dataset.borrowedId = borrowedBook.borrowed_id;
                            actionCell.appendChild(rejectButton);
                        } else if (borrowedBook.status === 'dipinjam') {
                            const returnButton = document.createElement('button');
                            returnButton.textContent = 'Kembalikan Langsung';
                            returnButton.classList.add('return-btn');
                            returnButton.dataset.borrowedId = borrowedBook.borrowed_id;
                            returnButton.dataset.bookId = borrowedBook.book_id;
                            returnButton.dataset.bookTitle = borrowedBook.title;
                            returnButton.dataset.borrowerName = borrowedBook.username;
                            actionCell.appendChild(returnButton);
                        }
                    });
                } else {
                    const row = adminBorrowedBookTableBody.insertRow();
                    const cell = row.insertCell();
                    cell.colSpan = 9;
                    cell.textContent = 'Tidak ada buku yang sedang dipinjam.';
                    cell.style.textAlign = 'center';
                }
            } catch (error) {
                console.error('Error fetching borrowed books for admin:', error);
            }
        }
    }

    async function fetchUserBorrowRequests() {
        try {
            const response = await fetch('api.php?action=user_borrow_requests_status');
            const data = await response.json();
            userBorrowRequestsTableBody.innerHTML = ''; // Clear existing rows
            if (data.status === 'success' && data.data.length > 0) {
                data.data.forEach(request => {
                    const row = userBorrowRequestsTableBody.insertRow();
                    row.insertCell().textContent = request.request_id;
                    row.insertCell().textContent = request.title;
                    row.insertCell().textContent = request.author;
                    row.insertCell().textContent = new Date(request.request_date).toLocaleDateString();
                    row.insertCell().textContent = request.status;
                    row.insertCell().textContent = request.admin_notes || '-';
                });
            } else {
                const row = userBorrowRequestsTableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 6;
                cell.textContent = 'Tidak ada permintaan peminjaman yang diajukan.';
                cell.style.textAlign = 'center';
            }
        } catch (error) {
            console.error('Error fetching user borrow requests:', error);
        }
    }

    async function fetchAdminBorrowRequests() {
        try {
            const response = await fetch('api.php?action=borrow_requests_list');
            const data = await response.json();
            adminBorrowRequestsTableBody.innerHTML = '';
            if (data.status === 'success' && data.data.length > 0) {
                data.data.forEach(request => {
                    const row = adminBorrowRequestsTableBody.insertRow();
                    row.insertCell().textContent = request.request_id;
                    row.insertCell().textContent = request.title;
                    row.insertCell().textContent = request.author;
                    row.insertCell().textContent = request.username;
                    row.insertCell().textContent = new Date(request.request_date).toLocaleDateString();
                    row.insertCell().textContent = request.status;

                    const actionCell = row.insertCell();
                    if (request.status === 'pending') {
                        const approveBorrowRequestButton = document.createElement('button');
                        approveBorrowRequestButton.textContent = 'Setujui Pinjam';
                        approveBorrowRequestButton.classList.add('approve-borrow-btn');
                        approveBorrowRequestButton.dataset.requestId = request.request_id;
                        approveBorrowRequestButton.dataset.bookId = request.book_id;
                        approveBorrowRequestButton.dataset.bookTitle = request.title;
                        approveBorrowRequestButton.dataset.borrowerName = request.username;
                        actionCell.appendChild(approveBorrowRequestButton);

                        const rejectBorrowRequestButton = document.createElement('button');
                        rejectBorrowRequestButton.textContent = 'Tolak Pinjam';
                        rejectBorrowRequestButton.classList.add('reject-borrow-btn');
                        rejectBorrowRequestButton.dataset.requestId = request.request_id;
                        actionCell.appendChild(rejectBorrowRequestButton);
                    }
                });
            } else {
                const row = adminBorrowRequestsTableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 7;
                cell.textContent = 'Tidak ada permintaan peminjaman yang tertunda.';
                cell.style.textAlign = 'center';
            }
        } catch (error) {
            console.error('Error fetching admin borrow requests:', error);
        }
    }

    // Dashboard Stats Chart Function
    async function fetchDashboardStats() {
        const chartContainer = document.getElementById('dashboard-stats-tab');
        if (chartContainer && chartContainer.classList.contains('active')) { // Only fetch if the tab is active
            try {
                const response = await fetch('api.php?action=dashboard_stats');
                const data = await response.json();

                if (data.status === 'success') {
                    const stats = data.data;
                    const ctx = document.getElementById('libraryStatsChart').getContext('2d');

                    if (libraryStatsChart) {
                        libraryStatsChart.destroy();
                    }

                    libraryStatsChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Total Buku', 'Buku Sedang Dipinjam', 'Buku Tersedia (di Stok)'],
                            datasets: [{
                                label: 'Jumlah Buku',
                                data: [stats.total_books, stats.borrowed_books, stats.available_books],
                                backgroundColor: [
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(54, 162, 235, 0.6)'
                                ],
                                borderColor: [
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Jumlah'
                                    },
                                    ticks: {
                                        stepSize: 1,
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: 'Ringkasan Status Buku Perpustakaan'
                                }
                            }
                        }
                    });
                } else {
                    console.error('Failed to fetch dashboard stats:', data.message);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        } else {
             // If chart tab is not active, destroy chart if it exists to free up memory
            if (libraryStatsChart) {
                libraryStatsChart.destroy();
                libraryStatsChart = null; // Clear the instance
            }
        }
    }


    // --- Tab Switching Logic ---
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all tabs and content sections
            navTabs.forEach(t => t.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show corresponding content section
            const targetTabId = this.dataset.tab + '-tab'; // e.g., "book-list" -> "book-list-tab"
            document.getElementById(targetTabId).classList.add('active');

            // Hide add/edit book forms when switching tabs
            addBookFormContainer.style.display = 'none';
            editBookFormContainer.style.display = 'none';
            // Show the "Tambah Buku Baru" button again if admin and not on edit/add form
            if (userRole === 'admin') {
                showAddBookFormButton.style.display = 'block';
            }


            // Re-fetch data relevant to the activated tab
            if (targetTabId === 'book-list-tab') {
                fetchBooks();
                // These are fetched initially, but refetching ensures they are up-to-date
                // if there were changes (e.g., admin added new genre/category)
                fetchGenres();
                fetchCategories();
            } else if (targetTabId === 'borrowed-books-tab') {
                fetchBorrowedBooks();
                if (userRole === 'peminjam') {
                    fetchUserBorrowRequests(); // Also fetch user's own requests if on their borrowed tab
                }
            } else if (targetTabId === 'borrow-requests-tab' && userRole === 'admin') {
                fetchAdminBorrowRequests();
            } else if (targetTabId === 'user-borrow-requests-tab' && userRole === 'peminjam') {
                fetchUserBorrowRequests();
            } else if (targetTabId === 'dashboard-stats-tab' && userRole === 'admin') {
                fetchDashboardStats();
            }
        });
    });


    // --- Event Listeners ---
    applyFilterButton.addEventListener('click', fetchBooks);
    resetFilterButton.addEventListener('click', function() {
        searchBookInput.value = '';
        filterGenreSelect.value = '';
        filterCategorySelect.value = '';
        fetchBooks();
    });

    searchBookInput.addEventListener('input', () => {
        if (searchBookInput.value.trim() !== '') {
            filterGenreSelect.value = '';
            filterCategorySelect.value = '';
        }
    });

    filterGenreSelect.addEventListener('change', () => {
        if (filterGenreSelect.value !== '') {
            searchBookInput.value = '';
            filterCategorySelect.value = '';
        }
    });

    filterCategorySelect.addEventListener('change', () => {
        if (filterCategorySelect.value !== '') {
            searchBookInput.value = '';
            filterGenreSelect.value = '';
        }
    });


    if (userRole === 'admin') {
        showAddBookFormButton.addEventListener('click', function() {
            addBookFormContainer.style.display = 'block';
            editBookFormContainer.style.display = 'none';
            showAddBookFormButton.style.display = 'none';
            addBookForm.reset();
            // Ensure select options are re-populated for a clean form
            populateSelect(addGenresSelect, allGenres);
            populateSelect(addCategoriesSelect, allCategories);
        });

        cancelAddBookButton.addEventListener('click', function() {
            addBookFormContainer.style.display = 'none';
            showAddBookFormButton.style.display = 'block';
            addBookForm.reset();
        });

        addBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const isbn = document.getElementById('isbn').value;
            const publication_year = document.getElementById('publication_year').value;
            const description = document.getElementById('description').value;
            const available_copies = document.getElementById('available_copies').value;
            const selectedGenres = Array.from(addGenresSelect.selectedOptions).map(option => parseInt(option.value));
            const selectedCategories = Array.from(addCategoriesSelect.selectedOptions).map(option => parseInt(option.value));

            fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, author, isbn, publication_year, description, available_copies, genres: selectedGenres, categories: selectedCategories })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    addBookForm.reset();
                    addBookFormContainer.style.display = 'none';
                    showAddBookFormButton.style.display = 'block';
                    fetchBooks();
                    fetchDashboardStats();
                } else {
                    alert('Gagal menambah buku: ' + data.message);
                }
            })
            .catch(error => console.error('Error adding book:', error));
        });

        bookTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-btn')) {
                const button = e.target;
                currentEditBookId = button.dataset.id;
                document.getElementById('edit_book_id').value = currentEditBookId;
                document.getElementById('edit_title').value = button.dataset.title;
                document.getElementById('edit_author').value = button.dataset.author;
                document.getElementById('edit_isbn').value = button.dataset.isbn;
                document.getElementById('edit_publication_year').value = button.dataset.publicationYear;
                document.getElementById('edit_description').value = button.dataset.description;
                document.getElementById('edit_available_copies').value = button.dataset.availableCopies;

                const selectedGenres = JSON.parse(button.dataset.genres || '[]');
                const selectedCategories = JSON.parse(button.dataset.categories || '[]');

                populateSelect(editGenresSelect, allGenres, selectedGenres);
                populateSelect(editCategoriesSelect, allCategories, selectedCategories);

                addBookFormContainer.style.display = 'none';
                editBookFormContainer.style.display = 'block';
                showAddBookFormButton.style.display = 'none';
            }
        });

        cancelEditBookButton.addEventListener('click', function() {
            editBookFormContainer.style.display = 'none';
            showAddBookFormButton.style.display = 'block';
            editBookForm.reset();
            currentEditBookId = null;
        });

        editBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('edit_book_id').value;
            const title = document.getElementById('edit_title').value;
            const author = document.getElementById('edit_author').value;
            const isbn = document.getElementById('edit_isbn').value;
            const publication_year = document.getElementById('edit_publication_year').value;
            const description = document.getElementById('edit_description').value;
            const available_copies = document.getElementById('edit_available_copies').value;
            const selectedGenres = Array.from(editGenresSelect.selectedOptions).map(option => parseInt(option.value));
            const selectedCategories = Array.from(editCategoriesSelect.selectedOptions).map(option => parseInt(option.value));

            const formData = new URLSearchParams();
            formData.append('id', id);
            formData.append('title', title);
            formData.append('author', author);
            formData.append('isbn', isbn);
            formData.append('publication_year', publication_year);
            formData.append('description', description);
            formData.append('available_copies', available_copies);
            formData.append('genres', JSON.stringify(selectedGenres));
            formData.append('categories', JSON.stringify(selectedCategories));

            fetch('api.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    editBookForm.reset();
                    editBookFormContainer.style.display = 'none';
                    showAddBookFormButton.style.display = 'block';
                    fetchBooks();
                    fetchDashboardStats();
                } else {
                    alert('Gagal memperbarui buku: ' + data.message);
                }
            })
            .catch(error => console.error('Error updating book:', error));
        });

        bookTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-btn')) {
                const bookId = e.target.dataset.id;
                if (confirm('Anda yakin ingin menghapus buku ini?')) {
                    const formData = new URLSearchParams();
                    formData.append('id', bookId);

                    fetch('api.php', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData.toString()
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            alert(data.message);
                            fetchBooks();
                            fetchBorrowedBooks(); // Refreshes admin's borrowed list
                            fetchAdminBorrowRequests(); // Only this call needed as it covers admin requests
                            fetchDashboardStats();
                        } else {
                            alert('Gagal menghapus buku: ' + data.message);
                        }
                    })
                    .catch(error => console.error('Error deleting book:', error));
                }
            }
        });

        adminBorrowedBookTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('return-btn')) {
                const button = e.target;
                bookToReturn = {
                    borrowedId: button.dataset.borrowedId,
                    bookId: button.dataset.bookId,
                    bookTitle: button.dataset.bookTitle,
                    borrowerName: button.dataset.borrowerName
                };

                modalBookTitle.textContent = bookToReturn.bookTitle;
                modalBorrowerName.textContent = bookToReturn.borrowerName;
                returnConfirmModal.style.display = 'flex';
            } else if (e.target.classList.contains('approve-btn')) {
                const button = e.target;
                bookToApproveReject = {
                    borrowedId: button.dataset.borrowedId,
                    bookId: button.dataset.bookId,
                    bookTitle: button.dataset.bookTitle,
                    borrowerName: button.dataset.borrowerName
                };
                modalApprovalBookTitle.textContent = bookToApproveReject.bookTitle;
                modalApprovalBorrowerName.textContent = bookToApproveReject.borrowerName;
                adminApprovalModal.style.display = 'flex';
                confirmApproveButton.style.display = 'inline-block';
                confirmRejectButton.style.display = 'inline-block';
            } else if (e.target.classList.contains('reject-btn')) {
                const borrowedId = e.target.dataset.borrowedId;
                if (confirm('Anda yakin ingin MENOLAK permintaan pengembalian ini? Status buku akan dikembalikan ke "dipinjam".')) {
                    fetch('api.php?action=reject_return', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ borrowed_id: borrowedId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        if (data.status === 'success') {
                            fetchBorrowedBooks();
                            fetchDashboardStats();
                        }
                    })
                    .catch(error => console.error('Error rejecting return:', error));
                }
            }
        });

        closeButton.addEventListener('click', () => {
            returnConfirmModal.style.display = 'none';
        });

        cancelReturnButton.addEventListener('click', () => {
            returnConfirmModal.style.display = 'none';
        });

        confirmReturnButton.addEventListener('click', async () => {
            try {
                const response = await fetch('api.php?action=approve_return', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ borrowed_id: bookToReturn.borrowedId, book_id: bookToReturn.bookId })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    alert(data.message);
                    fetchBooks();
                    fetchBorrowedBooks();
                    fetchDashboardStats();
                    returnConfirmModal.style.display = 'none';
                } else {
                    alert('Gagal mengembalikan buku: ' + data.message);
                }
            } catch (error) {
                console.error('Error returning book:', error);
                alert('Terjadi kesalahan saat mengembalikan buku.');
            }
        });

        closeApprovalModal.addEventListener('click', () => {
            adminApprovalModal.style.display = 'none';
        });

        cancelApprovalButton.addEventListener('click', () => {
            adminApprovalModal.style.display = 'none';
        });

        confirmApproveButton.addEventListener('click', async () => {
            try {
                const response = await fetch('api.php?action=approve_return', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ borrowed_id: bookToApproveReject.borrowedId, book_id: bookToApproveReject.bookId })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    alert(data.message);
                    fetchBooks();
                    fetchBorrowedBooks();
                    fetchDashboardStats();
                    adminApprovalModal.style.display = 'none';
                } else {
                    alert('Gagal menyetujui pengembalian: ' + data.message);
                }
            }
            catch (error) {
                console.error('Error approving return:', error);
                alert('Terjadi kesalahan saat menyetujui pengembalian.');
            }
        });

        adminBorrowRequestsTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('approve-borrow-btn')) {
                const button = e.target;
                borrowRequestToHandle = {
                    requestId: button.dataset.requestId,
                    bookId: button.dataset.bookId,
                    bookTitle: button.dataset.bookTitle,
                    borrowerName: button.dataset.borrowerName
                };
                modalBorrowRequestBookTitle.textContent = borrowRequestToHandle.bookTitle;
                modalBorrowRequestBorrowerName.textContent = borrowRequestToHandle.borrowerName;
                modalBorrowRequestAdminNotes.value = '';
                adminBorrowRequestApprovalModal.style.display = 'flex';
                confirmApproveBorrowRequestButton.style.display = 'inline-block';
                confirmRejectBorrowRequestButton.style.display = 'none';
            } else if (e.target.classList.contains('reject-borrow-btn')) {
                const button = e.target;
                borrowRequestToHandle = {
                    requestId: button.dataset.requestId,
                    bookTitle: button.dataset.bookTitle,
                    borrowerName: button.dataset.borrowerName
                };
                modalBorrowRequestBookTitle.textContent = borrowRequestToHandle.bookTitle;
                modalBorrowRequestBorrowerName.textContent = borrowRequestToHandle.borrowerName;
                modalBorrowRequestAdminNotes.value = '';
                adminBorrowRequestApprovalModal.style.display = 'flex';
                confirmApproveBorrowRequestButton.style.display = 'none';
                confirmRejectBorrowRequestButton.style.display = 'inline-block';
            }
        });

        closeBorrowRequestApprovalModal.addEventListener('click', () => {
            adminBorrowRequestApprovalModal.style.display = 'none';
        });

        cancelBorrowRequestApprovalButton.addEventListener('click', () => {
            adminBorrowRequestApprovalModal.style.display = 'none';
        });

        confirmApproveBorrowRequestButton.addEventListener('click', async () => {
            const adminNotes = modalBorrowRequestAdminNotes.value.trim();
            try {
                const response = await fetch('api.php?action=approve_borrow_request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        request_id: borrowRequestToHandle.requestId,
                        book_id: borrowRequestToHandle.bookId,
                        admin_notes: adminNotes
                    })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    alert(data.message);
                    fetchBooks();
                    fetchBorrowedBooks();
                    fetchAdminBorrowRequests();
                    fetchDashboardStats();
                    adminBorrowRequestApprovalModal.style.display = 'none';
                } else {
                    alert('Gagal menyetujui permintaan: ' + data.message);
                }
            } catch (error) {
                console.error('Error approving borrow request:', error);
                alert('Terjadi kesalahan saat menyetujui permintaan peminjaman.');
            }
        });

        confirmRejectBorrowRequestButton.addEventListener('click', async () => {
            const adminNotes = modalBorrowRequestAdminNotes.value.trim();
            if (!confirm('Anda yakin ingin MENOLAK permintaan peminjaman ini?')) {
                return;
            }
            try {
                const response = await fetch('api.php?action=reject_borrow_request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        request_id: borrowRequestToHandle.requestId,
                        admin_notes: adminNotes
                    })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    alert(data.message);
                    fetchAdminBorrowRequests();
                    fetchDashboardStats();
                    adminBorrowRequestApprovalModal.style.display = 'none';
                } else {
                    alert('Gagal menolak permintaan: ' + data.message);
                }
            } catch (error) {
                console.error('Error rejecting borrow request:', error);
                alert('Terjadi kesalahan saat menolak permintaan peminjaman.');
            }
        });


    } else if (userRole === 'peminjam') {
        bookTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('request-borrow-btn')) {
                const bookId = e.target.dataset.id;
                if (confirm('Anda yakin ingin mengajukan permintaan peminjaman buku ini? Admin akan meninjau permintaan Anda.')) {
                    fetch('api.php?action=request_borrow', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ book_id: bookId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            alert(data.message);
                            fetchBooks();
                            fetchBorrowedBooks(); // Refreshes both borrowed and user requests
                        } else {
                            alert('Gagal mengajukan peminjaman: ' + data.message);
                        }
                    })
                    .catch(error => console.error('Error requesting borrow:', error));
                }
            }
        });

        borrowedBookTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('request-return-btn')) {
                const borrowedId = e.target.dataset.borrowedId;
                if (confirm('Anda yakin ingin mengajukan permintaan pengembalian buku ini? Admin akan meninjau permintaan Anda.')) {
                    fetch('api.php?action=request_return', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ borrowed_id: borrowedId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        if (data.status === 'success') {
                            fetchBorrowedBooks(); // Refreshes both borrowed and user requests
                        }
                    })
                    .catch(error => console.error('Error requesting return:', error));
                }
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === returnConfirmModal) {
            returnConfirmModal.style.display = 'none';
        }
        if (event.target === adminApprovalModal) {
            adminApprovalModal.style.display = 'none';
        }
        if (event.target === adminBorrowRequestApprovalModal) {
            adminBorrowRequestApprovalModal.style.display = 'none';
        }
    });

    // --- Initial Load Logic ---
    // Fetch genres and categories regardless of user role, as they are used for filtering
    fetchGenres();
    fetchCategories();

    // Load content for the default active tab based on user role
    if (userRole === 'admin') {
        fetchDashboardStats(); // Load stats for admin dashboard initially
        // No need to explicitly call fetchAdminBorrowRequests/fetchBorrowedBooks here
        // as they will be called by the tab switching logic when their respective tabs are activated.
    } else if (userRole === 'peminjam') {
        fetchBooks(); // Load books for user's default 'book-list' tab immediately
        // Also load borrowed books and user's requests for peminjam
        // This is important because the 'borrowed-books' tab for peminjam
        // also fetches 'user-borrow-requests-status' when activated.
        fetchBorrowedBooks();
        fetchUserBorrowRequests();
    }
});