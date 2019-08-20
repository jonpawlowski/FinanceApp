// Wrote it to a file because I couldn't figure out how to assign it to a variable
/*await col.distinct("vendor", {}, function(err,vendors){
  const vendorJSON = JSON.stringify(vendors);
  fs.writeFile('./src/config/vendorList.json', vendorJSON, 'utf8', function(err, result) {
    if(err) console.log('error', err);
  });
});*/

//console.log("*********distinct vendors are " + req.session.distinctVendors);
//Get vendor list from file and sort for easier reading
//const vendorList = JSON.parse(fs.readFileSync('./src/config/vendorList.json', 'utf8'));
/*vendorList.sort(function(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
});*/
//console.log("*************Number of distinct vendors is " + vendorList[0].chargeDate);
