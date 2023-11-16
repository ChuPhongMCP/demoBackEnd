const moment = require('moment');
const { sortObject } = require('../../helper');

module.exports = {
  createPayment: async (req, res, next) => {
    try {

      process.env.TZ = 'Asia/Ho_Chi_Minh';

      let date = new Date();
      let createDate = moment(date).format('YYYYMMDDHHmmss');

      let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let tmnCode = process.env.vnp_TmnCode;
      let secretKey = process.env.vnp_HashSecret;
      let vnpUrl = process.env.vnp_Url;
      let returnUrl = process.env.vnp_ReturnUrl;
      let orderId = moment(date).format('DDHHmmss');
      let amount = parseInt(req.body.amount);
      let bankCode = req.body.bankCode;

      let locale = req.body.language;
      if (locale === null || locale === '') {
        locale = 'vn';
      }
      let currCode = 'VND';

      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      let querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

      console.log('««««« vnpUrl »»»»»', vnpUrl);

      // console.log('««««« amount »»»»»', amount);

      // res.redirect(vnpUrl);
      return res.send(200, {
        statusCode: 200,
        url: vnpUrl,
      });
    } catch (error) {
      return res.send(500, {
        statusCode: 500,
        error,
      });
    }
  },

  checkReturn: async (req, res, next) => {
    try {
      let vnp_Params = req.query;

      let secureHash = vnp_Params['vnp_SecureHash'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      vnp_Params = sortObject(vnp_Params);

      let tmnCode = process.env.vnp_TmnCode;
      let secretKey = process.env.vnp_HashSecret;

      let querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

      if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        return res.send(200, {
          statusCode: vnp_Params['vnp_ResponseCode'],
        });
      } else {
        return res.send(400, {
          statusCode: 97,
        });
      }
    } catch (error) {
      console.log('««««« error »»»»»', error);
      return res.send(500, {
        statusCode: 500,
        error,
      });
    }
  },

  checkIpn: async (req, res, next) => {
    try {
      let vnp_Params = req.query;
      let secureHash = vnp_Params['vnp_SecureHash'];

      let orderId = vnp_Params['vnp_TxnRef'];
      let amount = vnp_Params['vnp_Amount']
      let rspCode = vnp_Params['vnp_ResponseCode'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      vnp_Params = sortObject(vnp_Params);

      console.log('««««« vnp_Params »»»»»', vnp_Params);

      let secretKey = process.env.vnp_HashSecret;
      let querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

      let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
      //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
      //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

      let checkOrderId = orderId === orderId; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
      let checkAmount = amount === amount; // Kiểm tra số tiền "giá trị của vnp_Amount/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
      if (secureHash === signed) { //kiểm tra checksum
        if (checkOrderId) {
          if (checkAmount) {
            if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
              if (rspCode == "00") {
                //thanh cong
                paymentStatus = '1'
                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                res.status(200).json({ RspCode: rspCode, Message: 'Success' })
              }
              else {
                //that bai
                paymentStatus = '2'
                // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                res.status(200).json({ RspCode: rspCode, Message: 'Failed' })
              }
            }
            else {
              res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
            }
          }
          else {
            res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
          }
        }
        else {
          res.status(200).json({ RspCode: '01', Message: 'Order not found' })
        }
      }
      else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
      }
    } catch (error) {
      console.log('««««« error »»»»»', error);
      return res.send(500, {
        statusCode: 500,
        error,
      });
    }
  }
}