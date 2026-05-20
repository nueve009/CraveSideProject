import { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const calendarCategories = ['Work', 'Personal', 'Reminder', 'Health', 'Other'];

const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const buildMonthGrid = (year, month) => {
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const weeks = [];
    let day = 1;
    let nextMonthDay = 1;

    for (let week = 0; week < 6; week += 1) {
        const weekDays = [];
        for (let weekday = 0; weekday < 7; weekday += 1) {
            const index = week * 7 + weekday;
            if (index < startDay) {
                weekDays.push({
                    value: daysInPrevMonth - (startDay - index - 1),
                    outside: true,
                });
            } else if (day <= daysInMonth) {
                weekDays.push({
                    value: day,
                    outside: false,
                    date: new Date(year, month, day),
                });
                day += 1;
            } else {
                weekDays.push({
                    value: nextMonthDay,
                    outside: true,
                });
                nextMonthDay += 1;
            }
        }
        weeks.push(weekDays);
    }

    return weeks;
};

export default function Calendar() {
    const { props } = usePage();
    const events = props.events || [];
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [editingEventId, setEditingEventId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingNote, setEditingNote] = useState('');
    const [editingCategory, setEditingCategory] = useState('Personal');
    const [editingTags, setEditingTags] = useState('');
    const [eventSearch, setEventSearch] = useState('');
    const [eventCategoryFilter, setEventCategoryFilter] = useState('All');
    const selectedDateKey = formatDateKey(selectedDate);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        note: '',
        date: selectedDateKey,
        category: 'Personal',
        tags: '',
    });

    useEffect(() => {
        setData('date', selectedDateKey);
    }, [selectedDateKey]);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const today = new Date();
    const currentYear = today.getFullYear();
    const minYear = Math.min(currentYear - 20, year - 10);
    const maxYear = Math.max(currentYear + 10, year + 10);
    const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);

    const startOfWeek = (date) => {
        const day = date.getDay();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
    };

    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate);
        return Array.from({ length: 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
    }, [selectedDate]);

    const agendaDates = useMemo(() => {
        return Array.from({ length: 14 }, (_, index) => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + index));
    }, [selectedDate]);

    const moveToMonthYear = (newYear, newMonth) => {
        const day = Math.min(selectedDate.getDate(), new Date(newYear, newMonth + 1, 0).getDate());
        setSelectedDate(new Date(newYear, newMonth, day));
    };

    const handleMonthChange = (event) => {
        moveToMonthYear(year, Number(event.target.value));
    };

    const handleYearChange = (event) => {
        moveToMonthYear(Number(event.target.value), month);
    };

    const filteredEvents = useMemo(() => {
        const search = eventSearch.trim().toLowerCase();

        return events.filter((event) => {
            const categoryMatch = eventCategoryFilter === 'All' || event.category === eventCategoryFilter;
            const textToSearch = [event.title, event.note, event.category, event.tags]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const searchMatch = !search || textToSearch.includes(search);
            return categoryMatch && searchMatch;
        });
    }, [events, eventSearch, eventCategoryFilter]);

    const eventsByDate = useMemo(() => {
        return filteredEvents.reduce((map, event) => {
            if (!event.date) {
                return map;
            }

            const eventDateString = typeof event.date === 'string'
                ? event.date.slice(0, 10)
                : formatDateKey(new Date(event.date));

            map[eventDateString] = map[eventDateString] || [];
            map[eventDateString].push(event);
            return map;
        }, {});
    }, [filteredEvents]);

    const selectedEvents = eventsByDate[selectedDateKey] || [];
    const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);
    const agendaGroups = useMemo(() => {
        return agendaDates.map((date) => ({
            date,
            dateKey: formatDateKey(date),
            events: eventsByDate[formatDateKey(date)] || [],
        }));
    }, [agendaDates, eventsByDate]);

    const previousMonth = () => {
        setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    };

    const addEvent = (event) => {
        event.preventDefault();

        post(route('calendar-events.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('title', 'note', 'category', 'tags');
            },
        });
    };

    const startEditing = (eventData) => {
        setEditingEventId(eventData.id);
        setEditingTitle(eventData.title);
        setEditingNote(eventData.note || '');
        setEditingCategory(eventData.category || 'Personal');
        setEditingTags(eventData.tags || '');
    };

    const saveEvent = (event) => {
        event.preventDefault();
        if (!editingEventId) {
            return;
        }

        router.patch(
            route('calendar-events.update', { calendar_event: editingEventId }),
            {
                date: selectedDateKey,
                title: editingTitle,
                note: editingNote,
                category: editingCategory,
                tags: editingTags,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingEventId(null);
                    setEditingTitle('');
                    setEditingNote('');
                    setEditingCategory('Personal');
                    setEditingTags('');
                },
            },
        );
    };

    const cancelEditing = () => {
        setEditingEventId(null);
        setEditingTitle('');
        setEditingNote('');
        setEditingCategory('Personal');
        setEditingTags('');
    };

    const removeEvent = (eventId) => {
        if (!window.confirm('Remove this event?')) {
            return;
        }

        router.delete(route('calendar-events.destroy', { calendar_event: eventId }), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Calendar
                </h2>
            }
        >
            <Head title="Calendar" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-6">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Monthly Calendar</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Create events and notes for the selected date.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        <label htmlFor="month" className="sr-only">Month</label>
                                        <select
                                            id="month"
                                            value={month}
                                            onChange={handleMonthChange}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {monthNames.map((name, index) => (
                                                <option key={name} value={index}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>

                                        <label htmlFor="year" className="sr-only">Year</label>
                                        <select
                                            id="year"
                                            value={year}
                                            onChange={handleYearChange}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {yearOptions.map((yearOption) => (
                                                <option key={yearOption} value={yearOption}>
                                                    {yearOption}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('month')}
                                                className={`px-3 py-2 transition ${
                                                    viewMode === 'month' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                Month
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('week')}
                                                className={`px-3 py-2 transition ${
                                                    viewMode === 'week' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                Week
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('agenda')}
                                                className={`px-3 py-2 transition ${
                                                    viewMode === 'agenda' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                Agenda
                                            </button>
                                        </div>
                                        <PrimaryButton type="button" onClick={() => setSelectedDate(new Date())}>
                                            Today
                                        </PrimaryButton>
                                        <PrimaryButton type="button" onClick={previousMonth}>
                                            Previous
                                        </PrimaryButton>
                                        <PrimaryButton type="button" onClick={nextMonth}>
                                            Next
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <div className="mb-4 flex flex-col gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-gray-500">
                                            {viewMode === 'month' ? 'Current month' : viewMode === 'week' ? 'Current week' : 'Agenda'}
                                        </p>
                                        <h4 className="text-2xl font-semibold text-gray-900">
                                            {viewMode === 'month'
                                                ? `${monthNames[month]} ${year}`
                                                : viewMode === 'week'
                                                    ? `${monthNames[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`
                                                    : 'Next two weeks'}
                                        </h4>
                                    </div>
                                    <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                                        {filteredEvents.length} filtered event{filteredEvents.length === 1 ? '' : 's'}
                                    </div>
                                </div>

                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1">
                                        <label htmlFor="eventSearch" className="sr-only">Search events</label>
                                        <input
                                            id="eventSearch"
                                            type="search"
                                            value={eventSearch}
                                            onChange={(event) => setEventSearch(event.target.value)}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Search events by title, note, category, or tags"
                                        />
                                    </div>
                                    <select
                                        value={eventCategoryFilter}
                                        onChange={(event) => setEventCategoryFilter(event.target.value)}
                                        className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="All">All categories</option>
                                        {calendarCategories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {viewMode === 'month' && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            {dayNames.map((day) => (
                                                <div key={day} className="py-2">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
                                            {weeks.map((week, weekIndex) =>
                                                week.map((day) => {
                                                    const isToday =
                                                        !day.outside &&
                                                        day.value === today.getDate() &&
                                                        month === today.getMonth() &&
                                                        year === today.getFullYear();
                                                    const dateKey = day.outside
                                                        ? null
                                                        : formatDateKey(new Date(year, month, day.value));
                                                    const isSelected = dateKey === selectedDateKey;
                                                    const dayEvents = dateKey ? eventsByDate[dateKey] : undefined;

                                                    let dayClasses = 'group relative rounded-2xl border px-2 py-3 text-left transition ';
                                                    if (day.outside) {
                                                        dayClasses += 'border-transparent bg-transparent text-gray-400';
                                                    } else if (isToday && isSelected) {
                                                        dayClasses += 'border-indigo-700 bg-indigo-700 text-white shadow-lg ring-2 ring-indigo-300';
                                                    } else if (isToday) {
                                                        dayClasses += 'border-indigo-500 bg-indigo-500 text-white shadow-sm';
                                                    } else if (isSelected) {
                                                        dayClasses += 'border-indigo-700 bg-indigo-100 text-indigo-900 shadow';
                                                    } else {
                                                        dayClasses += 'border-gray-200 bg-white text-gray-900 hover:border-indigo-300 hover:bg-indigo-50';
                                                    }

                                                    const badgeClasses = isToday || isSelected
                                                        ? 'mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700'
                                                        : 'mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700';

                                                    return (
                                                        <button
                                                            key={`${weekIndex}-${day.value}-${day.outside}`}
                                                            type="button"
                                                            onClick={() => {
                                                                if (!day.outside) {
                                                                    setSelectedDate(new Date(year, month, day.value));
                                                                }
                                                            }}
                                                            className={dayClasses}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>{day.value}</span>
                                                                {isToday && <span className="text-[10px] uppercase tracking-widest">Today</span>}
                                                            </div>
                                                            {dayEvents?.length ? (
                                                                <span className={badgeClasses}>
                                                                    {dayEvents.length} note{dayEvents.length === 1 ? '' : 's'}
                                                                </span>
                                                            ) : null}
                                                        </button>
                                                    );
                                                }),
                                            )}
                                        </div>
                                    </>
                                )}

                                {viewMode === 'week' && (
                                    <div className="mt-2 grid gap-3 md:grid-cols-7">
                                        {weekDates.map((date) => {
                                            const dateKey = formatDateKey(date);
                                            const isSelected = dateKey === selectedDateKey;
                                            const isTodayDate = dateKey === formatDateKey(today);
                                            const dayEvents = eventsByDate[dateKey] || [];

                                            return (
                                                <button
                                                    key={dateKey}
                                                    type="button"
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`rounded-2xl border p-4 text-left transition ${
                                                        isSelected ? 'border-indigo-700 bg-indigo-100 text-indigo-900 shadow' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">{dayNames[date.getDay()]}</p>
                                                            <p className="text-lg font-semibold text-gray-900">{date.getDate()}</p>
                                                        </div>
                                                        {isTodayDate ? (
                                                            <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                                                Today
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-4 space-y-2">
                                                        {dayEvents.length === 0 ? (
                                                            <p className="text-xs text-gray-500">No events</p>
                                                        ) : (
                                                            dayEvents.slice(0, 3).map((eventItem) => (
                                                                <div key={eventItem.id} className="rounded-2xl bg-gray-50 p-3 text-xs text-gray-700">
                                                                    <div className="font-semibold text-sm text-gray-900 truncate">{eventItem.title}</div>
                                                                    <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">{eventItem.note || 'No note'}</div>
                                                                </div>
                                                            ))
                                                        )}
                                                        {dayEvents.length > 3 ? (
                                                            <p className="text-xs font-semibold text-indigo-700">+{dayEvents.length - 3} more</p>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {viewMode === 'agenda' && (
                                    <div className="space-y-4">
                                        {agendaGroups.every((group) => group.events.length === 0) ? (
                                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                                                No agenda items found in the next two weeks.
                                            </div>
                                        ) : (
                                            agendaGroups.map((group) => (
                                                <div key={group.dateKey} className="rounded-2xl border border-gray-200 bg-white p-4">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm uppercase tracking-wide text-gray-500">
                                                                {dayNames[group.date.getDay()]}
                                                            </p>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {group.date.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                            {group.events.length} event{group.events.length === 1 ? '' : 's'}
                                                        </span>
                                                    </div>
                                                    {group.events.length === 0 ? (
                                                        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                                            No events for this day.
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 space-y-3">
                                                            {group.events.map((eventItem) => (
                                                                <div key={eventItem.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div>
                                                                            <h4 className="font-semibold text-gray-900">{eventItem.title}</h4>
                                                                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                                                {eventItem.note || 'No note added.'}
                                                                            </p>
                                                                        </div>
                                                                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                                                                            {eventItem.category || 'Uncategorized'}
                                                                        </span>
                                                                    </div>
                                                                    {eventItem.tags ? (
                                                                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-700">
                                                                            {eventItem.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag).map((tag) => (
                                                                                <span key={tag} className="rounded-full bg-white px-2 py-1 border border-gray-200">
                                                                                    {tag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Events for {selectedDate.toLocaleDateString()}</h3>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Add a title and note for your selected date.
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {selectedEvents.length} item{selectedEvents.length === 1 ? '' : 's'}
                                    </div>
                                </div>

                                <form onSubmit={addEvent} className="mt-6 space-y-4">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Title
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Add a quick event title"
                                        />
                                        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                                            Note
                                        </label>
                                        <textarea
                                            id="note"
                                            rows={4}
                                            value={data.note}
                                            onChange={(event) => setData('note', event.target.value)}
                                            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Add more details for this date"
                                        />
                                        {errors.note && <p className="mt-2 text-sm text-red-600">{errors.note}</p>}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                Category
                                            </label>
                                            <select
                                                id="category"
                                                value={data.category}
                                                onChange={(event) => setData('category', event.target.value)}
                                                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {calendarCategories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                                Tags
                                            </label>
                                            <input
                                                id="tags"
                                                type="text"
                                                value={data.tags}
                                                onChange={(event) => setData('tags', event.target.value)}
                                                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Comma-separated tags"
                                            />
                                            {errors.tags && <p className="mt-2 text-sm text-red-600">{errors.tags}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <PrimaryButton type="submit" disabled={processing}>
                                            Save Event
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Selected Date Notes</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Edit or remove notes for the selected date.
                                </p>

                                <div className="mt-6 space-y-4">
                                    {selectedEvents.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                                            No notes yet for this date.
                                        </div>
                                    ) : (
                                        selectedEvents.map((eventItem) => (
                                            <div key={eventItem.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                {editingEventId === eventItem.id ? (
                                                    <form onSubmit={saveEvent} className="space-y-4">
                                                        <div>
                                                            <label htmlFor={`edit-title-${eventItem.id}`} className="block text-sm font-medium text-gray-700">
                                                                Title
                                                            </label>
                                                            <input
                                                                id={`edit-title-${eventItem.id}`}
                                                                type="text"
                                                                value={editingTitle}
                                                                onChange={(event) => setEditingTitle(event.target.value)}
                                                                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor={`edit-note-${eventItem.id}`} className="block text-sm font-medium text-gray-700">
                                                                Note
                                                            </label>
                                                            <textarea
                                                                id={`edit-note-${eventItem.id}`}
                                                                rows={3}
                                                                value={editingNote}
                                                                onChange={(event) => setEditingNote(event.target.value)}
                                                                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <div>
                                                                <label htmlFor={`edit-category-${eventItem.id}`} className="block text-sm font-medium text-gray-700">
                                                                    Category
                                                                </label>
                                                                <select
                                                                    id={`edit-category-${eventItem.id}`}
                                                                    value={editingCategory}
                                                                    onChange={(event) => setEditingCategory(event.target.value)}
                                                                    className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                >
                                                                    {calendarCategories.map((category) => (
                                                                        <option key={category} value={category}>
                                                                            {category}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label htmlFor={`edit-tags-${eventItem.id}`} className="block text-sm font-medium text-gray-700">
                                                                    Tags
                                                                </label>
                                                                <input
                                                                    id={`edit-tags-${eventItem.id}`}
                                                                    type="text"
                                                                    value={editingTags}
                                                                    onChange={(event) => setEditingTags(event.target.value)}
                                                                    className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                    placeholder="Comma-separated tags"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
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
                                                    <div className="space-y-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900">{eventItem.title}</h4>
                                                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                                    {eventItem.category ? (
                                                                        <span className="rounded-full bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">
                                                                            {eventItem.category}
                                                                        </span>
                                                                    ) : null}
                                                                    {eventItem.tags ? (
                                                                        eventItem.tags
                                                                            .split(',')
                                                                            .map((tag) => tag.trim())
                                                                            .filter((tag) => tag.length > 0)
                                                                            .map((tag) => (
                                                                                <span
                                                                                    key={tag}
                                                                                    className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700"
                                                                                >
                                                                                    {tag}
                                                                                </span>
                                                                            ))
                                                                    ) : null}
                                                                </div>
                                                                <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                                                                    {eventItem.note || 'No additional note.'}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => startEditing(eventItem)}
                                                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeEvent(eventItem.id)}
                                                                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
