<?php

namespace App\Notifications;

use App\Models\PrivateMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PrivateMessageReceived extends Notification
{
    use Queueable;

    public function __construct(protected PrivateMessage $message)
    {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->name,
            'message_id' => $this->message->id,
            'body' => $this->message->body,
            'chat_url' => route('contacts.chat', ['contact' => $this->message->sender_id]),
            'sent_at' => $this->message->created_at?->toDateTimeString() ?? now()->toDateTimeString(),
        ];
    }

    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
