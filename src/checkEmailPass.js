function emailExists(array, email) {
    return array.some(user => user.email === email);
}

function checkUserCredentials(array, email, password) {
    return array.some(user => user.email === email && user.password === password);
}

module.exports = { emailExists, checkUserCredentials };