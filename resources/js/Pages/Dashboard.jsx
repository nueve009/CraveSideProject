import { useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard() {
    const { props } = usePage();
    const userName = props.auth?.user?.name || 'Guest';
    const currentUserId = props.auth?.user?.id;
    const posts = props.posts || [];
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
    });
    const [replyDrafts, setReplyDrafts] = useState({});
    const [replyAttachments, setReplyAttachments] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingPostContent, setEditingPostContent] = useState('');
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingReplyContent, setEditingReplyContent] = useState('');

    const handleReplyAttachmentChange = (postId, file) => {
        setReplyAttachments((prev) => ({
            ...prev,
            [postId]: file,
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('posts.store'), {
            onSuccess: () => reset('content'),
        });
    };

    const handleReplyChange = (postId, value) => {
        setReplyDrafts((prev) => ({
            ...prev,
            [postId]: value,
        }));
    };

    const submitReply = (postId) => {
        const content = replyDrafts[postId] || '';
        const attachment = replyAttachments[postId] || null;
        const formData = new FormData();

        formData.append('content', content);

        if (attachment) {
            formData.append('attachment', attachment);
        }

        router.post(route('replies.store', { post: postId }), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                setReplyDrafts((prev) => ({
                    ...prev,
                    [postId]: '',
                }));
                setReplyAttachments((prev) => ({
                    ...prev,
                    [postId]: null,
                }));
            },
        });
    };

    const startPostEdit = (post) => {
        setEditingPostId(post.id);
        setEditingPostContent(post.content);
    };

    const submitPostEdit = (postId) => {
        router.patch(route('posts.update', { post: postId }), {
            content: editingPostContent,
        });
        setEditingPostId(null);
    };

    const deletePost = (postId) => {
        if (!window.confirm('Delete this post?')) {
            return;
        }

        router.delete(route('posts.destroy', { post: postId }));
    };

    const startReplyEdit = (reply) => {
        setEditingReplyId(reply.id);
        setEditingReplyContent(reply.content);
    };

    const submitReplyEdit = (replyId) => {
        router.patch(route('replies.update', { reply: replyId }), {
            content: editingReplyContent,
        });
        setEditingReplyId(null);
    };

    const deleteReply = (replyId) => {
        if (!window.confirm('Delete this reply?')) {
            return;
        }

        router.delete(route('replies.destroy', { reply: replyId }));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Welcome back, {userName}! Share a post and see what others have shared.
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                    New Post
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    rows={4}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Write something to share with other users..."
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div className="flex justify-end">
                                <PrimaryButton disabled={processing}>Post</PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <div className="grid gap-6">
                        {posts.length === 0 ? (
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                                <p className="text-gray-700">No posts yet. Start the conversation!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={post.user.profile_photo_url}
                                                alt={post.user.name}
                                                className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">{post.user.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(post.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {post.user.id === currentUserId && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startPostEdit(post)}
                                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deletePost(post.id)}
                                                    className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {editingPostId === post.id ? (
                                        <div className="mt-4 space-y-4">
                                            <textarea
                                                rows={4}
                                                value={editingPostContent}
                                                onChange={(e) => setEditingPostContent(e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <div className="flex gap-3">
                                                <PrimaryButton onClick={() => submitPostEdit(post.id)}>
                                                    Save
                                                </PrimaryButton>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingPostId(null)}
                                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-gray-800 whitespace-pre-line">{post.content}</p>
                                    )}

                                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm font-medium text-gray-900">Replies</p>

                                        {post.replies.length === 0 ? (
                                            <p className="mt-3 text-sm text-gray-600">No replies yet.</p>
                                        ) : (
                                            <div className="mt-3 space-y-4">
                                                {post.replies.map((reply) => (
                                                    <div
                                                        key={reply.id}
                                                        className="rounded-lg border border-gray-200 bg-white p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={reply.user.profile_photo_url}
                                                                    alt={reply.user.name}
                                                                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">
                                                                        {reply.user.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(reply.created_at).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {reply.user.id === currentUserId && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => startReplyEdit(reply)}
                                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteReply(reply.id)}
                                                                        className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {editingReplyId === reply.id ? (
                                                            <div className="mt-3 space-y-3">
                                                                <textarea
                                                                    rows={3}
                                                                    value={editingReplyContent}
                                                                    onChange={(e) => setEditingReplyContent(e.target.value)}
                                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                />
                                                                <div className="flex gap-3">
                                                                    <PrimaryButton onClick={() => submitReplyEdit(reply.id)}>
                                                                        Save
                                                                    </PrimaryButton>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingReplyId(null)}
                                                                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="mt-3 text-gray-700 whitespace-pre-line">
                                                                    {reply.content}
                                                                </p>
                                                                {reply.attachment_url && (
                                                                    <div className="mt-3">
                                                                        {/(jpeg|jpg|png|gif|svg)$/i.test(reply.attachment_url) ? (
                                                                            <img
                                                                                src={reply.attachment_url}
                                                                                alt="Reply attachment"
                                                                                className="max-h-60 w-full rounded-lg object-cover"
                                                                            />
                                                                        ) : /(mp4|mov|webm)$/i.test(reply.attachment_url) ? (
                                                                            <video controls className="max-h-60 w-full rounded-lg">
                                                                                <source src={reply.attachment_url} />
                                                                                Your browser does not support video playback.
                                                                            </video>
                                                                        ) : /(mp3|wav|ogg)$/i.test(reply.attachment_url) ? (
                                                                            <audio controls className="w-full">
                                                                                <source src={reply.attachment_url} />
                                                                                Your browser does not support audio playback.
                                                                            </audio>
                                                                        ) : (
                                                                            <a
                                                                                href={reply.attachment_url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-indigo-600 hover:text-indigo-800"
                                                                            >
                                                                                View attachment
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 space-y-3">
                                            <label htmlFor={`reply-${post.id}`} className="sr-only">
                                                Add reply
                                            </label>
                                            <textarea
                                                id={`reply-${post.id}`}
                                                rows={3}
                                                value={replyDrafts[post.id] || ''}
                                                onChange={(e) => handleReplyChange(post.id, e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Write a reply..."
                                            />
                                            <div className="space-y-2">
                                                <label htmlFor={`reply-attachment-${post.id}`} className="block text-sm font-medium text-gray-700">
                                                    Add attachment
                                                </label>
                                                <input
                                                    key={`reply-attachment-${post.id}-${replyAttachments[post.id]?.name || 'empty'}`}
                                                    id={`reply-attachment-${post.id}`}
                                                    type="file"
                                                    accept="image/*,video/*,audio/*"
                                                    onChange={(e) => handleReplyAttachmentChange(post.id, e.target.files?.[0] || null)}
                                                    className="block w-full text-sm text-gray-700"
                                                />
                                                {replyAttachments[post.id] && (
                                                    <p className="text-sm text-gray-500">
                                                        Selected: {replyAttachments[post.id].name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Attach photos, video, or audio files up to 10MB.
                                                </p>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => submitReply(post.id)}
                                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}