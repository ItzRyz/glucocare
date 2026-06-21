-- CreateTable
CREATE TABLE "DiagnosisPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "prediction" TEXT NOT NULL,
    "probability" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosisPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exercise" BOOLEAN NOT NULL,
    "diet" BOOLEAN NOT NULL,
    "symptoms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statusId" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiagnosisPrediction_userId_idx" ON "DiagnosisPrediction"("userId");

-- CreateIndex
CREATE INDEX "WeeklyAssessment_userId_idx" ON "WeeklyAssessment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- AddForeignKey
ALTER TABLE "DiagnosisPrediction" ADD CONSTRAINT "DiagnosisPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyAssessment" ADD CONSTRAINT "WeeklyAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
