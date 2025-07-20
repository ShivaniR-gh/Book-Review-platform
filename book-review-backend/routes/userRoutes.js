const router  = require('express').Router();
const userCtl = require('../controller/userController');
const { protect } = require('../middleware/auth');

router.post('/register', userCtl.registerUser);
router.post('/login',    userCtl.loginUser);

router.get('/:id',          userCtl.getUserProfile);    // public
router.put('/:id', protect, userCtl.updateUserProfile); // needs token

module.exports = router;
