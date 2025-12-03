<?php

use App\Http\Controllers\Admin\BankSoalController;
use App\Http\Controllers\Admin\JenisTryoutController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\MateriController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\App\UserPageController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/glitchtip/error', function () {
    throw new Exception('My first GlitchTip error!');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Halaman untuk user (non-admin)
    Route::prefix('app')->name('app.')->group(function () {
        Route::get('/home', [UserPageController::class, 'home'])->name('home');
        Route::get('/materi', [UserPageController::class, 'materi'])->name('materi');
        Route::get('/tryout', [UserPageController::class, 'tryout'])->name('tryout');
        Route::get('/riwayat', [UserPageController::class, 'riwayat'])->name('riwayat');
        Route::get('/riwayat/{hasilTryout}', [UserPageController::class, 'riwayatDetail'])->name('riwayat.show');
        Route::get('/tryout/{bankSoal}', [UserPageController::class, 'take'])->name('tryout.take');
        Route::post('/tryout/{hasilTryout}/answer', [UserPageController::class, 'submitAnswer'])->name('tryout.answer');
        Route::post('/tryout/{hasilTryout}/finish', [UserPageController::class, 'finish'])->name('tryout.finish');
    });

    // Redirect legacy admin paths without /admin prefix
    Route::redirect('/dashboard', '/admin/dashboard');
    Route::redirect('/bank-soal', '/admin/bank-soal');
    Route::redirect('/jenis-tryout', '/admin/jenis-tryout');
    Route::redirect('/kategori', '/admin/kategori');
    Route::redirect('/materi', '/admin/materi');
    Route::redirect('/user', '/admin/user');

    // Halaman admin
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
        Route::get('/report', [ReportController::class, 'index'])->name('report');

        Route::prefix('user')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('user.index');
            Route::post('store', [UserController::class, 'store'])->name('user.store');
            Route::post('delete-multiple', [UserController::class, 'deleteMultiple'])->name('user.delete-multiple');
            Route::post('delete', [UserController::class, 'delete'])->name('user.delete');
            Route::post('update', [UserController::class, 'update'])->name('user.update');
        });

        Route::prefix('jenis-tryout')->name('jenis-tryout.')->group(function () {
            Route::get('/', [JenisTryoutController::class, 'index'])->name('index');
            Route::post('/', [JenisTryoutController::class, 'store'])->name('store');
            Route::put('/{jenisTryout}', [JenisTryoutController::class, 'update'])->name('update');
            Route::delete('/{jenisTryout}', [JenisTryoutController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-destroy', [JenisTryoutController::class, 'bulkDestroy'])->name('bulk-destroy');
        });

        Route::prefix('kategori')->name('kategori.')->group(function () {
            Route::get('/', [KategoriController::class, 'index'])->name('index');
            Route::post('/', [KategoriController::class, 'store'])->name('store');
            Route::put('/{kategori}', [KategoriController::class, 'update'])->name('update');
            Route::delete('/{kategori}', [KategoriController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-destroy', [KategoriController::class, 'bulkDestroy'])->name('bulk-destroy');
        });

        Route::prefix('materi')->name('materi.')->group(function () {
            Route::get('/', [MateriController::class, 'index'])->name('index');
            Route::post('/', [MateriController::class, 'store'])->name('store');
            Route::put('/{materi}', [MateriController::class, 'update'])->name('update');
            Route::delete('/{materi}', [MateriController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-destroy', [MateriController::class, 'bulkDestroy'])->name('bulk-destroy');
        });

        Route::prefix('bank-soal')->name('bank-soal.')->group(function () {
            Route::get('/', [BankSoalController::class, 'index'])->name('index');
            Route::post('/', [BankSoalController::class, 'store'])->name('store');
            Route::put('/{bankSoal}', [BankSoalController::class, 'update'])->name('update');
            Route::delete('/{bankSoal}', [BankSoalController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-destroy', [BankSoalController::class, 'bulkDestroy'])->name('bulk-destroy');

            Route::get('/{bankSoal}/detail', [BankSoalController::class, 'manage'])->name('detail');
            Route::post('/{bankSoal}/detail', [BankSoalController::class, 'storeDetail'])->name('detail.store');
            Route::put('/detail/{detailBankSoal}', [BankSoalController::class, 'updateDetail'])->name('detail.update');
            Route::delete('/detail/{detailBankSoal}', [BankSoalController::class, 'destroyDetail'])->name('detail.destroy');
            Route::get('/{bankSoal}/detail/create', [BankSoalController::class, 'createDetailForm'])->name('detail.create');
            Route::get('/{bankSoal}/detail/{detailBankSoal}/edit', [BankSoalController::class, 'editDetailForm'])->name('detail.edit');

            Route::post('/detail/{detailBankSoal}/jawaban', [BankSoalController::class, 'storeAnswer'])->name('answer.store');
            Route::put('/jawaban/{jawabanBankSoal}', [BankSoalController::class, 'updateAnswer'])->name('answer.update');
            Route::delete('/jawaban/{jawabanBankSoal}', [BankSoalController::class, 'destroyAnswer'])->name('answer.destroy');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
