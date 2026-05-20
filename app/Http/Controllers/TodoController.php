<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TodoController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (! $user) {
            abort(403);
        }

        $todos = $user
            ->todos()
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Todos', [
            'todos' => $todos,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string|max:255',
            'status' => 'required|string|in:Open,In Progress,Completed',
            'priority' => 'required|string|in:Low,Medium,High',
        ]);

        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (! $user) {
            abort(403);
        }

        $user->todos()->create([
            'body' => $request->body,
            'completed' => false,
            'status' => $request->status,
            'priority' => $request->priority,
        ]);

        return redirect()->route('todos.index');
    }

    public function update(Request $request, Todo $todo)
    {
        if ($todo->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:255',
            'completed' => 'boolean',
            'status' => 'required|string|in:Open,In Progress,Completed',
            'priority' => 'required|string|in:Low,Medium,High',
        ]);

        $todo->update([
            'body' => $request->body,
            'completed' => $request->boolean('completed'),
            'status' => $request->status,
            'priority' => $request->priority,
        ]);

        return redirect()->route('todos.index');
    }

    public function destroy(Todo $todo)
    {
        if ($todo->user_id !== Auth::id()) {
            abort(403);
        }

        $todo->delete();

        return redirect()->route('todos.index');
    }
}
