'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function TasksSection({ userId }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            loadTasks();
        }
    }, [userId]);

    const loadTasks = async () => {
        try {
            setLoading(true);

            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuarios')
                .select('id_usuario')
                .eq('id_auth', userId)
                .single();

            if (usuarioError || !usuarioData) {
                throw usuarioError || new Error('Usuario no encontrado');
            }

            const { data, error } = await supabase
                .from('tareas_usuarios')
                .select('*')
                .eq('id_usuario', usuarioData.id_usuario)
                .order('creado_en', { ascending: false });

            if (error) {
                throw error;
            }

            setTasks(data || []);
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            setError('Error al cargar tareas');
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTask.trim() || !userId) return;

        try {
            setLoading(true);

            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuarios')
                .select('id_usuario')
                .eq('id_auth', userId)
                .single();

            if (usuarioError || !usuarioData) {
                throw usuarioError || new Error('Usuario no encontrado');
            }

            const { data, error } = await supabase
                .from('tareas_usuarios')
                .insert([
                    {
                        id_usuario: usuarioData.id_usuario,
                        descripcion: newTask.trim(),
                        completada: false
                    }
                ])
                .select();

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                setTasks([data[0], ...tasks]);
                setNewTask('');
            }
        } catch (error) {
            console.error('Error al agregar tarea:', error);
            setError('Error al agregar tarea');
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskCompletion = async (taskId, currentStatus) => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('tareas_usuarios')
                .update({ completada: !currentStatus })
                .eq('id_tarea', taskId);

            if (error) {
                throw error;
            }

            setTasks(tasks.map(task =>
                task.id_tarea === taskId
                    ? { ...task, completada: !currentStatus }
                    : task
            ));
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            setError('Error al actualizar tarea');
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm('¿Está seguro que desea eliminar esta tarea?')) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('tareas_usuarios')
                .delete()
                .eq('id_tarea', taskId);

            if (error) {
                throw error;
            }

            setTasks(tasks.filter(task => task.id_tarea !== taskId));
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            setError('Error al eliminar tarea');
        } finally {
            setLoading(false);
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

    if (loading) return <p>Cargando tareas...</p>;
    if (error) return <p>{error}</p>;

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
                    <button onClick={addTask} className="add-task-btn" disabled={loading}>
                        {loading ? 'Agregando...' : 'Agregar'}
                    </button>
                </div>
                <ul className="task-list">
                    {tasks.length === 0 ? (
                        <li className="no-tasks">No hay tareas pendientes</li>
                    ) : (
                        tasks.map(task => (
                            <li key={task.id_tarea} className="task-item">
                                <div className={`task-content ${task.completada ? 'completed' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={task.completada}
                                        onChange={() => toggleTaskCompletion(task.id_tarea, task.completada)}
                                        className="task-checkbox"
                                        disabled={loading}
                                    />
                                    <span className="task-text">{task.descripcion}</span>
                                    <small className="task-date">
                                        {new Date(task.creado_en).toLocaleString()}
                                    </small>
                                </div>
                                <div className="task-actions">
                                    <button
                                        onClick={() => deleteTask(task.id_tarea)}
                                        className="delete-task-btn"
                                        aria-label="Eliminar tarea"
                                        disabled={loading}
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