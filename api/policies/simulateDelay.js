module.exports = function simulateDelay (req, res, next) {
  setTimeout(function (){
    next();
  }, 1000);
};
