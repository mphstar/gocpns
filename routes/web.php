<?php

use App\Http\Controllers\Admin\BankSoalController;
use App\Http\Controllers\Admin\JenisTryoutController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\MateriController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/glitchtip/error', function () {
    throw new Exception('My first GlitchTip error!');
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');


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

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
