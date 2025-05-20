<?php
// includes/auth_functions.php
session_start(); // Mulai sesi di setiap halaman yang membutuhkan otentikasi

function isAuthenticated() {
    return isset($_SESSION['user_id']);
}

function getUserRole() {
    return isset($_SESSION['user_role']) ? $_SESSION['user_role'] : null;
}

function isAdmin() {
    return isAuthenticated() && getUserRole() === 'admin';
}

function isPeminjam() {
    return isAuthenticated() && getUserRole() === 'peminjam';
}

function requireAuth() {
    if (!isAuthenticated()) {
        header("Location: login.php");
        exit();
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        header("Location: index.php"); // Atau halaman error unauthorized
        exit();
    }
}
?>