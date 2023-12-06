// COSTUME ROUTES

const express = require('express');

const costumeController = require('../controllers/costume');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// ---GET Routes---

// / => GET
router.get('/', costumeController.getCostumes);

// /costumes => GET
router.get('/costumes', costumeController.getCostumes);

// /costumes/:costumeId => GET
router.get('/costumes/:costumeId', costumeController.getCostume);

// /cart => GET
router.get('/cart', isAuth, costumeController.getCart);

// /rentals => GET
router.get('/rentals', isAuth, costumeController.getRentals);

// /rentals/:rentalId => GET
router.get('/rentals/:rentalId', isAuth, costumeController.getInvoice);

// /checkout => GET
router.get('/checkout', isAuth, costumeController.getCheckout);

// /checkout/success => GET
router.get('/checkout/success', costumeController.getCheckoutSuccess);

// /checkout/cancel => GET
router.get('/checkout/cancel', costumeController.getCheckout);

// ---POST Routes---

// /cart => POST
router.post('/cart', isAuth, costumeController.postCart);
router.post('/rentals', isAuth, costumeController.createRental);

// ---DELETE Routes---

// /cancel-rental => DELETE
router.delete('/cancel-rental', isAuth, costumeController.deleteCostumeFromCart);

module.exports = router;
