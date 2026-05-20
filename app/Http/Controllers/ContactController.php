<?php

namespace App\Http\Controllers;

use App\Models\User;
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
}
