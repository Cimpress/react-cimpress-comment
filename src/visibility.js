const commentVisibilityLevels = [
    { icon: 'users', value: 'public' },
    { icon: 'lock', value: 'internal' }
];

const getVisibilityLevels = (tt, accessLevel) => {
    accessLevel = accessLevel || commentVisibilityLevels[commentVisibilityLevels.length - 1].value;

    let accessLevelIndex = commentVisibilityLevels.findIndex(l => l.value === accessLevel);

    return commentVisibilityLevels.map((l, index) => ({
        icon: l.icon,
        value: l.value,
        label: tt(`visibility_option_${l.value}_label`),
        description: tt(`visibility_option_${l.value}_description`),
        disabled: index > accessLevelIndex
    }));
};

export {
    getVisibilityLevels
};
