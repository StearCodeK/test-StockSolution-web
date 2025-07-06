// src/app/dashboard/page.js
'use client'

import WelcomeSection from '@/components/dashboard/WelcomeSection'
import TasksSection from '@/components/dashboard/TasksSection'
import ActivitySection from '@/components/dashboard/ActivitySection'
import { useAuth } from '@/components/layout/AuthWrapper' // Importa el hook useAuth

export default function DashboardPage() {
    const { currentUser } = useAuth() // Obtiene el usuario actual

    return (
        <>
            <WelcomeSection user={currentUser} />
            <TasksSection userId={currentUser?.id} /> {/* Pasa el userId */}
            <ActivitySection userId={currentUser?.id} />
        </>
    )
}