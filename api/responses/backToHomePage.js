/**
 * Usage:
 *
 * ```
 * res.backToHomePage();
 * ```
 *
 */

module.exports = function backToHomePage (){

  // Get access to `req` and `res`
  // (since the arguments are up to us)
  var req = this.req;
  var res = this.res;

  // All done- either send back a 200 OK message (e.g. for AJAX requests)
  if (req.wantsJSON) {
    return res.ok();
  }
  // or redirect to the home page
  return res.redirect('/');
};
