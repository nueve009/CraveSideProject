<?php

use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReplyController;
use App\Http\Controllers\TodoController;
use App\Models\Post;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $userColumns = ['id', 'name', 'email'];

    if (Schema::hasColumn('users', 'profile_photo_path')) {
        $userColumns[] = 'profile_photo_path';
    }

    $posts = Post::with([
        'user' => function ($query) use ($userColumns) {
            $query->select($userColumns);
        },
        'replies.user' => function ($query) use ($userColumns) {
            $query->select($userColumns);
        },
    ])
        ->latest()
        ->get();

    return Inertia::render('Dashboard', [
        'posts' => $posts,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/todos', [TodoController::class, 'index'])->name('todos.index');
    Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
    Route::patch('/todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
    Route::delete('/todos/{todo}', [TodoController::class, 'destroy'])->name('todos.destroy');
    Route::get('/calendar', function () {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (! $user) {
            abort(403);
        }

        $events = $user
            ->calendarEvents()
            ->orderBy('date')
            ->get();

        return Inertia::render('Calendar', [
            'events' => $events,
        ]);
    })->name('calendar.index');

    Route::post('/calendar-events', [CalendarEventController::class, 'store'])->name('calendar-events.store');
    Route::patch('/calendar-events/{calendar_event}', [CalendarEventController::class, 'update'])->name('calendar-events.update');
    Route::delete('/calendar-events/{calendar_event}', [CalendarEventController::class, 'destroy'])->name('calendar-events.destroy');

    Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/{contact}/chat', [ContactController::class, 'chat'])->name('contacts.chat');
    Route::post('/contacts/{contact}/messages', [ContactController::class, 'sendMessage'])->name('contacts.messages.store');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::patch('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/posts/{post}/replies', [ReplyController::class, 'store'])->name('replies.store');
    Route::patch('/replies/{reply}', [ReplyController::class, 'update'])->name('replies.update');
    Route::delete('/replies/{reply}', [ReplyController::class, 'destroy'])->name('replies.destroy');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
