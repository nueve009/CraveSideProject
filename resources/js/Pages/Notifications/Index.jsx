import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function NotificationsIndex() {
    const { props } = usePage();
    const notifications = props.notifications || [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Notifications</h2>}>
            <Head title="Notifications" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="divide-y divide-gray-200">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    You have no notifications right now.
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-6 py-5 ${notification.read_at ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    New message from {notification.data.sender_name}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {notification.data.body}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <Link
                                                href={notification.data.chat_url}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                View chat
                                            </Link>
                                            {!notification.read_at ? (
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    Unread
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
