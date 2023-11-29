const { Cart, Customer, Product } = require('../../models');
const { asyncForEach } = require('../../helper');

module.exports = {
  getDetail: async (req, res, next) => {
    try {
      const customerId = req.user._id;

      let found = await Cart.findOne({ customerId })
        .populate({
          path: 'products.product',
        });

      if (found) {
        return res.send(200, { statusCode: 200, payload: found });
      }

      return res.status(404).send({ statusCode: 404, message: 'Not found' });
    } catch (err) {
      res.status(500).json({
        message: 'Internal server error',
        payload: err,
      });
    }
  },

  addProduct: async function (req, res, next) {
    try {
      const customerId = req.user._id;
      const { productId, quantity, price, shipping } = req.body;

      const [customer, foundProduct] = await Promise.all([
        Customer.findById(customerId),
        Product.findById(productId),
      ]);

      const errors = [];
      if (!customer || customer.isDelete) errors.push('User does not exist');

      if (!foundProduct || foundProduct.isDelete)
        errors.push('Product does not exist');

      if (foundProduct && quantity > foundProduct.stock)
        errors.push('Product quantity is invalid');

      if (errors.length > 0) {
        return res.status(404).json({
          code: 404,
          message: 'Error',
          errors,
        });
      }

      const cart = await Cart.findOne({ customerId });

      if (cart) {
        let updateCart;

        const foundCartItem = cart.products.find(
          (item) => item.productId.toString() === productId.toString()
        );

        if (foundCartItem) {
          const checkStock = (foundCartItem.quantity + quantity) <= foundProduct.stock

          if (!checkStock) {
            return res.send(400, {
              statusCode: 400,
              message: `stock of product ${foundProduct._id} is invalid`
            })
          }

          updateCart = cart.products.map((item) => {
            if (productId.toString() === item.productId.toString()) {
              const nextQuantity = quantity + item.quantity;

              item.quantity = nextQuantity;
            }

            return item;
          })

          console.log('««««« updateCart »»»»»', updateCart);
        } else {
          updateCart = [
            ...cart.products,
            {
              productId,
              quantity,
              price,
            },
          ];

          console.log('««««« updateCart »»»»»', updateCart);
        }


        await Cart.findOneAndUpdate(
          { _id: cart._id },
          {
            customerId,
            products: updateCart,
            shipping: parseFloat(shipping),
            $inc: {
              totalItem: parseInt(quantity),
              subtotal: parseInt(quantity) * parseFloat(price),
              total: parseInt(quantity) * parseFloat(price),
            },
          }
        );

        const result = await Cart.findOne({ customerId });

        return res.json({
          code: 200,
          message: 'Add product success',
          payload: result,
        });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error,
      });
    }
  },

  // addProduct: async function (req, res, next) {
  //   try {
  //     const customerId = req.user._id;
  //     const { productId, quantity, price, shipping } = req.body;

  //     const getCustomer = Customer.findById(customerId);
  //     const getProduct = Product.findById(productId);

  //     const [customer, foundProduct] = await Promise.all([
  //       getCustomer,
  //       getProduct,
  //     ]);

  //     const errors = [];
  //     if (!customer || customer.isDelete)
  //       errors.push('User does not exist');

  //     if (!foundProduct || foundProduct.isDelete)
  //       errors.push('Product does not exist');

  //     if (foundProduct && quantity > foundProduct.stock)
  //       errors.push('Product quantity is invalid');

  //     if (errors.length > 0) {
  //       return res.status(404).json({
  //         code: 404,
  //         message: 'Error',
  //         errors,
  //       });
  //     }

  //     const cart = await Cart.findOne({ customerId })

  //     if (cart) {
  //       let updateCart;

  //       const foundCartItem = cart.products.find((item) => item.productId == productId)

  //       console.log('««««« productId »»»»»', productId);
  //       console.log('««««« foundCartItem »»»»»', foundCartItem);

  //       if (foundCartItem) {
  //         updateCart = cart.products.map((item) => {
  //           if (item.productId == productId) {
  //             const nextQuantity = item.quantity + quantity

  //             if (nextQuantity > foundProduct.stock) {
  //               return res.send(400, {
  //                 statusCode: 400,
  //                 message: `Stock of productId ${productId} is invalid`
  //               });
  //             } else {
  //               return { ...item, quantity: nextQuantity };
  //             }
  //           }

  //           return item;
  //         })
  //       } else {
  //         updateCart = [
  //           ...cart.products,
  //           {
  //             productId,
  //             quantity,
  //             price,
  //           }
  //         ]
  //       }

  //       console.log('««««« updateCart »»»»»', updateCart);

  //       await Cart.findOneAndUpdate(cart._id, {
  //         customerId,
  //         products: updateCart,
  //         shipping: parseFloat(shipping),
  //         $inc: {
  //           totalItem: parseInt(quantity),
  //           subtotal: parseInt(quantity) * parseFloat(price),
  //           total: parseInt(quantity) * parseFloat(price),
  //         },
  //       });

  //       result = await Cart.findOne({ customerId });

  //       return res.send({
  //         code: 200,
  //         message: 'Add product success',
  //         payload: result,
  //       });
  //     }
  //   } catch (error) {
  //     return res.status(500).json({
  //       statusCode: 500,
  //       message: "Internal server error",
  //       error: err
  //     });
  //   }
  // try {
  //   const customerId = req.user._id;

  //   const { productId, quantity, price, shipping } = req.body;

  //   const getCustomer = Customer.findById(customerId);
  //   const getProduct = Product.findById(productId);

  //   const [customer, foundProduct] = await Promise.all([
  //     getCustomer,
  //     getProduct,
  //   ]);

  //   const errors = [];
  //   if (!customer || customer.isDelete)
  //     errors.push('User does not exist');
  //   if (!foundProduct || foundProduct.isDelete)
  //     errors.push('Product does not exist');

  //   if (foundProduct && quantity > foundProduct.stock)
  //     errors.push('Product quantity is invalid');

  //   if (errors.length > 0) {
  //     return res.status(404).json({
  //       code: 404,
  //       message: 'Error',
  //       errors,
  //     });
  //   }

  //   const cart = await Cart.findOne({ customerId })

  //   let result = {};

  //   if (cart) { // GIỏ hàng đã tồn tại
  //     const cartItem = cart.products.find((item) => item.id === productId);

  //     let newProductCart;

  //     if (cartItem) {
  //       newProductCart = cart.products.map((item) => {
  //         if (productId === item.productId) {
  //           const nextQuantity = quantity + item.quantity;

  //           if (nextQuantity > foundProduct.stock) {
  //             return res.send(400, {
  //               statusCode: 400,
  //               message: `Số lượng sản phẩm ${productId} không khả dụng`,
  //             });
  //           } else {
  //             item.quantity = nextQuantity;
  //           }
  //         }

  //         return item;
  //       })
  //     } else {
  //       newProductCart = [...cart.products, { productId, quantity, price }];
  //     }

  //     // const calSubtotal = parseInt(quantity) * parseFloat(price);
  //     // const calTotal = parseInt(quantity) * parseFloat(price) + parseFloat(shipping);

  //     await Cart.findOneAndUpdate(cart._id, {
  //       customerId,
  //       products: newProductCart,
  //       shipping: parseFloat(shipping),
  //       $inc: {
  //         totalItem: parseInt(quantity),
  //         subtotal: parseInt(quantity) * parseFloat(price),
  //         total: parseInt(quantity) * parseFloat(price),
  //       },
  //     });
  //   } else { // Chưa có giỏ hàng
  //     const newItem = new Cart({
  //       customerId,
  //       products: [
  //         {
  //           productId,
  //           quantity,
  //           price,
  //         }
  //       ],
  //       totalItem: parseInt(quantity),
  //       subtotal: parseInt(quantity) * parseFloat(price),
  //       shipping: parseFloat(shipping),
  //       total: parseInt(quantity) * parseFloat(price) + parseFloat(shipping),
  //     });

  //     await newItem.save();
  //   }

  //   result = await Cart.findOne({ customerId });

  //   return res.send({
  //     code: 200,
  //     message: 'Add product success',
  //     payload: result,
  //   });
  // } catch (err) {
  //   console.log('««««« err »»»»»', err);
  //   return res.status(500).json({ code: 500, error: err });
  // }
  // },

  remove: async function (req, res, next) {
    try {
      const { productId } = req.body;

      console.log('««««« productId »»»»»', productId);

      const customerId = req.user._id;

      let cart = await Cart.findOne({ customerId });

      if (!cart) {
        return res.status(404).json({
          code: 404,
          message: 'Cart not found',
        });
      }

      const updateCart = cart.products.filter((item) => item.productId.toString() !== productId.toString());
      console.log('««««« updateCart »»»»»', updateCart);

      await Cart.findOneAndUpdate(
        { _id: cart._id },
        {
          customerId,
          products: updateCart,
        }
      );

      const result = await Cart.findOne({ customerId });

      return res.json({
        code: 200,
        message: 'Remove success',
        payload: result,
      });
    } catch (err) {
      return res.status(500).json({ code: 500, error: err });
    }
  },
};
