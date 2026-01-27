try {
    console.log('Require express-validator...');
    require('express-validator');
    console.log('express-validator OK');

    console.log('Require ride.service...');
    require('./services/ride.service');
    console.log('ride.service OK');

    console.log('Require ride.controller...');
    require('./controllers/ride.controller');
    console.log('ride.controller OK');

} catch (e) {
    console.error('Debug Error:', e);
}
