-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 04:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `library_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `publication_year` int(11) DEFAULT NULL,
  `available_copies` int(11) DEFAULT 1,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `publication_year`, `available_copies`, `description`) VALUES
(1, 'The Hobbit', 'J.R.R. Tolkien', '978-0-261-10328-3', 1937, 4, 'A fantasy adventure of a hobbit named Bilbo Baggins on a quest to reclaim a treasure guarded by a dragon.'),
(2, 'Pride and Prejudice', 'Jane Austen', '978-0-141-43951-8', 1813, 3, 'A romantic tale of Elizabeth Bennet as she navigates love, manners, and social status in 19th century England.'),
(3, '1984', 'George Orwell', '978-0-452-28423-4', 1949, 3, 'A chilling dystopian novel about a totalitarian regime that uses surveillance and propaganda to control society.'),
(4, 'To Kill a Mockingbird', 'Harper Lee', '978-0-06-093546-7', 1960, 2, 'A powerful novel about racial injustice and moral growth in the Deep South, seen through a child’s eyes.'),
(5, 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 1925, 6, 'A tragic story of love, wealth, and the American Dream set in the Roaring Twenties.'),
(6, 'Moby Dick', 'Herman Melville', '978-0-14-243724-7', 1851, 3, 'The epic journey of Captain Ahab as he obsessively hunts the great white whale Moby Dick.'),
(7, 'War and Peace', 'Leo Tolstoy', '978-0-14-044793-4', 1869, 2, 'A sweeping historical novel covering the impact of war on Russian society and aristocracy.'),
(8, 'The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 1951, 5, 'A coming-of-age story about teenage angst, rebellion, and the struggle for identity.'),
(9, 'The Lord of the Rings', 'J.R.R. Tolkien', '978-0-618-00222-8', 1954, 7, 'An epic high-fantasy quest to destroy the One Ring and defeat the Dark Lord Sauron.'),
(10, 'Jane Eyre', 'Charlotte Brontë', '978-0-14-144114-6', 1847, 3, 'A gothic novel exploring love, morality, and gender roles through the life of Jane Eyre.'),
(11, 'Brave New World', 'Aldous Huxley', '978-0-06-085052-4', 1932, 3, 'A dystopian vision of a future society driven by technology, consumerism, and genetic control.'),
(12, 'Wuthering Heights', 'Emily Brontë', '978-0-14-143955-6', 1847, 4, 'A dark romantic tale of obsession, revenge, and the destructive power of passion.'),
(13, 'Animal Farm', 'George Orwell', '978-0-452-28424-1', 1945, 6, 'A political allegory using animals to depict the rise and corruption of power in a totalitarian regime.'),
(14, 'The Alchemist', 'Paulo Coelho', '978-0-06-112241-5', 1988, 8, 'A philosophical journey of self-discovery and spiritual awakening across cultures and experiences.'),
(15, 'Crime and Punishment', 'Fyodor Dostoevsky', '978-0-14-044913-6', 1866, 2, 'A psychological exploration of guilt, redemption, and morality in the mind of a murderer.'),
(16, 'The Da Vinci Code', 'Dan Brown', '978-0-385-50420-8', 2003, 10, 'A modern thriller involving secret codes, symbology, and a conspiracy hidden in art and history.'),
(17, 'The Kite Runner', 'Khaled Hosseini', '978-1-59448-000-3', 2003, 7, 'A touching story of friendship and redemption set against the backdrop of Afghanistan’s turmoil.'),
(18, 'Memoirs of a Geisha', 'Arthur Golden', '978-0-679-78158-4', 1997, 5, 'A historical love story of a Japanese geisha and her struggle against cultural and societal constraints.'),
(19, 'A Game of Thrones', 'George R.R. Martin', '978-0-553-10354-0', 1996, 6, 'A fantasy epic of power, politics, and prophecy in a world where winters can last a lifetime.'),
(20, 'The Fault in Our Stars', 'John Green', '978-0-525-47881-2', 2012, 3, 'A young adult romance about two teens facing illness and falling in love against all odds.'),
(21, 'The Hunger Games', 'Suzanne Collins', '978-0-439-02352-8', 2008, 9, 'A dystopian survival game where teens fight to the death in a televised competition.'),
(22, 'Dune', 'Frank Herbert', '978-0-441-17271-9', 1965, 5, 'A science fiction saga about politics, power, and prophecy on the desert planet of Arrakis.'),
(23, 'No Longer Human', 'Osamu Dazai', '978-0-811-204-811', 1973, 5, 'A dark introspective novel exploring depression, identity, and societal alienation in postwar Japan.');

-- --------------------------------------------------------

--
-- Table structure for table `book_categories`
--

CREATE TABLE `book_categories` (
  `book_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_categories`
--

INSERT INTO `book_categories` (`book_id`, `category_id`) VALUES
(1, 3),
(2, 3),
(3, 2),
(4, 2),
(5, 3),
(6, 1),
(7, 1),
(8, 3),
(9, 3),
(10, 1),
(11, 2),
(12, 1),
(13, 2),
(14, 3),
(15, 2),
(16, 2),
(17, 1),
(18, 3),
(19, 1),
(20, 2),
(21, 1),
(22, 1),
(23, 1);

-- --------------------------------------------------------

--
-- Table structure for table `book_genres`
--

CREATE TABLE `book_genres` (
  `book_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_genres`
--

INSERT INTO `book_genres` (`book_id`, `genre_id`) VALUES
(1, 1),
(2, 5),
(3, 2),
(4, 5),
(5, 5),
(6, 6),
(7, 6),
(8, 5),
(9, 1),
(10, 5),
(11, 2),
(12, 5),
(13, 2),
(14, 8),
(15, 3),
(16, 3),
(17, 5),
(18, 7),
(19, 1),
(20, 5),
(21, 1),
(22, 2),
(23, 7);

-- --------------------------------------------------------

--
-- Table structure for table `borrowed_books`
--

CREATE TABLE `borrowed_books` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `borrow_date` datetime DEFAULT current_timestamp(),
  `due_date` datetime NOT NULL,
  `return_date` datetime DEFAULT NULL,
  `status` enum('dipinjam','dikembalikan','terlambat','menunggu_persetujuan') NOT NULL DEFAULT 'dipinjam'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrowed_books`
--

INSERT INTO `borrowed_books` (`id`, `book_id`, `user_id`, `borrow_date`, `due_date`, `return_date`, `status`) VALUES
(1, 22, 5, '2025-05-20 18:03:42', '2025-05-27 13:03:42', '2025-05-20 13:03:49', 'dikembalikan'),
(2, 21, 5, '2025-05-20 18:03:57', '2025-05-27 13:03:57', '2025-05-20 13:04:08', 'dikembalikan'),
(3, 23, 5, '2025-05-20 18:46:00', '2025-05-27 13:46:00', NULL, 'dipinjam'),
(4, 10, 10, '2025-05-20 15:14:44', '2025-05-27 15:14:44', NULL, 'dipinjam'),
(5, 16, 10, '2025-05-20 15:14:49', '2025-05-27 15:14:49', '2025-05-20 15:24:17', 'dikembalikan'),
(6, 3, 10, '2025-05-20 15:31:50', '2025-05-27 15:31:50', NULL, 'dipinjam'),
(7, 16, 10, '2025-05-20 15:31:59', '2025-05-27 15:31:59', '2025-05-20 16:05:05', 'dikembalikan'),
(8, 1, 5, '2025-05-20 16:04:49', '2025-05-27 16:04:49', NULL, 'dipinjam');

-- --------------------------------------------------------

--
-- Table structure for table `borrow_requests`
--

CREATE TABLE `borrow_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `request_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`id`, `user_id`, `book_id`, `request_date`, `status`, `admin_notes`) VALUES
(1, 5, 1, '2025-05-20 21:04:49', 'approved', 'boleh'),
(2, 5, 22, '2025-05-20 21:30:08', 'pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`) VALUES
(3, 'Available'),
(1, 'New Arrivals'),
(4, 'On Loan'),
(2, 'Popular');

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `id` int(11) NOT NULL,
  `genre_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`id`, `genre_name`) VALUES
(7, 'Biography'),
(1, 'Fantasy'),
(6, 'History'),
(3, 'Mystery'),
(5, 'Romance'),
(2, 'Science Fiction'),
(8, 'Self-Help'),
(4, 'Thriller');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','peminjam') DEFAULT 'peminjam',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(5, 'rifqi', '$2y$10$4Yb640rvAJj/mO44zrFQmOwuOfcL92.7bDI537BCa9dJMKN4TvOBS', 'peminjam', '2025-05-20 09:55:59'),
(7, 'mimin', '$2y$10$wE6.V1gE7E.W9s.7xG.LXu2R3y1N1Y7Z2Y6C5R4T3Q2P1O0I9H8G7F6E5D4C3B2A1', 'admin', '2025-05-20 10:00:33'),
(8, 'peminjam', '$2y$10$r.7gU6V5E4D3C2B1A0S9F8E7D6C5B4A3S2Q1W0E9R8T7Y6U5I4O3P2A1S2Q1W0E9R8T7Y6U5I4O3P2', 'peminjam', '2025-05-20 10:00:33'),
(9, 'admin', '$2y$10$OkIu2R2UdpHXopjLebybMObKXdiZKndf.X4DyYEBVtyaBoYpoAeZW', 'admin', '2025-05-20 10:07:55'),
(10, 'user', '$2y$10$JDtBcchFZ3VZ0a8NUbHSRumq8rdLXMvs//MzWv87z80f2ihcxRrPa', 'peminjam', '2025-05-20 13:14:26'),
(11, 'test', '$2y$10$af505vH8qivkwqoTA9.IF.0o19lnQX7scadYauXR6v0BPs3aSBqTO', 'peminjam', '2025-05-20 14:41:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`);

--
-- Indexes for table `book_categories`
--
ALTER TABLE `book_categories`
  ADD PRIMARY KEY (`book_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `book_genres`
--
ALTER TABLE `book_genres`
  ADD PRIMARY KEY (`book_id`,`genre_id`),
  ADD KEY `genre_id` (`genre_id`);

--
-- Indexes for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_borrowed_book` (`book_id`),
  ADD KEY `fk_borrowed_user` (`user_id`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `genre_name` (`genre_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `book_categories`
--
ALTER TABLE `book_categories`
  ADD CONSTRAINT `book_categories_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `book_genres`
--
ALTER TABLE `book_genres`
  ADD CONSTRAINT `book_genres_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  ADD CONSTRAINT `fk_borrowed_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_borrowed_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `borrow_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrow_requests_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
