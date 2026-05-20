<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Reply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;

class ReplyController extends Controller
{
    public function store(Request $request, Post $post): RedirectResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:500'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,svg,mp4,mov,webm,mp3,wav,ogg', 'max:10240'],
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->storePublicly('reply-attachments', 'public');
        }

        Reply::create([
            'post_id' => $post->id,
            'user_id' => Auth::id(),
            'content' => $request->input('content'),
            'attachment_path' => $attachmentPath,
        ]);

        return Redirect::route('dashboard');
    }

    public function update(Request $request, Reply $reply): RedirectResponse
    {
        abort_if(Auth::id() !== $reply->user_id, 403);

        $request->validate([
            'content' => ['required', 'string', 'max:500'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,svg,mp4,mov,webm,mp3,wav,ogg', 'max:10240'],
        ]);

        $attachmentPath = $reply->attachment_path;
        if ($request->hasFile('attachment')) {
            if ($reply->attachment_path) {
                Storage::disk('public')->delete($reply->attachment_path);
            }

            $attachmentPath = $request->file('attachment')->storePublicly('reply-attachments', 'public');
        }

        $reply->update([
            'content' => $request->input('content'),
            'attachment_path' => $attachmentPath,
        ]);

        return Redirect::route('dashboard');
    }

    public function destroy(Reply $reply): RedirectResponse
    {
        abort_if(Auth::id() !== $reply->user_id, 403);

        $reply->delete();

        return Redirect::route('dashboard');
    }
}
