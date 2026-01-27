try {
    console.log('Require express-validator...');
    const ev = require('express-validator');
    console.log('express-validator keys:', Object.keys(ev));
    const { validationResult } = ev;
    console.log('validationResult type:', typeof validationResult);

} catch (e) {
    console.error('Debug Error:', e);
}
