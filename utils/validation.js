export const validation = {
    username: {
        pattern: /^[a-z0-9]{3,30}$/,
        message: 'Username must be 3-30 characters long and contain only lowercase letters and numbers'
    },
    password: {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    nickname: {
        pattern: /^[A-Za-z0-9\[\]_='\- ]{1,30}$/,
        message: 'Nickname must be 1-30 characters and can contain letters, numbers, and basic symbols ([]_=\'-)'
    },
    trim: {
        nickname: (value) => {
            if (!value) return '';
            // Trim and collapse multiple spaces into single space
            return value.trim().replace(/\s+/g, ' ');
        }
    }
};

export function validateUsername(username) {
    return validation.username.pattern.test(username);
}

export function validatePassword(password) {
    return validation.password.pattern.test(password);
}
