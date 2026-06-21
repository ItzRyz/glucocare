export type GlucoseTestType = 'fasting' | 'post-meal';
export type GlucoseStatus = 'Normal' | 'Prediabetes' | 'Diabetes';

export function evaluateGlucoseLevel(level: number, testType: GlucoseTestType) {
    if (testType === 'fasting') {
        if (level < 100) {
            return {
                status: 'Normal' as GlucoseStatus,
                message: 'Your fasting blood sugar is within the normal range.',
            };
        }
        if (level <= 125) {
            return {
                status: 'Prediabetes' as GlucoseStatus,
                message: 'Your fasting blood sugar indicates prediabetes. Consider lifestyle changes.',
            };
        }
        return {
            status: 'Diabetes' as GlucoseStatus,
            message: 'Your fasting blood sugar indicates diabetes. Please consult a doctor.',
        };
    }

    if (level < 140) {
        return {
            status: 'Normal' as GlucoseStatus,
            message: 'Your post-meal blood sugar is within the normal range.',
        };
    }
    if (level <= 199) {
        return {
            status: 'Prediabetes' as GlucoseStatus,
            message: 'Your post-meal blood sugar indicates prediabetes.',
        };
    }
    return {
        status: 'Diabetes' as GlucoseStatus,
        message: 'Your post-meal blood sugar indicates diabetes. Please consult a doctor immediately.',
    };
}
