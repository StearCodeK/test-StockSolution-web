// components/layout/sidebar/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/layout/AuthWrapper";

const Sidebar = ({ isAdmin, isOpen, onClose }) => {
    const pathname = usePathname();
    const { currentUser } = useAuth();

    const isActive = (path) => {
        return pathname === path || pathname.startsWith(path + "/");
    };

    const menuItems = [
        {
            path: "/dashboard",
            icon: "fas fa-home",
            label: "Dashboard",
            show: true,
        },
        {
            path: "/registros",
            icon: "fas fa-clipboard-list",
            label: "Registros",
            show: true,
        },
        {
            path: "/historial",
            icon: "fas fa-history",
            label: "Historial",
            show: true,
        },
        {
            path: "/accesos",
            icon: "fas fa-user-shield",
            label: "Administrar Accesos",
            show: isAdmin,
        },
        {
            path: "/importacion",
            icon: "fas fa-file-import",
            label: "Importación",
            show: isAdmin,
        },
    ];

    return (
        <aside className={`sidebar ${isOpen ? "active" : ""}`}>
            <div className="logo">
                <i className="fas fa-calculator"></i>
                <span>StockSolution</span>
            </div>
            <nav>
                <ul>
                    {menuItems
                        .filter((item) => item.show)
                        .map((item) => (
                            <li
                                key={item.path}
                                className={isActive(item.path) ? "active" : ""}
                            >
                                <Link
                                    href={item.path}
                                    prefetch={true} // Prefetch para navegación más rápida
                                    className="nav-link"
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                </ul>
            </nav>


        </aside>
    );
};

export default Sidebar;