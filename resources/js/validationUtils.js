export function validEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validPassword(password) {
    const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return pwdRegex.test(password);
}

export function validName(name) {
    const nameRegex = /^[a-zA-Z0-9 ]+$/;
    return nameRegex.test(name);
}
