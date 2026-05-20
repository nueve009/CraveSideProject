<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\CalendarEvent;
use App\Models\PrivateMessage;
use App\Models\Todo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'contact_number',
        'address',
        'profile_photo_path',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getProfilePhotoUrlAttribute(): string
    {
        if (! $this->profile_photo_path) {
            return 'https://ui-avatars.com/api/?name=' .
                urlencode($this->name) .
                '&background=0D8ABC&color=fff';
        }

        return asset('storage/' . $this->profile_photo_path);
    }

    public function todos()
    {
        return $this->hasMany(Todo::class);
    }

    public function calendarEvents()
    {
        return $this->hasMany(CalendarEvent::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(PrivateMessage::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(PrivateMessage::class, 'recipient_id');
    }
}
