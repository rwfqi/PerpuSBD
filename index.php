<?php
session_start();

// Periksa apakah pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Periksa peran pengguna
$role = $_SESSION['role'];
$username = $_SESSION['username'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Perpustakaan</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/book.png" href="favicon.ico">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body data-user-role="<?php echo htmlspecialchars($role); ?>">
    <div class="container">
        <header>
            <h1>Selamat Datang, <?php echo htmlspecialchars($username); ?> (<?php echo htmlspecialchars($role); ?>)</h1>
            <nav>
                <ul>
                    <?php if ($role === 'admin'): ?>
                        <li><a href="#" class="nav-tab active" data-tab="dashboard-stats">Dashboard Statistik</a></li>
                        <li><a href="#" class="nav-tab" data-tab="book-list">Daftar Buku</a></li>
                        <li><a href="#" class="nav-tab" data-tab="borrow-requests">Permintaan Peminjaman</a></li>
                        <li><a href="#" class="nav-tab" data-tab="borrowed-books">Buku Sedang Dipinjam</a></li>
                        <li><a href="#" id="showAddBookForm">Tambah Buku Baru</a></li>
                    <?php elseif ($role === 'peminjam'): ?>
                        <li><a href="#" class="nav-tab active" data-tab="book-list">Daftar Buku</a></li>
                        <li><a href="#" class="nav-tab" data-tab="user-borrow-requests">Status Permintaan Anda</a></li>
                        <li><a href="#" class="nav-tab" data-tab="borrowed-books">Buku yang Anda Pinjam</a></li>
                    <?php endif; ?>
                    <li><a href="logout.php" class="logout-button">Logout</a></li>
                </ul>
            </nav>
        </header>

        <hr>

        <?php if ($role === 'admin'): ?>
            <div id="dashboard-stats-tab" class="content-section active">
                <h2>Statistik Perpustakaan</h2>
                <div class="chart-container">
                    <canvas id="libraryStatsChart"></canvas>
                </div>
                <hr>
            </div>
            <div id="book-list-tab" class="content-section">
                <h2>Daftar Buku</h2>
                <div class="filter-section">
                    <input type="text" id="searchBook" placeholder="Cari Judul/Penulis/ISBN...">
                    <select id="filterGenre"></select>
                    <select id="filterCategory"></select>
                    <button id="applyFilter">Filter</button>
                    <button id="resetFilter">Reset Filter</button>
                </div>
                <div class="table-container">
                    <table id="bookTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Judul</th>
                                <th>Penulis</th>
                                <th>ISBN</th>
                                <th>Tahun Publikasi</th>
                                <th>Deskripsi</th>
                                <th>Genre</th>
                                <th>Kategori</th>
                                <th>Salinan Tersedia</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </div>
            <div id="borrow-requests-tab" class="content-section">
                <h2>Permintaan Peminjaman Buku (Menunggu Persetujuan)</h2>
                <div class="table-container">
                    <table id="adminBorrowRequestsTable">
                        <thead>
                            <tr>
                                <th>ID Permintaan</th>
                                <th>Judul Buku</th>
                                <th>Penulis</th>
                                <th>Peminjam</th>
                                <th>Tanggal Permintaan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </div>
            <div id="borrowed-books-tab" class="content-section">
                <h2>Buku yang Sedang Dipinjam</h2>
                <div class="table-container">
                    <table id="adminBorrowedBookTable">
                        <thead>
                            <tr>
                                <th>ID Peminjaman</th>
                                <th>Judul Buku</th>
                                <th>Penulis</th>
                                <th>Peminjam</th>
                                <th>Tanggal Pinjam</th>
                                <th>Tanggal Jatuh Tempo</th>
                                <th>Tanggal Kembali</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </div>

            <div id="addBookFormContainer" class="form-container" style="display:none;">
                <h2>Tambah Buku Baru</h2>
                <form id="addBookForm">
                    <label for="title">Judul:</label>
                    <input type="text" id="title" name="title" required>

                    <label for="author">Penulis:</label>
                    <input type="text" id="author" name="author" required>

                    <label for="isbn">ISBN:</label>
                    <input type="text" id="isbn" name="isbn" required>

                    <label for="publication_year">Tahun Publikasi:</label>
                    <input type="number" id="publication_year" name="publication_year" required>

                    <label for="description">Deskripsi:</label>
                    <textarea id="description" name="description"></textarea>

                    <label for="available_copies">Jumlah Salinan Tersedia:</label>
                    <input type="number" id="available_copies" name="available_copies" min="0" required>

                    <label for="add_genres">Genre:</label>
                    <select id="add_genres" multiple></select>

                    <label for="add_categories">Kategori:</label>
                    <select id="add_categories" multiple></select>

                    <button type="submit">Tambah Buku</button>
                    <button type="button" id="cancelAddBook" class="cancel-btn">Batal</button>
                </form>
            </div>

            <div id="editBookFormContainer" class="form-container" style="display:none;">
                <h2>Edit Buku</h2>
                <form id="editBookForm">
                    <input type="hidden" id="edit_book_id" name="id">

                    <label for="edit_title">Judul:</label>
                    <input type="text" id="edit_title" name="title" required>

                    <label for="edit_author">Penulis:</label>
                    <input type="text" id="edit_author" name="author" required>

                    <label for="edit_isbn">ISBN:</label>
                    <input type="text" id="edit_isbn" name="isbn" required>

                    <label for="edit_publication_year">Tahun Publikasi:</label>
                    <input type="number" id="edit_publication_year" name="publication_year" required>

                    <label for="edit_description">Deskripsi:</label>
                    <textarea id="edit_description" name="description"></textarea>

                    <label for="edit_available_copies">Jumlah Salinan Tersedia:</label>
                    <input type="number" id="edit_available_copies" name="available_copies" min="0" required>

                    <label for="edit_genres">Genre:</label>
                    <select id="edit_genres" multiple></select>

                    <label for="edit_categories">Kategori:</label>
                    <select id="edit_categories" multiple></select>

                    <button type="submit">Simpan Perubahan</button>
                    <button type="button" id="cancelEditBook" class="cancel-btn">Batal</button>
                </form>
            </div>

            <div id="returnConfirmModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h3>Konfirmasi Pengembalian Langsung</h3>
                    <p>Anda yakin ingin mengembalikan buku "<span id="modalBookTitle"></span>" yang dipinjam oleh "<span id="modalBorrowerName"></span>"?</p>
                    <button id="confirmReturnButton" class="confirm-btn">Ya, Kembalikan</button>
                    <button id="cancelReturnButton" class="cancel-btn">Batal</button>
                </div>
            </div>

            <div id="adminApprovalModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h3>Persetujuan Pengembalian Buku</h3>
                    <p>Apakah Anda akan **menyetujui** atau **menolak** pengembalian buku "<span id="modalApprovalBookTitle"></span>" yang diajukan oleh "<span id="modalApprovalBorrowerName"></span>"?</p>
                    <button id="confirmApproveButton" class="confirm-btn">Setujui Pengembalian</button>
                    <button id="confirmRejectButton" class="reject-btn-modal">Tolak Pengembalian</button>
                    <button id="cancelApprovalButton" class="cancel-btn">Batal</button>
                </div>
            </div>

            <div id="adminBorrowRequestApprovalModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h3>Persetujuan Permintaan Peminjaman</h3>
                    <p>Permintaan peminjaman buku "<span id="modalBorrowRequestBookTitle"></span>" oleh "<span id="modalBorrowRequestBorrowerName"></span>".</p>
                    <label for="modalBorrowRequestAdminNotes">Catatan Admin (Opsional):</label>
                    <textarea id="modalBorrowRequestAdminNotes" rows="3" placeholder="Tambahkan catatan untuk peminjam..."></textarea>
                    <div style="margin-top: 15px;">
                        <button id="confirmApproveBorrowRequestButton" class="confirm-btn">Setujui Permintaan</button>
                        <button id="confirmRejectBorrowRequestButton" class="reject-btn-modal">Tolak Permintaan</button>
                        <button id="cancelBorrowRequestApprovalButton" class="cancel-btn">Batal</button>
                    </div>
                </div>
            </div>

        <?php elseif ($role === 'peminjam'): ?>
            <div id="book-list-tab" class="content-section active">
                <h2>Daftar Buku</h2>
                <div class="filter-section">
                    <input type="text" id="searchBook" placeholder="Cari Judul/Penulis/ISBN...">
                    <select id="filterGenre"></select>
                    <select id="filterCategory"></select>
                    <button id="applyFilter">Filter</button>
                    <button id="resetFilter">Reset Filter</button>
                </div>
                <div class="table-container">
                    <table id="bookTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Judul</th>
                                <th>Penulis</th>
                                <th>ISBN</th>
                                <th>Tahun Publikasi</th>
                                <th>Deskripsi</th>
                                <th>Genre</th>
                                <th>Kategori</th>
                                <th>Salinan Tersedia</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </div>
            <div id="user-borrow-requests-tab" class="content-section">
                <h2>Permintaan Peminjaman Anda</h2>
                <div class="table-container">
                    <table id="userBorrowRequestsTable">
                        <thead>
                            <tr>
                                <th>ID Permintaan</th>
                                <th>Judul Buku</th>
                                <th>Penulis</th>
                                <th>Tanggal Permintaan</th>
                                <th>Status</th>
                                <th>Catatan Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </div>
            <div id="borrowed-books-tab" class="content-section">
                <h2>Buku yang Anda Pinjam</h2>
                <div class="table-container">
                    <table id="borrowedBookTable">
                        <thead>
                            <tr>
                                <th>ID Peminjaman</th>
                                <th>Judul Buku</th>
                                <th>Penulis</th>
                                <th>Tanggal Pinjam</th>
                                <th>Tanggal Jatuh Tempo</th>
                                <th>Tanggal Kembali</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <script src="js/script.js"></script>
</body>
</html>