import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const fetchTasks = async () => {
        try {
            const res = await api.get("/tasks");
            setTasks(res.data);
        } catch {
            setError("Failed to load tasks");
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        fetchTasks();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await api.post("/tasks", { title, description: description || null });
            setTitle("");
            setDescription("");
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.detail || "Could not create task");
        }
    };

    const toggleDone = async (task) => {
        try {
            await api.patch(`/tasks/${task.id}`, { is_done: !task.is_done });
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.detail || "Could not update task");
        }
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
    };

    const saveEdit = async (id) => {
        setError("");
        try {
            await api.patch(`/tasks/${id}`, {
                title: editTitle,
                description: editDescription || null,
            });
            cancelEdit();
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.detail || "Could not save task");
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.detail || "Could not delete task");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Tasks</h1>
                    <button
                        onClick={logout}
                        className="text-sm text-red-600 hover:underline"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </p>
                )}

                {/* New Task Form */}
                <form
                    onSubmit={handleCreate}
                    className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col gap-3"
                >
                    <input
                        type="text"
                        placeholder="Task title"
                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Add Task
                    </button>
                </form>

                {/* Task List */}
                {tasks.length === 0 ? (
                    <p className="text-gray-500 text-center">No tasks yet. Create one above!</p>
                ) : (
                    <ul className="space-y-3">
                        {tasks.map((task) =>
                            editingId === task.id ? (
                                /* ── Inline Edit Mode ── */
                                <li
                                    key={task.id}
                                    className="bg-white p-4 rounded-xl shadow flex flex-col gap-2"
                                >
                                    <input
                                        type="text"
                                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Description (optional)"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveEdit(task.id)}
                                            className="flex-1 bg-green-600 text-white py-1 rounded-lg hover:bg-green-700 transition text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="flex-1 bg-gray-200 text-gray-700 py-1 rounded-lg hover:bg-gray-300 transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </li>
                            ) : (
                                /* ── View Mode ── */
                                <li
                                    key={task.id}
                                    className="bg-white p-4 rounded-xl shadow flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.is_done}
                                            onChange={() => toggleDone(task)}
                                            className="w-5 h-5 accent-blue-600"
                                        />
                                        <div>
                                            <p
                                                className={`font-medium ${task.is_done ? "line-through text-gray-400" : ""}`}
                                            >
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-sm text-gray-500">{task.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 ml-4">
                                        <button
                                            onClick={() => startEdit(task)}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            )
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}