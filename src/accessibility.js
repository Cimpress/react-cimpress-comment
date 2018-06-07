const commentAccessibilityLevels = [
    { icon: 'users', value: 'public' },
    { icon: 'lock', value: 'internal' }
];

const getAccessibilityLevels = (tt, accessibilityLevel) => {
    accessibilityLevel = accessibilityLevel || commentAccessibilityLevels[commentAccessibilityLevels.length - 1].value;

    let accessibilityLevelIndex = commentAccessibilityLevels.findIndex(l => l.value === accessibilityLevel);

    return commentAccessibilityLevels.map((l, index) => ({
        icon: l.icon,
        value: l.value,
        label: tt(`accessibility_option_${l.value}_label`),
        description: tt(`accessibility_option_${l.value}_description`),
        disabled: index > accessibilityLevelIndex
    }));
};

export {
    getAccessibilityLevels
};
