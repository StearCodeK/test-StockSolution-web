/*/ src/app/accesos/page.js*/


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTabs from '@/components/accesos/AdminTabs';
import PasswordModal from '@/components/accesos/PasswordModal';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin'; // Asegúrate de que este archivo exista y esté configurado correctamente

async function isEmailRegistered(email) {
    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
            email: email
        });

        if (error) throw error;
        return users.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

export default function AccesosPage() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [accessRequests, setAccessRequests] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const router = useRouter();

    useEffect(() => {
        checkUserAndLoadData();
    }, []);

    const checkUserAndLoadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('perfiles_usuarios')
                .select('rol')
                .eq('id', user.id)
                .single();

            const adminRole = profile?.rol === 'admin';

            if (!adminRole) {
                router.push('/dashboard');
                return;
            }

            setUser(user);
            setIsAdmin(adminRole);
            await loadAllData();
        } catch (error) {
            console.error('Error verificando usuario:', error);
            router.push('/login');
        }
    };

    const loadAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadAccessRequests(),
                loadActiveUsers()
            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAccessRequests = async () => {
        const { data, error } = await supabase
            .from('solicitudes_acceso')
            .select('*')
            .eq('estado', 'pendiente')
            .order('created_at', { ascending: true });

        if (error) throw error;
        setAccessRequests(data || []);
    };

    const loadActiveUsers = async () => {
        try {
            // 1. Obtener usuarios de auth.users
            const { data: { users: authUsers }, error: authError } =
                await supabaseAdmin.auth.admin.listUsers();

            if (authError) throw authError;

            // 2. Obtener perfiles para complementar información
            const { data: profiles, error: profileError } = await supabase
                .from('perfiles_usuarios')
                .select('*');

            if (profileError) throw profileError;

            // 3. Combinar datos
            const formattedUsers = authUsers.map(authUser => {
                const profile = profiles.find(p => p.id === authUser.id) || {};
                return {
                    id: authUser.id,
                    nombre: profile.nombre || 'Sin nombre',
                    apellido: profile.apellido || '',
                    email: authUser.email || 'N/A',
                    rol: profile.rol || 'usuario',
                    created_at: authUser.created_at,
                    last_sign_in: authUser.last_sign_in_at
                };
            }).filter(user => user.rol !== 'system'); // Filtrar usuarios del sistema

            setActiveUsers(formattedUsers);
        } catch (error) {
            console.error('Error en loadActiveUsers:', error);
            setActiveUsers([]);
        }
    };
    const handleDeleteUser = async (user) => {
        // Verificar que no es el usuario actual
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser.id === user.id) {
            return alert('No puedes eliminarte a ti mismo');
        }

        // Verificar que no es admin (opcional)
        if (user.rol === 'admin') {
            return alert('No se pueden eliminar usuarios administradores');
        }

        if (!confirm(`¿Eliminar permanentemente a ${user.nombre} ${user.apellido} (${user.email})?`)) return;

        try {
            const response = await fetch('/api/delete-user', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id })
            });

            // First check if response exists
            if (!response) {
                throw new Error('No response received from server');
            }

            // Try to parse the response
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                throw new Error(data?.error || 'Error al eliminar usuario');
            }

            alert('Usuario eliminado completamente del sistema');
            await loadActiveUsers();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleApproveRequest = async (request) => {
        const emailExists = await isEmailRegistered(request.email);

        if (emailExists) {
            if (!confirm(`El email ${request.email} ya está registrado. ¿Deseas reemplazarlo?`)) {
                return;
            }
        }

        setSelectedRequest(request);
        setShowPasswordModal(true);
    };

    const handlePasswordConfirm = async (password) => {
        if (!selectedRequest) return;

        try {
            // 1. Crear usuario en Auth como administrador
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: selectedRequest.email,
                password,
                email_confirm: true, // Confirmar email automáticamente
                user_metadata: {
                    nombre: selectedRequest.nombre,
                    apellido: selectedRequest.apellido
                }
            });

            if (authError) {
                console.error('Error en auth.admin.createUser:', authError);
                throw authError;
            }

            if (!authData.user?.id) {
                throw new Error('No se pudo crear el usuario en Auth');
            }

            // 2. Crear entrada en la tabla usuarios
            const { error: usuariosError } = await supabase
                .from('usuarios')
                .insert({ id_auth: authData.user.id });

            if (usuariosError) throw usuariosError;

            // 3. Crear perfil del usuario
            const { error: profileError } = await supabase
                .from('perfiles_usuarios')
                .insert({
                    id: authData.user.id,
                    nombre: selectedRequest.nombre,
                    apellido: selectedRequest.apellido,
                    email: selectedRequest.email,
                    rol: 'usuario',
                    telefono: selectedRequest.telefono || ''
                });

            if (profileError) throw profileError;

            // 4. Actualizar estado de la solicitud
            const { error: requestError } = await supabase
                .from('solicitudes_acceso')
                .update({ estado: 'aprobado' })
                .eq('id', selectedRequest.id);

            if (requestError) throw requestError;

            // 5. Enviar correo de bienvenida
            await sendWelcomeEmail(
                selectedRequest.email,
                selectedRequest.nombre,
                selectedRequest.apellido,
                password
            );

            alert('Usuario aprobado y creado exitosamente');
            await loadAccessRequests();
            await loadActiveUsers();

        } catch (error) {
            console.error('Error completo:', {
                message: error.message,
                details: error
            });
            alert(`Error al aprobar solicitud: ${error.message || 'Error desconocido'}`);
        } finally {
            setShowPasswordModal(false);
            setSelectedRequest(null);
        }
    };
    const handleRejectRequest = async (requestId) => {
        if (!confirm('¿Rechazar esta solicitud de acceso?')) return;

        try {
            const { error } = await supabase
                .from('solicitudes_acceso')
                .update({ estado: 'rechazado' })
                .eq('id', requestId);

            if (error) throw error;

            alert('Solicitud rechazada exitosamente');
            await loadAccessRequests();
        } catch (error) {
            console.error('Error rechazando solicitud:', error);
            alert('Error al rechazar solicitud');
        }
    };

    const sendWelcomeEmail = async (email, nombre, apellido, password) => {
        try {
            const { error } = await supabase
                .from('emails')
                .insert({
                    to: email,
                    subject: 'Bienvenido a Nuestra Plataforma - Tus Credenciales de Acceso',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
                            <h1 style="color: #2c3e50;">¡Bienvenido, ${nombre} ${apellido}!</h1>
                            <p style="font-size: 16px;">Tu cuenta ha sido aprobada por nuestro equipo administrativo.</p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Tus credenciales de acceso:</h3>
                                <p><strong>Correo electrónico:</strong> ${email}</p>
                                <p><strong>Contraseña:</strong> ${password}</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #e74c3c;">
                                <strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.
                            </p>
                            
                            <a href="https://tudominio.com/login" 
                               style="display: inline-block; padding: 10px 20px; background: #3498db; color: white; 
                                      text-decoration: none; border-radius: 5px; margin: 20px 0;">
                                Iniciar Sesión
                            </a>
                            
                            <p style="font-size: 14px; color: #7f8c8d;">
                                Si no solicitaste este acceso, por favor ignora este correo o contacta a nuestro equipo de soporte.
                            </p>
                        </div>
                    `
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error enviando correo:', error);
            alert(`Usuario creado pero hubo un error enviando el correo: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Cargando...</p>
            </div>
        );
    }

    return (

        <div className="accesos-page">
            <div className="main-content">
                <section className="section-container">
                    <h1 className="section-title">Administración de Accesos y Usuarios</h1>

                    <AdminTabs
                        accessRequests={accessRequests}
                        activeUsers={activeUsers}
                        onApproveRequest={handleApproveRequest}
                        onRejectRequest={handleRejectRequest}
                        onDeleteUser={handleDeleteUser}
                        onRefresh={loadAllData}
                    />
                </section>

                {showPasswordModal && (
                    <PasswordModal
                        onConfirm={handlePasswordConfirm}
                        onCancel={() => {
                            setShowPasswordModal(false);
                            setSelectedRequest(null);
                        }}
                    />
                )}
            </div>
        </div>

    );
}