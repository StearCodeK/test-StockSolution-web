// components/layout/AuthWrapper.js
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import Footer from "@/components/Footer";
import UserProfile from "@/components/dashboard/UserProfile";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Contexto para el estado de autenticación
const AuthContext = createContext();



// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de AuthWrapper");
    }
    return {
        ...context,
        isAdmin: context.currentUser?.rol === "admin",
        user: context.currentUser,
        authChecked: !context.loading,
        loading: context.loading,
    };
};

export default function AuthWrapper({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Rutas que no requieren autenticación
    const publicRoutes = ["/"];
    const isPublicRoute = publicRoutes.includes(pathname);

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                setLoading(true);

                // Si es ruta pública, no verificar autenticación
                if (isPublicRoute) {
                    setLoading(false);
                    setAuthChecked(true);
                    return;
                }

                // Si ya verificamos la autenticación y tenemos usuario, no volver a verificar
                if (authChecked && currentUser) {
                    setLoading(false);
                    return;
                }

                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (!mounted) return;

                if (authError || !user) {
                    setCurrentUser(null);
                    setAuthChecked(true);
                    router.push("/");
                    return;
                }

                // Obtener perfil del usuario solo si no lo tenemos
                if (!currentUser || currentUser.id !== user.id) {
                    const { data: profile, error: profileError } = await supabase
                        .from("user_auth_view")
                        .select("id, nombre, apellido, rol, telefono, email")
                        .eq("id", user.id)
                        .single();

                    if (!mounted) return;

                    if (profileError) {
                        console.warn("No se pudo cargar el perfil:", profileError);
                        setCurrentUser(user);
                    } else {
                        setCurrentUser({
                            ...user,
                            ...profile,
                        });
                    }
                }

                setAuthChecked(true);
            } catch (err) {
                if (!mounted) return;
                console.error("Error de autenticación:", err);
                setError(err.message);
                setAuthChecked(true);
                router.push("/");
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        // Solo verificar auth si no hemos verificado antes o si cambiamos a ruta pública
        if (!authChecked || isPublicRoute) {
            checkAuth();
        } else {
            setLoading(false);
        }

        return () => {
            mounted = false;
        };
    }, [isPublicRoute, authChecked, router]); // Removido pathname y currentUser de las dependencias

    // Escuchar cambios de autenticación de Supabase
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_OUT") {
                setCurrentUser(null);
                setAuthChecked(false);
                router.push("/");
            } else if (event === "SIGNED_IN" && session?.user) {
                // Recargar perfil cuando el usuario inicie sesión
                setAuthChecked(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAuthChecked(false);
            router.push("/");
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
        }
    };

    const authValue = {
        currentUser,
        loading,
        error,
        logout: handleLogout,
        refreshUser: () => setAuthChecked(false), // Para refrescar el usuario cuando sea necesario
        isAdmin: currentUser?.rol === "admin",
        user: currentUser, // Asegúrate de incluir el usuario completo
    };

    // Mostrar loading solo si estamos verificando auth
    if (loading && !isPublicRoute) {
        return <LoadingSpinner fullPage />;
    }

    if (error && !isPublicRoute) {
        return <div className="error-container">Error: {error}</div>;
    }

    // Si es ruta pública, solo mostrar el contenido
    if (isPublicRoute) {
        return (
            <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
        );
    }

    // Si es ruta privada pero no hay usuario, mostrar loading
    if (!currentUser) {
        return <LoadingSpinner fullPage />;
    }

    // Si es ruta privada, mostrar con sidebar
    return (
        <AuthContext.Provider value={authValue}>
            <div className="app-container">
                <Sidebar
                    isAdmin={currentUser?.rol === "admin"}
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                />
                <div
                    className={`sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                />
                <main className="main-content">
                    <header className="main-header">
                        <div className="header-container">
                            <button
                                className="mobile-nav-toggle"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                            <h1 className="section-title">{getSectionTitle(pathname)}</h1>
                            <div className="header-right">
                                <UserProfile user={currentUser} onLogout={handleLogout} />
                            </div>
                        </div>
                    </header>
                    <div className="content-area">{children}</div>
                    <Footer />
                </main>
            </div>
        </AuthContext.Provider>
    );
}

function getSectionTitle(pathname) {
    const titles = {
        "/dashboard": "Dashboard",
        "/registros": "Registros",
        "/historial": "Historial",
        "/accesos": "Administrar Accesos",
        "/importacion": "Importación de Datos",
    };

    // Buscar coincidencia exacta o por prefijo
    for (const [path, title] of Object.entries(titles)) {
        if (pathname === path || pathname.startsWith(path + "/")) {
            return title;
        }
    }

    return "Dashboard";
}