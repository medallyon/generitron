function randColor() {
    let letters = '0123456789'
    , color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return parseInt(color.replace("#", ""), 16);
}

module.exports = randColor;