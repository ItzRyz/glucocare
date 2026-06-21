import prisma from "@/lib/prisma";

async function main() {
    console.log('🌱 Start seeding database...');

    // --- 1. Clean up existing data (Optional but recommended for fresh seeding) ---
    // Order matters to avoid foreign key constraint violations
    await prisma.prescriptionItem.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.labResult.deleteMany({});
    await prisma.vitalSign.deleteMany({});
    await prisma.medicalDiagnosis.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.allergy.deleteMany({});
    await prisma.glucoseRecord.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.type.deleteMany({});
    await prisma.status.deleteMany({});
    await prisma.menuAccess.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});

    // --- 2. Seed Roles (Mapping to your Clerk org keys) ---
    console.log('Seeding Roles...');
    const adminRole = await prisma.role.create({
        data: {
            name: 'Admin',
            clerkRoleSlug: 'org:admin',
            description: 'System administrator with full access',
        },
    });

    const doctorRole = await prisma.role.create({
        data: {
            name: 'Doctor',
            clerkRoleSlug: 'org:doctor',
            description: 'Medical professionals providing care',
        },
    });

    const patientRole = await prisma.role.create({
        data: {
            name: 'Patient',
            clerkRoleSlug: 'org:patient',
            description: 'Patients receiving medical care',
        },
    });

    // --- 3. Seed Statuses ---
    console.log('Seeding Statuses...');
    const chatActive = await prisma.status.create({
        data: { name: 'Active', module: 'CHAT', description: 'Chat room is active' },
    });
    await prisma.status.create({
        data: { name: 'Closed', module: 'CHAT', description: 'Chat room is archived' },
    });
    const recordFinal = await prisma.status.create({
        data: { name: 'Finalized', module: 'MEDICAL_RECORD', description: 'Medical record is signed off' },
    });

    // --- 4. Seed Types ---
    console.log('Seeding Types...');
    const textMsg = await prisma.type.create({
        data: { name: 'Text', module: 'MESSAGE', description: 'Standard text message' },
    });
    await prisma.type.create({
        data: { name: 'Image', module: 'MESSAGE', description: 'Image attachment' },
    });
    const fastingGlucose = await prisma.type.create({
        data: { name: 'Fasting', module: 'GLUCOSE', description: 'Fasting glucose reading' },
    });
    await prisma.type.create({
        data: { name: 'Post-Prandial', module: 'GLUCOSE', description: 'After meal glucose reading' },
    });

    // --- 5. Seed Categories ---
    console.log('Seeding Categories...');
    await prisma.category.create({
        data: { name: 'General', slug: 'general', description: 'General items' },
    });
    const metabolicCat = await prisma.category.create({
        data: { name: 'Metabolic Panel', slug: 'metabolic-panel', description: 'Blood sugar and metabolic markers' },
    });
    const drugAllergyCat = await prisma.category.create({
        data: { name: 'Drug Allergy', slug: 'drug-allergy', description: 'Allergies to medications' },
    });

    // --- 6. Seed Users (Mocking actual Clerk IDs as 'id') ---
    console.log('Seeding Users...');
    await prisma.user.create({
        data: {
            id: 'user_3FOZnW3WBhNo1NvK9wCctQDQ5DK',
            email: 'farizsalman14@gmail.com',
            name: 'Muhammad Salman Al Farizi',
            avatarUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zRk9abmJLQjg1akgzbmhydmcyd0xLbUJzYkYifQ",
            roleId: adminRole.id,
        },
    });

    const doctorUser = await prisma.user.create({
        data: {
            id: 'user_3FOiIsbMH4R9IVRj0TTINFDeHNH',
            email: 'doctor@glucocare.id',
            name: 'Joseph Marsiano',
            avatarUrl: "https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zRk8yeTBQdGhtNFdkdE9BbWZoc0dKUU1zc3IiLCJyaWQiOiJ1c2VyXzNGT2lJc2JNSDRSOUlWUmowVFRJTkZEZUhOSCIsImluaXRpYWxzIjoiSk0ifQ",
            roleId: doctorRole.id,
        },
    });

    const patientUser = await prisma.user.create({
        data: {
            id: 'user_3FOjOJMOIkfwHAE2Q4mPWuTmy0g',
            email: 'zetsura.official04@gmail.com',
            name: 'Akane Zetsura',
            avatarUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zRk9qT0dxbXplYW5QS2p2MjZFUUhiT2dQTzcifQ",
            roleId: patientRole.id,
        },
    });

    // --- 7. Seed Menus & Menu Hierarchy ---
    console.log('Seeding Menus...');
    const dashboardMenu = await prisma.menu.create({
        data: { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    });

    const medicalRecordsParent = await prisma.menu.create({
        data: { name: 'Medical Records', path: '/records', icon: 'FileMedical' },
    });

    const myHistorySubMenu = await prisma.menu.create({
        data: {
            name: 'My History',
            path: '/records/history',
            parentId: medicalRecordsParent.id,
        },
    });

    // --- 8. Seed Menu Access Controls ---
    console.log('Seeding Menu Access Controls...');
    // Admins can manage the Dashboard
    await prisma.menuAccess.create({
        data: { roleId: adminRole.id, menuId: dashboardMenu.id, canCreate: true, canUpdate: true, canDelete: true },
    });
    // Doctors can read Dashboard and edit Medical Records
    await prisma.menuAccess.create({
        data: { roleId: doctorRole.id, menuId: dashboardMenu.id },
    });
    await prisma.menuAccess.create({
        data: { roleId: doctorRole.id, menuId: medicalRecordsParent.id, canCreate: true, canUpdate: true },
    });
    // Patients can only view their history
    await prisma.menuAccess.create({
        data: { roleId: patientRole.id, menuId: myHistorySubMenu.id, canRead: true },
    });

    // --- 9. Seed Patient Data (Allergies & Glucose Records) ---
    console.log('Seeding Patient Metrics...');
    await prisma.allergy.create({
        data: {
            patientId: patientUser.id,
            allergen: 'Penicillin',
            reaction: 'Hives and skin rash',
            categoryId: drugAllergyCat.id,
        },
    });

    await prisma.glucoseRecord.create({
        data: {
            userId: patientUser.id,
            level: 5.6,
            notes: 'Measured right after waking up',
            typeId: fastingGlucose.id,
            categoryId: metabolicCat.id,
        },
    });

    // --- 10. Seed Consultation Flow (Chat Room & Messages) ---
    console.log('Seeding Telehealth Interactions...');
    const chatRoom = await prisma.chatRoom.create({
        data: {
            patientId: patientUser.id,
            doctorId: doctorUser.id,
            statusId: chatActive.id,
        },
    });

    await prisma.message.create({
        data: {
            roomId: chatRoom.id,
            senderId: patientUser.id,
            content: 'Hello doctor, I have been tracking my glucose and it seems high today.',
            typeId: textMsg.id,
        },
    });

    await prisma.message.create({
        data: {
            roomId: chatRoom.id,
            senderId: doctorUser.id,
            content: 'Hello Akane, thanks for reaching out. Let me review your medical record logs.',
            typeId: textMsg.id,
        },
    });

    // --- 11. Seed Medical Documentation (Record, SOAP Notes, Vitals, Labs, Prescriptions) ---
    console.log('Seeding Medical Documentation items...');
    const medicalRecord = await prisma.medicalRecord.create({
        data: {
            patientId: patientUser.id,
            doctorId: doctorUser.id,
            chatRoomId: chatRoom.id,
            statusId: recordFinal.id,
            subjective: 'Patient reports mild fatigue and elevated morning glucose levels.',
            objective: 'Patient appears well-nourished, alert, and oriented.',
            assessment: 'Type 2 Diabetes Mellitus - tracking under control but needs monitoring.',
            plan: 'Continue tracking daily fasting glucose. Adjusted Metformin dosage.',
        },
    });

    // Vital Signs
    await prisma.vitalSign.create({
        data: {
            medicalRecordId: medicalRecord.id,
            bloodPressure: '120/80',
            heartRate: 72,
            respiratoryRate: 16,
            temperature: 36.6,
            weight: 78.5,
            height: 175.0,
            bmi: 25.6,
        },
    });

    // Diagnoses (ICD codes syntax)
    await prisma.medicalDiagnosis.create({
        data: {
            medicalRecordId: medicalRecord.id,
            code: 'E11.9',
            name: 'Type 2 diabetes mellitus without complications',
            notes: 'Primary reason for consultation',
        },
    });

    // Lab Results linked to a Medical Record
    await prisma.labResult.create({
        data: {
            medicalRecordId: medicalRecord.id,
            testName: 'HbA1c',
            value: 6.4,
            unit: '%',
            referenceRange: '4.0 - 5.6 %',
            notes: 'Slightly elevated, indicative of prediabetes/diabetes threshold.',
            categoryId: metabolicCat.id,
        },
    });

    // Prescription
    const prescription = await prisma.prescription.create({
        data: {
            medicalRecordId: medicalRecord.id,
        },
    });

    // Prescription Items
    await prisma.prescriptionItem.create({
        data: {
            prescriptionId: prescription.id,
            drugName: 'Metformin Hydrochloride',
            dosage: '500mg',
            instruction: 'Take twice daily with meals',
            quantity: 60,
        },
    });

    console.log('✅ Seeding complete successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error while seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });