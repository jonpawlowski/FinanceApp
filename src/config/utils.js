const util = require('util');

  // Get list of vendors from the last year for auto-complete in the form.
  // The DB query grabs all vendors from the last year getting only the vendor field.
function getVendorsList(col) {
    // Re-use existing connection from app.js file. This creates a MongoDB connection pool
    //client = mongoDB.get();
    //const db = client.db(global.gConfig.database);
    ///const col = db.collection(global.gConfig.collection);
      // Get list of vendors from the last year for auto-complete in the form.
      // The DB query grabs all vendors from the last year getting only the vendor field.
      //console.log(util.inspect(col, {showHidden: false, depth: null}));
      const allVendors = col.find({
        "chargeDate" : {
          $lt: new Date(),
          $gte: new Date(new Date().setDate(new Date().getDate()-365))
        }
      }).project({ _id : 0, vendor : 1 }).toArray();
      //console.log("*****Executed all vendors find " + util.inspect(allVendors, {showHidden: false, depth: null}));

      // Use JS ES6 Set function to only get unique vendors
      var vendorList = [...new Set(allVendors.map(item => item.vendor))];
      console.log("***** Got only unique vendors!");
      // Sort the vendor list alphabetically
      vendorList.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      console.log("***** vendor list length is NOW " + vendorList.length);

      console.log("***** vendor list length is THEN" + vendorList.length);
      return vendorList;

  }

  module.exports = {
    getVendorsList
  };
