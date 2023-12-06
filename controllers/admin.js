
const { validationResult } = require('express-validator');
const User = require('../models/user');
const Costume = require('../models/costume');

// POST EXPORTS:
// Allows admin users to addnew to  database
exports.postAddCostume = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const admin = await User.findById(req.userId);

    if (!admin) {
      return res.status(404).json({ message: 'Unable to locate admin user' });
    }

    if (!admin.admin) {
      return res.status(401).json({ message: 'User is not authenticated as admin' });
    }

    const { costumeName, category, rentalFee, size, imageUrl, description } = req.body;

    const costume = new Costume({
      costumeName,
      category,
      rentalFee,
      size,
      imageUrl,
      description,
      userId: req.userId,
    });

    const result = await costume.save();

    res.status(201).json({
      message: 'Costume added!',
      costume: result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// PUT EXPORTS:

exports.editCostume = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Edit costume failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const admin = await User.findById(req.userId);

    if (!admin) {
      return res.status(404).json({ message: 'Unable to locate admin user' });
    }

    if (!admin.admin) {
      return res.status(401).json({ message: 'User is not authenticated as admin' });
    }

    const { costumeId, costumeName, category, rentalFee, size, imageUrl, description } = req.body;

    if (!imageUrl) {
      const error = new Error('No image specified.');
      error.statusCode = 422;
      throw error;
    }

    const costume = await Costume.findById(costumeId);

    if (!costume) {
      const error = new Error('Could not find costume.');
      error.statusCode = 404;
      throw error;
    }

    costume.costumeName = costumeName;
    costume.category = category;
    costume.rentalFee = rentalFee;
    costume.size = size;
    costume.imageUrl = imageUrl;
    costume.description = description;

    const result = await costume.save();

    res.status(201).json({
      message: 'Costume edited',
      costume: result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// DELETE EXPORTS:
exports.deleteCostume = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const costumeId = req.params.costumeId;
    const costume = await Costume.findById(costumeId);

    if (!costume) {
      const error = new Error('Could not find costume.');
      error.statusCode = 404;
      throw error;
    }

    const admin = await User.findById(req.userId);

    if (!admin) {
      return res.status(404).json({ message: 'Unable to locate admin user' });
    }

    if (!admin.admin) {
      return res.status(401).json({ message: 'User is not authenticated as admin' });
    }

    // Use findOneAndDelete or deleteOne instead of findByIdAndRemove
    await Costume.findOneAndDelete({ _id: costumeId });

    res.status(200).json({ message: 'Costume has been deleted successfully!', costumeId });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};