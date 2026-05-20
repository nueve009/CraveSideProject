import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Todos() {
    const { props } = usePage();
    const todos = props.todos || [];
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [editingTodoText, setEditingTodoText] = useState('');
    const [editingStatus, setEditingStatus] = useState('Open');
    const [editingPriority, setEditingPriority] = useState('Medium');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
        status: 'Open',
        priority: 'Medium',
    });

    const filteredTodos = todos.filter((todo) => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (normalizedSearch && !todo.body.toLowerCase().includes(normalizedSearch)) {
            return false;
        }

        if (statusFilter !== 'All' && todo.status !== statusFilter) {
            return false;
        }

        if (priorityFilter !== 'All' && todo.priority !== priorityFilter) {
            return false;
        }

        return true;
    });

    const addTodo = (event) => {
        event.preventDefault();

        post(route('todos.store'), {
            onSuccess: () => reset('body', 'status', 'priority'),
        });
    };

    const toggleTodo = (todo) => {
        const status = !todo.completed ? 'Completed' : (todo.status === 'Completed' ? 'Open' : todo.status || 'Open');

        router.patch(
            route('todos.update', { todo: todo.id }),
            {
                body: todo.body,
                completed: !todo.completed,
                status,
                priority: todo.priority || 'Medium',
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const removeTodo = (id) => {
        if (!window.confirm('Delete this task?')) {
            return;
        }

        router.delete(route('todos.destroy', { todo: id }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const startEditing = (todo) => {
        setEditingTodoId(todo.id);
        setEditingTodoText(todo.body);
        setEditingStatus(todo.status || 'Open');
        setEditingPriority(todo.priority || 'Medium');
    };

    const saveTodo = (event) => {
        event.preventDefault();

        const trimmed = editingTodoText.trim();
        if (!trimmed) {
            return;
        }

        const todo = todos.find((item) => item.id === editingTodoId);
        if (!todo) {
            return;
        }

        router.patch(
            route('todos.update', { todo: editingTodoId }),
            {
                body: trimmed,
                completed: todo.completed,
                status: editingStatus,
                priority: editingPriority,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setEditingTodoId(null);
                    setEditingTodoText('');
                    setEditingStatus('Open');
                    setEditingPriority('Medium');
                },
            },
        );
    };

    const cancelEditing = () => {
        setEditingTodoId(null);
        setEditingTodoText('');
        setEditingStatus('Open');
        setEditingPriority('Medium');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Todos
                </h2>
            }
        >
            <Head title="Todos" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900">My Todo List</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Track what needs to be done and mark tasks complete as you go.
                            </p>

                            <form onSubmit={addTodo} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="newTodo" className="block text-sm font-medium text-gray-700">
                                        Add a new task
                                    </label>
                                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                                        <input
                                            id="newTodo"
                                            type="text"
                                            value={data.body}
                                            onChange={(event) => setData('body', event.target.value)}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Example: Review project plan"
                                        />
                                        <select
                                            value={data.priority}
                                            onChange={(event) => setData('priority', event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Low">Low priority</option>
                                            <option value="Medium">Medium priority</option>
                                            <option value="High">High priority</option>
                                        </select>
                                        <select
                                            value={data.status}
                                            onChange={(event) => setData('status', event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        <PrimaryButton type="submit" disabled={processing}>
                                            Add
                                        </PrimaryButton>
                                    </div>
                                    {errors.body && (
                                        <p className="mt-2 text-sm text-red-600">{errors.body}</p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <label htmlFor="todoSearch" className="sr-only">Search tasks</label>
                                <input
                                    id="todoSearch"
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Search tasks..."
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="All">All statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <select
                                    value={priorityFilter}
                                    onChange={(event) => setPriorityFilter(event.target.value)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="All">All priorities</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        {filteredTodos.length === 0 ? (
                            <div className="text-sm text-gray-600">
                                {todos.length === 0 ? 'Your todo list is empty. Add a task to get started.' : 'No tasks match this search or filter.'}
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {filteredTodos.map((todo) => (
                                    <li
                                        key={todo.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                                    >
                                        {editingTodoId === todo.id ? (
                                            <form
                                                onSubmit={saveTodo}
                                                className="space-y-4"
                                            >
                                                <div>
                                                    <label htmlFor={`edit-${todo.id}`} className="sr-only">
                                                        Edit task
                                                    </label>
                                                    <input
                                                        id={`edit-${todo.id}`}
                                                        type="text"
                                                        value={editingTodoText}
                                                        onChange={(event) => setEditingTodoText(event.target.value)}
                                                        className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <select
                                                        value={editingPriority}
                                                        onChange={(event) => setEditingPriority(event.target.value)}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="Low">Low priority</option>
                                                        <option value="Medium">Medium priority</option>
                                                        <option value="High">High priority</option>
                                                    </select>
                                                    <select
                                                        value={editingStatus}
                                                        onChange={(event) => setEditingStatus(event.target.value)}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <PrimaryButton type="submit">Save</PrimaryButton>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditing}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTodo(todo)}
                                                        className="flex min-w-0 items-center gap-3 text-left"
                                                    >
                                                        <span
                                                            className={`inline-flex h-5 w-5 flex-none items-center justify-center rounded border text-xs font-semibold ${
                                                                todo.completed
                                                                    ? 'border-indigo-500 bg-indigo-500 text-white'
                                                                    : 'border-gray-300 bg-white text-gray-700'
                                                            }`}
                                                        >
                                                            {todo.completed ? '✓' : ''}
                                                        </span>
                                                        <span
                                                            className={`min-w-0 truncate text-sm ${
                                                                todo.completed
                                                                    ? 'text-gray-400 line-through'
                                                                    : 'text-gray-900'
                                                            }`}
                                                        >
                                                            {todo.body}
                                                        </span>
                                                    </button>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                                            {todo.status || 'Open'}
                                                        </span>
                                                        <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                                                            {todo.priority || 'Medium'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(todo)}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTodo(todo.id)}
                                                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
