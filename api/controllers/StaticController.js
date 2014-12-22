/**
 * StaticController
 *
 * @description :: Server-side logic for managing statics
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  serveSPA: function(req, res) {

    if(req.session.authenticated) {

      var name = req.session.User.name;
      var id = req.session.User.id;

      res.view('angular/index', { layout: 'angular-layout',  _name: name, isAuth: true, id: id });

    } else { 

      res.view('static/index', { layout: 'public-layout'});
  
    }

  }
	
};

