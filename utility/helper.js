function checkEmpty(data) {
    if(!data || data == "" || data == '' || data.length == 0) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = {
    checkEmpty
}