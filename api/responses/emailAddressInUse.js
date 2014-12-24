module.exports = function emailAddressInUse (){
  var req = this.req;
  var res = this.res;

  return res.send(409, 'Email address is already taken by another user.');
};
