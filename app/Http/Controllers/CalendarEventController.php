<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'title' => 'required|string|max:120',
            'note' => 'nullable|string|max:2000',
        ]);

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (! $user) {
            abort(403);
        }

        $user->calendarEvents()->create($request->only(['date', 'title', 'note', 'category', 'tags']));

        return redirect()->route('calendar.index');
    }

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'date' => 'required|date',
            'title' => 'required|string|max:120',
            'note' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:60',
            'tags' => 'nullable|string|max:255',
        ]);

        $calendarEvent->update($request->only(['date', 'title', 'note', 'category', 'tags']));

        return redirect()->route('calendar.index');
    }

    public function destroy(CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id !== Auth::id()) {
            abort(403);
        }

        $calendarEvent->delete();

        return redirect()->route('calendar.index');
    }
}
