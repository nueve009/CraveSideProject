<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class PostController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        Post::create([
            'user_id' => Auth::id(),
            'content' => $request->input('content'),
        ]);

        return Redirect::route('dashboard');
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        abort_if(Auth::id() !== $post->user_id, 403);

        $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        $post->update([
            'content' => $request->input('content'),
        ]);

        return Redirect::route('dashboard');
    }

    public function destroy(Post $post): RedirectResponse
    {
        abort_if(Auth::id() !== $post->user_id, 403);

        $post->delete();

        return Redirect::route('dashboard');
    }
}
