import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useRef } from 'react';

export default function Chat() {
    const { props } = usePage();
    const user = props.auth.user;
    const contact = props.contact;
    const messages = props.messages || [];

    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (event) => {
        event.preventDefault();

        if (!data.body.trim()) {
            return;
        }

        post(route('contacts.messages.store', { contact: contact.id }), {
            preserveState: true,
            onSuccess: () => {
                reset('body');
            },
        });
    };

    const handleTextareaKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage(event);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Chat with {contact.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Private messages are visible only to you and {contact.name}.
                        </p>
                    </div>
                    <Link
                        href={route('contacts.index')}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Back to Contacts
                    </Link>
                </div>
            }
        >
            <Head title={`Chat with ${contact.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={contact.profile_photo_url}
                                    alt={contact.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                                    <p className="text-xs text-gray-500">{contact.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 px-6 py-6">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                                        No messages yet. Send the first message to start the conversation.
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isSender = message.sender_id === user.id;
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                                        isSender
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                                >
                                                    <div>{message.body}</div>
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        {new Date(message.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white px-6 py-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <label htmlFor="body" className="sr-only">
                                    Message body
                                </label>
                                <textarea
                                    id="body"
                                    name="body"
                                    rows={3}
                                    value={data.body}
                                    onChange={(event) => setData('body', event.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    placeholder="Write your message..."
                                    className="min-h-[100px] w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
