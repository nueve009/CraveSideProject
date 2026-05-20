<?php

namespace App\Http\Controllers;

use App\Models\PrivateMessage;
use App\Models\User;
use App\Notifications\PrivateMessageReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display the contacts page.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $columns = [
            'id',
            'name',
            'email',
            'contact_number',
            'address',
        ];

        if (Schema::hasColumn('users', 'profile_photo_path')) {
            $columns[] = 'profile_photo_path';
        }

        $users = User::select($columns)
            ->where('id', '!=', $request->user()->id)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Contacts/Index', [
            'users' => $users,
            'search' => $search,
        ]);
    }

    public function chat(Request $request, User $contact): Response
    {
        if ($request->user()->id === $contact->id) {
            abort(403);
        }

        $messages = PrivateMessage::with('sender:id,name')
            ->where(function ($query) use ($contact, $request) {
                $query->where('sender_id', $request->user()->id)
                    ->where('recipient_id', $contact->id);
            })
            ->orWhere(function ($query) use ($contact, $request) {
                $query->where('sender_id', $contact->id)
                    ->where('recipient_id', $request->user()->id);
            })
            ->orderBy('created_at')
            ->get();

        $request->user()
            ->unreadNotifications
            ->where('type', PrivateMessageReceived::class)
            ->where('data.sender_id', $contact->id)
            ->each(fn ($notification) => $notification->markAsRead());

        return Inertia::render('Contacts/Chat', [
            'contact' => $contact,
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request, User $contact)
    {
        if ($request->user()->id === $contact->id) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $message = PrivateMessage::create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $contact->id,
            'body' => $validated['body'],
        ]);

        $contact->notify(new PrivateMessageReceived($message));

        return redirect()->route('contacts.chat', ['contact' => $contact->id]);
    }
}
