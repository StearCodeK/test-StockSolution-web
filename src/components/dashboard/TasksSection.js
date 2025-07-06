'use client';

import { useState } from 'react';

export default function TasksSection({ userId }) {
    // Carga inicial de tareas usando inicialización lazy del estado
    const [tasks, setTasks] = useState(() => {
        if (!userId) return [];
        try {
            const storageKey = `tasks_${userId}`;
            const tasksJSON = localStorage.getItem(storageKey);
            return tasksJSON ? JSON.parse(tasksJSON) : [];
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            return [];
        }
    });

    const [newTask, setNewTask] = useState('');

    const saveTasks = (updatedTasks) => {
        if (!userId) return;

        try {
            const storageKey = `tasks_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Error al guardar tareas:', error);
        }
    };

    const addTask = () => {
        if (!newTask.trim()) return;

        const taskId = 'task_' + Date.now();
        const newTaskObj = {
            id: taskId,
            descripcion: newTask.trim(),
            completada: false,
            creado_en: new Date().toISOString()
        };

        const updatedTasks = [newTaskObj, ...tasks];
        saveTasks(updatedTasks);
        setNewTask('');
    };

    const toggleTask = (taskId) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completada: !task.completada } : task
        );
        saveTasks(updatedTasks);
    };

    const deleteTask = (taskId) => {
        if (confirm('¿Está seguro que desea eliminar esta tarea?')) {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            saveTasks(updatedTasks);
        }
    };

    if (!userId) {
        return (
            <section className="tasks-section section-container">
                <h3 className="section-title">Lista de Tareas</h3>
                <div className="task-list-container">
                    <p>Por favor inicia sesión para administrar tus tareas</p>
                </div>
            </section>
        );
    }

    return (
        <section className="tasks-section section-container">
            <h3 className="section-title">Lista de Tareas</h3>
            <div className="task-list-container">
                <div className="task-input-container">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Agregar nueva tarea..."
                        className="task-input"
                    />
                    <button onClick={addTask} className="add-task-btn">
                        Agregar
                    </button>
                </div>
                <ul className="task-list">
                    {tasks.length === 0 ? (
                        <li className="no-tasks">No hay tareas pendientes</li>
                    ) : (
                        tasks.map(task => (
                            <li key={task.id} className="task-item">
                                <div className={`task-content ${task.completada ? 'completed' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={task.completada}
                                        onChange={() => toggleTask(task.id)}
                                        className="task-checkbox"
                                    />
                                    <span className="task-text">{task.descripcion}</span>
                                </div>
                                <div className="task-actions">
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="delete-task-btn"
                                        aria-label="Eliminar tarea"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </section>
    );
}