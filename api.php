<?php
session_start();

header('Content-Type: application/json');

$servername = "localhost";
$username_db = "root"; 
$password_db = "";    
$dbname = "library_db"; 

// Buat koneksi
$conn = new mysqli($servername, $username_db, $password_db, $dbname);

// Periksa koneksi
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $conn->connect_error]);
    exit();
}

function handleRequest($conn) {
    // Autentikasi dan pengecekan role
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please login.']);
        return;
    }

    $user_id = $_SESSION['user_id'];
    $role = $_SESSION['role'];

    $method = $_SERVER['REQUEST_METHOD'];
    $resource = isset($_GET['resource']) ? $_GET['resource'] : '';
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    switch ($method) {
        case 'GET':
            if ($resource === 'books') {
                $search = isset($_GET['search']) ? $_GET['search'] : '';
                $genre_id = isset($_GET['genre_id']) ? (int)$_GET['genre_id'] : 0;
                $category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

                $sql = "SELECT b.id, b.title, b.author, b.isbn, b.publication_year, b.description, b.available_copies,
                               GROUP_CONCAT(DISTINCT g.genre_name ORDER BY g.genre_name SEPARATOR ', ') AS genres,
                               GROUP_CONCAT(DISTINCT c.category_name ORDER BY c.category_name SEPARATOR ', ') AS categories
                        FROM books b
                        LEFT JOIN book_genres bg ON b.id = bg.book_id
                        LEFT JOIN genres g ON bg.genre_id = g.id
                        LEFT JOIN book_categories bc ON b.id = bc.book_id
                        LEFT JOIN categories c ON bc.book_id = c.id
                        WHERE 1=1";
                $params = [];
                $types = "";

                if ($search) {
                    $sql .= " AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)";
                    $searchTerm = '%' . $search . '%';
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                    $types .= "sss";
                }
                if ($genre_id > 0) {
                    $sql .= " AND bg.genre_id = ?";
                    $params[] = $genre_id;
                    $types .= "i";
                }
                if ($category_id > 0) {
                    $sql .= " AND bc.category_id = ?";
                    $params[] = $category_id;
                    $types .= "i";
                }

                $sql .= " GROUP BY b.id ORDER BY b.id ASC"; // Ubah untuk urutan ID

                $stmt = $conn->prepare($sql);
                if (!empty($params)) {
                    $stmt->bind_param($types, ...$params);
                }
                $stmt->execute();
                $result = $stmt->get_result();
                $books = [];
                while ($row = $result->fetch_assoc()) {
                    $books[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $books]);
                $stmt->close();
            } elseif ($resource === 'genres') {
                $result = $conn->query("SELECT id, genre_name FROM genres ORDER BY genre_name ASC");
                $genres = [];
                while ($row = $result->fetch_assoc()) {
                    $genres[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $genres]);
            } elseif ($resource === 'categories') {
                $result = $conn->query("SELECT id, category_name FROM categories ORDER BY category_name ASC");
                $categories = [];
                while ($row = $result->fetch_assoc()) {
                    $categories[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $categories]);
            } elseif ($action === 'borrowed_list' && $role === 'peminjam') {
                $stmt = $conn->prepare("
                    SELECT bb.id as borrowed_id, b.id as book_id, b.title, b.author, bb.borrow_date, bb.due_date, bb.return_date, bb.status
                    FROM borrowed_books bb
                    JOIN books b ON bb.book_id = b.id
                    WHERE bb.user_id = ?
                    ORDER BY bb.borrow_date DESC
                ");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $borrowed_books = [];
                while ($row = $result->fetch_assoc()) {
                    $borrowed_books[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $borrowed_books]);
                $stmt->close();
            } elseif ($action === 'admin_borrowed_list' && $role === 'admin') {
                $stmt = $conn->prepare("
                    SELECT bb.id AS borrowed_id, b.id AS book_id, b.title, b.author, u.username,
                           bb.borrow_date, bb.due_date, bb.return_date, bb.status
                    FROM borrowed_books bb
                    JOIN books b ON bb.book_id = b.id
                    JOIN users u ON bb.user_id = u.id
                    ORDER BY bb.borrow_date DESC
                ");
                $stmt->execute();
                $result = $stmt->get_result();
                $admin_borrowed_books = [];
                while ($row = $result->fetch_assoc()) {
                    $admin_borrowed_books[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $admin_borrowed_books]);
                $stmt->close();
            } elseif ($action === 'borrow_requests_list' && $role === 'admin') { // NEW: Admin requests list
                $stmt = $conn->prepare("
                    SELECT br.id AS request_id, b.title, b.author, u.username, br.request_date, br.status, br.admin_notes, b.id AS book_id
                    FROM borrow_requests br
                    JOIN books b ON br.book_id = b.id
                    JOIN users u ON br.user_id = u.id
                    WHERE br.status = 'pending'
                    ORDER BY br.request_date ASC
                ");
                $stmt->execute();
                $result = $stmt->get_result();
                $borrow_requests = [];
                while ($row = $result->fetch_assoc()) {
                    $borrow_requests[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $borrow_requests]);
                $stmt->close();
            } elseif ($action === 'user_borrow_requests_status' && $role === 'peminjam') { // NEW: User's own request status
                $stmt = $conn->prepare("
                    SELECT br.id AS request_id, b.title, b.author, br.request_date, br.status, br.admin_notes
                    FROM borrow_requests br
                    JOIN books b ON br.book_id = b.id
                    WHERE br.user_id = ?
                    ORDER BY br.request_date DESC
                ");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $user_requests = [];
                while ($row = $result->fetch_assoc()) {
                    $user_requests[] = $row;
                }
                echo json_encode(['status' => 'success', 'data' => $user_requests]);
                $stmt->close();
            } elseif ($action === 'dashboard_stats' && $role === 'admin') { // NEW: Dashboard Stats for Admin
                $stats = [
                    'total_books' => 0,
                    'borrowed_books' => 0,
                    'available_books' => 0
                ];

                // Total Books (Unique titles)
                $result = $conn->query("SELECT COUNT(id) AS total FROM books");
                if ($result) {
                    $stats['total_books'] = $result->fetch_assoc()['total'];
                }

                // Books currently borrowed (status 'dipinjam' or 'menunggu_persetujuan' for return)
                $result = $conn->query("SELECT COUNT(id) AS total FROM borrowed_books WHERE status = 'dipinjam' OR status = 'menunggu_persetujuan'");
                if ($result) {
                    $stats['borrowed_books'] = $result->fetch_assoc()['total'];
                }

                // Available Books (sum of available_copies)
                $result = $conn->query("SELECT SUM(available_copies) AS total FROM books");
                if ($result) {
                    $stats['available_books'] = $result->fetch_assoc()['total'];
                }

                echo json_encode(['status' => 'success', 'data' => $stats]);

            } else {
                http_response_code(400); // Bad Request
                echo json_encode(['status' => 'error', 'message' => 'Invalid GET request.']);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if ($action === 'request_borrow' && $role === 'peminjam') { // Changed action from 'borrow' to 'request_borrow'
                $book_id = $input['book_id'];

                // Mulai transaksi
                $conn->begin_transaction();

                try {
                    // Cek ketersediaan buku
                    $stmt_check = $conn->prepare("SELECT available_copies FROM books WHERE id = ? FOR UPDATE");
                    $stmt_check->bind_param("i", $book_id);
                    $stmt_check->execute();
                    $result_check = $stmt_check->get_result();
                    $book_data = $result_check->fetch_assoc();
                    $stmt_check->close();

                    if (!$book_data || $book_data['available_copies'] <= 0) {
                        throw new Exception("Buku tidak tersedia untuk dipinjam.");
                    }

                    // Cek apakah user sudah punya permintaan pending untuk buku ini
                    $stmt_pending_check = $conn->prepare("SELECT id FROM borrow_requests WHERE user_id = ? AND book_id = ? AND status = 'pending'");
                    $stmt_pending_check->bind_param("ii", $user_id, $book_id);
                    $stmt_pending_check->execute();
                    $stmt_pending_check->store_result();
                    if ($stmt_pending_check->num_rows > 0) {
                        throw new Exception("Anda sudah memiliki permintaan peminjaman tertunda untuk buku ini.");
                    }
                    $stmt_pending_check->close();

                    // Cek apakah user sudah meminjam buku ini dan belum dikembalikan/masih dalam proses pengembalian
                    $stmt_borrowed_check = $conn->prepare("SELECT id FROM borrowed_books WHERE user_id = ? AND book_id = ? AND (status = 'dipinjam' OR status = 'menunggu_persetujuan')");
                    $stmt_borrowed_check->bind_param("ii", $user_id, $book_id);
                    $stmt_borrowed_check->execute();
                    $stmt_borrowed_check->store_result();
                    if ($stmt_borrowed_check->num_rows > 0) {
                        throw new Exception("Anda sudah meminjam buku ini atau sedang dalam proses pengembalian.");
                    }
                    $stmt_borrowed_check->close();


                    // Tambahkan permintaan peminjaman ke tabel borrow_requests
                    $stmt_request = $conn->prepare("INSERT INTO borrow_requests (user_id, book_id, request_date, status) VALUES (?, ?, NOW(), 'pending')");
                    $stmt_request->bind_param("ii", $user_id, $book_id);
                    $stmt_request->execute();
                    $stmt_request->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Permintaan peminjaman buku berhasil diajukan. Menunggu persetujuan admin.']);
                } catch (Exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal mengajukan permintaan peminjaman: ' . $e->getMessage()]);
                }
            } elseif ($action === 'approve_borrow_request' && $role === 'admin') { // NEW: Admin approve borrow request
                $request_id = $input['request_id'];
                $admin_notes = isset($input['admin_notes']) ? $input['admin_notes'] : null;

                $conn->begin_transaction();
                try {
                    // Dapatkan detail permintaan
                    $stmt_get_request = $conn->prepare("SELECT user_id, book_id FROM borrow_requests WHERE id = ? AND status = 'pending' FOR UPDATE");
                    $stmt_get_request->bind_param("i", $request_id);
                    $stmt_get_request->execute();
                    $result_get_request = $stmt_get_request->get_result();
                    $request_data = $result_get_request->fetch_assoc();
                    $stmt_get_request->close();

                    if (!$request_data) {
                        throw new Exception("Permintaan peminjaman tidak ditemukan atau tidak dalam status pending.");
                    }

                    $book_id = $request_data['book_id'];
                    $borrower_id = $request_data['user_id'];
                    $borrow_date = date('Y-m-d H:i:s');
                    $due_date = date('Y-m-d H:i:s', strtotime('+7 days')); // Jatuh tempo 7 hari dari sekarang

                    // Cek ketersediaan buku lagi
                    $stmt_check_book = $conn->prepare("SELECT available_copies FROM books WHERE id = ? FOR UPDATE");
                    $stmt_check_book->bind_param("i", $book_id);
                    $stmt_check_book->execute();
                    $result_check_book = $stmt_check_book->get_result();
                    $book_info = $result_check_book->fetch_assoc();
                    $stmt_check_book->close();

                    if (!$book_info || $book_info['available_copies'] <= 0) {
                        throw new Exception("Buku tidak tersedia lagi.");
                    }

                    // Kurangi stok buku
                    $stmt_update_book = $conn->prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
                    $stmt_update_book->bind_param("i", $book_id);
                    $stmt_update_book->execute();
                    $stmt_update_book->close();

                    // Tambahkan entri peminjaman ke borrowed_books
                    $stmt_borrow = $conn->prepare("INSERT INTO borrowed_books (user_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, 'dipinjam')");
                    $stmt_borrow->bind_param("iiss", $borrower_id, $book_id, $borrow_date, $due_date);
                    $stmt_borrow->execute();
                    $stmt_borrow->close();

                    // Perbarui status permintaan di borrow_requests
                    $stmt_update_request = $conn->prepare("UPDATE borrow_requests SET status = 'approved', admin_notes = ?, request_date = NOW() WHERE id = ?"); // Update request_date to NOW for approval timestamp
                    $stmt_update_request->bind_param("si", $admin_notes, $request_id);
                    $stmt_update_request->execute();
                    $stmt_update_request->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Permintaan peminjaman berhasil disetujui. Buku telah dipinjamkan.']);
                } catch (Exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal menyetujui permintaan peminjaman: ' . $e->getMessage()]);
                }
            } elseif ($action === 'reject_borrow_request' && $role === 'admin') { // NEW: Admin reject borrow request
                $request_id = $input['request_id'];
                $admin_notes = isset($input['admin_notes']) ? $input['admin_notes'] : null;

                $conn->begin_transaction();
                try {
                    // Perbarui status permintaan di borrow_requests
                    $stmt_update_request = $conn->prepare("UPDATE borrow_requests SET status = 'rejected', admin_notes = ?, request_date = NOW() WHERE id = ? AND status = 'pending'");
                    $stmt_update_request->bind_param("si", $admin_notes, $request_id);
                    $stmt_update_request->execute();

                    if ($stmt_update_request->affected_rows === 0) {
                        throw new Exception("Permintaan peminjaman tidak ditemukan atau tidak dalam status pending.");
                    }
                    $stmt_update_request->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Permintaan peminjaman berhasil ditolak.']);
                } catch (Exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal menolak permintaan peminjaman: ' . $e->getMessage()]);
                }
            } elseif ($action === 'request_return' && $role === 'peminjam') {
                $borrowed_id = $input['borrowed_id'];

                // Cek status buku saat ini untuk memastikan bukan status 'dikembalikan' atau 'menunggu_persetujuan'
                $stmt_check_status = $conn->prepare("SELECT status FROM borrowed_books WHERE id = ? AND user_id = ?");
                $stmt_check_status->bind_param("ii", $borrowed_id, $user_id);
                $stmt_check_status->execute();
                $result_check_status = $stmt_check_status->get_result();
                $borrow_info = $result_check_status->fetch_assoc();
                $stmt_check_status->close();

                if (!$borrow_info) {
                    echo json_encode(['status' => 'error', 'message' => 'Peminjaman tidak ditemukan atau bukan milik Anda.']);
                    return;
                }
                if ($borrow_info['status'] === 'dikembalikan' || $borrow_info['status'] === 'menunggu_persetujuan') {
                    echo json_encode(['status' => 'error', 'message' => 'Buku sudah dikembalikan atau sedang dalam proses persetujuan.']);
                    return;
                }

                $stmt = $conn->prepare("UPDATE borrowed_books SET status = 'menunggu_persetujuan' WHERE id = ? AND user_id = ?");
                $stmt->bind_param("ii", $borrowed_id, $user_id);
                if ($stmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Permintaan pengembalian buku berhasil diajukan. Menunggu persetujuan admin.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Gagal mengajukan permintaan pengembalian.']);
                }
                $stmt->close();

            } elseif ($action === 'approve_return' && $role === 'admin') {
                $borrowed_id = $input['borrowed_id'];
                $book_id = $input['book_id'];
                $return_date = date('Y-m-d H:i:s');

                $conn->begin_transaction();
                try {
                    // Pastikan statusnya memang 'menunggu_persetujuan' atau 'dipinjam' (untuk admin langsung)
                    $stmt_check_status = $conn->prepare("SELECT status FROM borrowed_books WHERE id = ? FOR UPDATE");
                    $stmt_check_status->bind_param("i", $borrowed_id);
                    $stmt_check_status->execute();
                    $result_check_status = $stmt_check_status->get_result();
                    $borrow_info = $result_check_status->fetch_assoc();
                    $stmt_check_status->close();

                    if (!$borrow_info || ($borrow_info['status'] !== 'menunggu_persetujuan' && $borrow_info['status'] !== 'dipinjam')) {
                        throw new Exception("Status pengembalian tidak valid untuk disetujui.");
                    }

                    $stmt_borrow = $conn->prepare("UPDATE borrowed_books SET status = 'dikembalikan', return_date = ? WHERE id = ?");
                    $stmt_borrow->bind_param("si", $return_date, $borrowed_id);
                    $stmt_borrow->execute();
                    $stmt_borrow->close();

                    $stmt_book = $conn->prepare("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?");
                    $stmt_book->bind_param("i", $book_id);
                    $stmt_book->execute();
                    $stmt_book->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Pengembalian buku berhasil disetujui.']);
                } catch (Exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal menyetujui pengembalian: ' . $e->getMessage()]);
                }
            } elseif ($action === 'reject_return' && $role === 'admin') {
                $borrowed_id = $input['borrowed_id'];

                $conn->begin_transaction();
                try {
                    // Pastikan statusnya memang 'menunggu_persetujuan'
                    $stmt_check_status = $conn->prepare("SELECT status FROM borrowed_books WHERE id = ? FOR UPDATE");
                    $stmt_check_status->bind_param("i", $borrowed_id);
                    $stmt_check_status->execute();
                    $result_check_status = $stmt_check_status->get_result();
                    $borrow_info = $result_check_status->fetch_assoc();
                    $stmt_check_status->close();

                    if (!$borrow_info || $borrow_info['status'] !== 'menunggu_persetujuan') {
                        throw new Exception("Status pengembalian tidak valid untuk ditolak.");
                    }

                    // Kembalikan status ke 'dipinjam'
                    $stmt = $conn->prepare("UPDATE borrowed_books SET status = 'dipinjam' WHERE id = ?");
                    $stmt->bind_param("i", $borrowed_id);
                    $stmt->execute();
                    $stmt->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Permintaan pengembalian buku berhasil ditolak. Status dikembalikan ke "dipinjam".']);
                } catch (Exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal menolak permintaan pengembalian: ' . $e->getMessage()]);
                }
            } elseif ($role === 'admin') { // Add/Edit Book logic
                $title = $input['title'];
                $author = $input['author'];
                $isbn = $input['isbn'];
                $publication_year = $input['publication_year'];
                $description = isset($input['description']) ? $input['description'] : null;
                $available_copies = $input['available_copies'];
                $genres = isset($input['genres']) ? $input['genres'] : [];
                $categories = isset($input['categories']) ? $input['categories'] : [];

                $conn->begin_transaction();
                try {
                    $stmt = $conn->prepare("INSERT INTO books (title, author, isbn, publication_year, description, available_copies) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param("sssisi", $title, $author, $isbn, $publication_year, $description, $available_copies);
                    $stmt->execute();
                    $book_id = $stmt->insert_id;
                    $stmt->close();

                    foreach ($genres as $genre_id) {
                        $stmt_genre = $conn->prepare("INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)");
                        $stmt_genre->bind_param("ii", $book_id, $genre_id);
                        $stmt_genre->execute();
                        $stmt_genre->close();
                    }

                    foreach ($categories as $category_id) {
                        $stmt_category = $conn->prepare("INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)");
                        $stmt_category->bind_param("ii", $book_id, $category_id);
                        $stmt_category->execute();
                        $stmt_category->close();
                    }

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Buku berhasil ditambahkan.']);
                } catch (mysqli_sql_exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal menambah buku: ' . $e->getMessage()]);
                }
            } else {
                http_response_code(403); // Forbidden
                echo json_encode(['status' => 'error', 'message' => 'Access denied.']);
            }
            break;

        case 'PUT':
            parse_str(file_get_contents("php://input"), $input); // Handle x-www-form-urlencoded

            if ($role === 'admin') {
                $id = $input['id'];
                $title = $input['title'];
                $author = $input['author'];
                $isbn = $input['isbn'];
                $publication_year = $input['publication_year'];
                $description = isset($input['description']) ? $input['description'] : null;
                $available_copies = $input['available_copies'];
                $genres = isset($input['genres']) ? json_decode($input['genres']) : [];
                $categories = isset($input['categories']) ? json_decode($input['categories']) : [];

                $conn->begin_transaction();
                try {
                    $stmt = $conn->prepare("UPDATE books SET title = ?, author = ?, isbn = ?, publication_year = ?, description = ?, available_copies = ? WHERE id = ?");
                    $stmt->bind_param("sssissi", $title, $author, $isbn, $publication_year, $description, $available_copies, $id);
                    $stmt->execute();
                    $stmt->close();

                    // Update genres
                    $conn->query("DELETE FROM book_genres WHERE book_id = $id");
                    foreach ($genres as $genre_id) {
                        $stmt_genre = $conn->prepare("INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)");
                        $stmt_genre->bind_param("ii", $id, $genre_id);
                        $stmt_genre->execute();
                        $stmt_genre->close();
                    }

                    // Update categories
                    $conn->query("DELETE FROM book_categories WHERE book_id = $id");
                    foreach ($categories as $category_id) {
                        $stmt_category = $conn->prepare("INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)");
                        $stmt_category->bind_param("ii", $id, $category_id);
                        $stmt_category->execute();
                        $stmt_category->close();
                    }

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Buku berhasil diperbarui.']);
                } catch (mysqli_sql_exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui buku: ' . $e->getMessage()]);
                }
            } else {
                http_response_code(403); // Forbidden
                echo json_encode(['status' => 'error', 'message' => 'Access denied.']);
            }
            break;

        case 'DELETE':
            parse_str(file_get_contents("php://input"), $input); // Handle x-www-form-urlencoded

            if ($role === 'admin') {
                $id = $input['id'];

                $conn->begin_transaction();
                try {
                    // Hapus entri di book_genres dan book_categories terlebih dahulu (jika ada cascade delete tidak perlu manual)
                    $conn->query("DELETE FROM book_genres WHERE book_id = $id");
                    $conn->query("DELETE FROM book_categories WHERE book_id = $id");
                    $conn->query("DELETE FROM borrowed_books WHERE book_id = $id"); // Hapus data peminjaman terkait
                    $conn->query("DELETE FROM borrow_requests WHERE book_id = $id"); // NEW: Hapus permintaan peminjaman terkait

                    $stmt = $conn->prepare("DELETE FROM books WHERE id = ?");
                    $stmt->bind_param("i", $id);
                    $stmt->execute();
                    $stmt->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Buku berhasil dihapus.']);
                } catch (mysqli_sql_exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Gagal menghapus buku: ' . $e->getMessage()]);
                }
            } else {
                http_response_code(403); // Forbidden
                echo json_encode(['status' => 'error', 'message' => 'Access denied.']);
            }
            break;

        default:
            http_response_code(405); // Method Not Allowed
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
            break;
    }
}

// Jalankan fungsi penanganan permintaan
handleRequest($conn);

// Tutup koneksi database setelah selesai
$conn->close();
?>
