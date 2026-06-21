import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/navbar';

export async function requirePageAuth() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
}

export function PatientShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
        </>
    );
}
