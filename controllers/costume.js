// COSTUME CONTROLLER

const { validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const Costume = require("../models/costume");
const User = require("../models/user");
const Rental = require("../models/rental");

// Place Controller functions here:

// GET EXPORTS:

//Get the list of costumes
exports.getCostumes = async (req, res, next) => {
  // Commented out pagination code that will be used with frontend

  // const page = +req.query.page || 1;
  // const perPage = 3;
  try {
    // const totalItems = await Costume.find().countDocuments()
    // if (!totalItems) {
    //   const error = new Error('No costumes found!');
    //   error.statusCode = 404;
    //   throw error;
    // }
    const costumes = await Costume.find();
    // .skip((page - 1) * perPage)
    // .limit(perPage);
    if (!costumes) {
      const error = new Error("No costumes found!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Fetched costumes successfully.",
      costumes: costumes,
      // totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Get the details of a single costume by costume id
exports.getCostume = async (req, res, next) => {
  const costumeId = req.params.costumeId;

  try {
    const costume = await Costume.findById(costumeId);
    if (!costume) {
      const error = new Error("Could not find costume");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Costume Found",
      costume: costume,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Get the user's cart info for added costumes in the cart
exports.getCart = async (req, res, next) => {
  const userId = req.userId;
  let cartUser = await User.findOne({ _id: userId });
  const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = new Error('Validation failed.');
  //   error.statusCode = 422;
  //   error.data = errors.array();
  //   throw error;
  // }
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    await cartUser.cart.populate("items.costumeId");
    if (!cartUser.cart) {
      const error = new Error("No items in cart!");
      error.statusCode = 404;
      throw error;
    }
    const costumes = cartUser.cart.items;
    res.status(200).json({
      pageTitle: "Your Cart",
      costumes: costumes,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Get checkout for payments
exports.getCheckout = async (req, res, next) => {
  let host = "localhost:8080";
  //let host = process.env.HEROKU_APP;
  console.log(host);
  try {
    const checkoutUser = await User.findById(req.userId);

    await checkoutUser.cart.populate("items.costumeId");
    if (!checkoutUser.cart) {
      const error = new Error("No items in cart!");
      error.statusCode = 404;
      throw error;
    }
    const costumes = checkoutUser.cart.items;

    let existingStripeCustomer;
    let stripeCustomer;

    try {
      console.log("IN TRY RETRIEVE EXISTING USER BLOCK");
      console.log("email filter:", checkoutUser.email);
      existingStripeCustomerList = await stripe.customers.list({
        email: checkoutUser.email,
      });
      console.log("NO ERR?", existingStripeCustomerList.data);
      stripeCustomer = existingStripeCustomerList.data.id;
      console.log("STRIPE CUSTOMER:", stripeCustomer);
    } catch (err) {
      console.log(err);
      console.log("EXISTING CUSTOMER:", existingStripeCustomer);

      if (!stripeCustomer) {
        console.log("IN IF NOT EXISTING BLOCK");
        stripeCustomer = await stripe.customers.create({
          description: "Test Customer (created for test Checkout)",
          email: checkoutUser.email,
          metadata: { userId: checkoutUser.userId },
        });
      }
    }

    if (!stripeCustomer) {
      console.log("IN CHECK AFTER BLOCK");
      stripeCustomer = await stripe.customers.create({
        description: "Test Customer (created for test Checkout)",
        email: checkoutUser.email,
        metadata: { userId: checkoutUser.userId },
      });
    }

    console.log("STRIPE CUSTOMER SENDING TO CHECKOUT:", stripeCustomer);
    const lineItems = costumes.map((p) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: p.costumeId.costumeName,
          },
          unit_amount: p.costumeId.rentalFee * 100,
        },
        quantity: p.quantity,
      };
    });

    console.log(lineItems);

    const paymentResult = await stripe.checkout.sessions.create({
      customer: `${stripeCustomer.id}`,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",

      //  *** url still needs to END with success?session_id={CHECKOUT_SESSION_ID} ! ***
      success_url:
        req.protocol +
        "://" +
        host +
        "/checkout/success?session_id={CHECKOUT_SESSION_ID}", // => http://localhost:3000
      cancel_url: req.protocol + "://" + host + "/checkout/cancel",
    });
    console.log(paymentResult);
    return res.status(200).json({
      message: "Payment session initiated",
      url: paymentResult.url,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Gets successful checkout and clears user cart
exports.getCheckoutSuccess = async (req, res, next) => {
  const sessionId = req.query.session_id;
  console.log("REQ.QUERY.SESSION_ID", sessionId);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customer = await stripe.customers.retrieve(session.customer);

    console.log(customer);

    const checkoutUser = await User.findOne({ email: customer.email });

    console.log("FOUND USER:", checkoutUser.email);
    const cartItems = await checkoutUser.cart.populate("items.costumeId");
    console.log("POPULATED CART:", cartItems.length);
    const costumes = checkoutUser.cart.items.map((i) => {
      return { quantity: i.quantity, costume: { ...i.costumeId._doc } };
    });

    console.log("MAPPED COSTUMES:", costumes);
    console.log(checkoutUser._id, checkoutUser);

    const rental = new Rental({
      user: {
        email: checkoutUser.email,
        userId: checkoutUser._id,
      },
      costumes: costumes,
    });

    console.log("CREATED RENTAL ORDER:", rental);

    const completedRental = await rental.save();
    await checkoutUser.clearCart();
    console.log("RENTAL COMPLETED:", completedRental._doc);
    return res.status(200).json({
      message: "Rental placed successfully!",
      rental: completedRental._doc,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//Get rentals for a user
exports.getRentals = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  try {
    const rentals = await Rental.find({
      "user.userId": req.userId,
    });

    return res.status(200).json({
      pageTitle: "Your Rentals",
      rentals: rentals,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Get invoice for completed rental
exports.getInvoice = async (req, res, next) => {
  const rentalId = req.params.rentalId;
  try {
    const rental = await Rental.findById(rentalId);

    return res.status(200).json({
      pageTitle: "Rental " + rental._id,
      rental: rental,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// POST EXPORTS:

//Add a costume to the cart
exports.postCart = async (req, res, next) => {
  const costumeId = req.body.costumeId;
  const userId = req.body.userId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  try {
    const reqUser = await User.findById(userId);
    if (!reqUser) {
      const error = new Error("Cannot locate user for cart.");
      error.statusCode = 404;
      throw error;
    }

    console.log(req.body);
    const cartCostume = await Costume.findById(costumeId);
    if (!cartCostume) {
      console.log(costumeId);
      const error = new Error("Cannot locate costume for cart.");
      error.statusCode = 404;
      throw error;
    }

    await reqUser.addToCart(cartCostume);

    res.status(200).json({
      message: "Costume added to cart",
      costumeId: costumeId,
      userId: req.userId,
      cart: reqUser.cart.items,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// DELETE EXPORTS

//Remove costume from cart
exports.deleteCostumeFromCart = async (req, res, next) => {
  const costumeId = req.body.costumeId;
  console.log("REQUEST BODY:", req.body);
  console.log("made it to the controller!", costumeId);
  if (!costumeId) {
    return res.status(404).json({ message: "No costumeId in request body!" });
  }
  try {
    const cartUser = await User.findById(req.userId);
    console.log("Found a user!", cartUser.email);
    await cartUser.removeFromCart(costumeId);
    res.status(200).json({
      message: "Costume deleted from cart",
      costumeId: costumeId,
      userId: req.userId,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createRental = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  try {
    const { costumes, user } = req.body;

    const newRental = new Rental({
      costumes,
      user,
    });

    const savedRental = await newRental.save();

    res.status(201).json({
      message: "Rental created successfully",
      rental: savedRental,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
