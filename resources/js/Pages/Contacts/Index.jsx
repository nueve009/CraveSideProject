import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function Index() {
    const { props } = usePage();
    const user = props.auth.user;
    const users = props.users || [];
    const { data, setData } = useForm({
        search: props.search || '',
    });

    const handleSearch = (event) => {
        const value = event.target.value;
        setData('search', value);

        router.get(
            route('contacts.index'),
            { search: value },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Contacts
                </h2>
            }
        >
            <Head title="Contacts" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Contacts
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Search other users and view their contact information.
                                </p>
                            </div>
                            <div className="w-full max-w-sm">
                                <label htmlFor="search" className="sr-only">
                                    Search contacts
                                </label>
                                <input
                                    id="search"
                                    type="search"
                                    value={data.search}
                                    onChange={handleSearch}
                                    placeholder="Search by name, email, phone, or address"
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {users.length === 0 ? (
                                <div className="col-span-full rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                                    No contacts found. Try a different search.
                                </div>
                            ) : (
                                users.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={contact.profile_photo_url}
                                                alt={contact.name}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {contact.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {contact.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                                            <div>
                                                <div className="font-medium text-gray-800">Phone</div>
                                                <div>{contact.contact_number || 'Not set'}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">Address</div>
                                                <div>{contact.address || 'Not set'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 text-sm text-gray-700">
                            Want to update your own contact details? Update your{' '}
                            <Link
                                href={route('profile.edit')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                profile
                            </Link>
                            .
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
