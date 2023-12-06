// // ADMIN ROUTES
const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// ---POST Routes---

// /admin/add-costume => POST
router.post(
  '/add-costume',
  [
    body('category').isString().isLength({ min: 3 }).trim(),
    body('costumeName').isString().isLength({ min: 3 }).trim(),
    body('rentalFee').isFloat(),
    body('size').isString().isLength({ min: 1 }).trim(),
    body('imageUrl').isURL(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddCostume
);

// /admin/edit-costume => PUT
router.put(
  '/edit-costume',
  [
    body('category').isString().isLength({ min: 3 }).trim(),
    body('costumeName').isString().isLength({ min: 3 }).trim(),
    body('rentalFee').isFloat(),
    body('size').isString().isLength({ min: 1 }).trim(),
    body('imageUrl').isURL(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.editCostume
);

// ---DELETE Routes---

// /admin/delete-costume => DELETE
router.delete('/delete-costume/:costumeId', isAuth, adminController.deleteCostume);

module.exports = router;
